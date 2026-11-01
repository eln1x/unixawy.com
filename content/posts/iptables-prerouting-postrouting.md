---
title: "IPtables PREROUTING, POSTROUTING  for mixed interfaces via DNAT & SNAT"
date: 2016-07-14T16:08:25+00:00
url: "/iptables-prerouting-postrouting/"
draft: false
description: "Traffic Forwarding with iptables Let’s get straight to the point. We are looking at two specific networking scenarios: 1. Simple Traffic Forwarding: Routing..."
categories: ["blog", "Firewall", "Linux", "tech"]
---

## Traffic Forwarding with iptables

Let’s get straight to the point. We are looking at two specific networking scenarios:

1. **Simple Traffic Forwarding:** Routing traffic from a specific Source IP through our server to a new destination.

2. **Interface-Specific Forwarding:** Routing traffic through a specific network interface/IP on a multi-homed server.

The `iptables` tool uses the **PREROUTING** chain within the **NAT** table to intercept and modify packets as they enter the system, before any routing decisions are made.

### Scenario 1: Basic DNAT Forwarding

In this scenario, we want to redirect traffic coming from a specific source to a new destination via our server.

**The Setup:**

- **Source IP:** `191.114.119.12`

- **Our Server IP:** `27.39.03.30`

- **Final Destination IP:** `89.23.39.84`

**The Flow:**

`191.114.119.12` $\leftrightarrow$ `27.39.03.30` (Our Box) $\leftrightarrow$ `89.23.39.84`

**The Commands:**

To change the destination of the incoming packet:

Bash

```
iptables -t nat -A PREROUTING -s 191.114.119.12 -j DNAT --to-destination 89.23.39.84
```

- **-t nat**: Specifies the NAT table (used for translating source or destination fields).

- **-A PREROUTING**: Appends the rule to the PREROUTING chain.

- **-s**: Defines the Source IP.

- **-j DNAT**: The "jump" target; performs Destination Network Address Translation.

- **--to-destination**: Defines the final destination.

To ensure the destination server replies back to our box (rather than trying to reply directly to the source), we use **MASQUERADE**:

Bash

```
iptables -t nat -A POSTROUTING -j MASQUERADE
```

---

### Scenario 2: SNAT with Multiple Interfaces

If your server has multiple interfaces and you want traffic to exit through a specific IP (e.g., `eth1`), you need to use **SNAT** (Source NAT).

**The Setup:**

- **eth0:** `27.39.03.30`

- **eth1:** `27.39.04.5`

- **eth2:** `27.39.24.1`

**The Command:**

To force traffic destined for `89.23.39.84` to leave via the `eth1` IP:

Bash

```
iptables -t nat -I POSTROUTING -d 89.23.39.84 -j SNAT --to 27.39.04.5
```

**The Logic:**

We use the **POSTROUTING** chain because this happens just as the packet is leaving the server. By using **SNAT**, we rewrite the source address to `27.39.04.5`.

**The Updated Flow:**

`191.114.119.12` $\leftrightarrow$ `27.39.03.30` $\leftrightarrow$ **`27.39.04.5`** $\leftrightarrow$ `89.23.39.84`

---

### Final Step: Enable Kernel Forwarding

None of the rules above will work unless the Linux kernel is allowed to pass packets between interfaces. You must enable IP forwarding:

Bash

```
<span class="hljs-comment"># To apply immediately:</span>
<span class="hljs-built_in">echo</span> 1 > /proc/sys/net/ipv4/ip_forward

<span class="hljs-comment"># To make it permanent, edit /etc/sysctl.conf and set:</span>
net.ipv4.ip_forward = 1
```

Happy networking!
