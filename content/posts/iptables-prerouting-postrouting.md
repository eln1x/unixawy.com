---
title: "Advanced iptables: PREROUTING and POSTROUTING with DNAT and SNAT"
date: 2016-07-14T16:08:25+00:00
url: "/iptables-prerouting-postrouting/"
draft: false
description: "A guide to implementing complex traffic redirection and routing across multi-homed Linux servers using Netfilter PREROUTING (DNAT) and POSTROUTING (SNAT/MASQUERADE)."
categories: ["Linux", "Networking", "Security"]
tags: ["linux", "iptables", "netfilter", "dnat", "snat", "routing", "sysadmin"]
---

When deploying jump hosts, transparent proxies, or network bridges across multi-homed Linux systems, standard routing tables are often insufficient. Using the Linux Netfilter framework via `iptables`, you can manipulate packets at both ingress (**PREROUTING**) and egress (**POSTROUTING**).

---

### Scenario 1: Basic Traffic Forwarding via DNAT and MASQUERADE

In this setup, our Linux server acts as an intermediary bridge forwarding traffic from a client to a remote backend service:

- **Client Source IP:** `198.51.100.12`
- **Intermediary Gateway (Our Server):** `203.0.113.30`
- **Final Backend Destination:** `192.0.2.84`

```text
Client [198.51.100.12] ──► Gateway [203.0.113.30] ──► Backend [192.0.2.84]
```

#### Step 1: Destination NAT in PREROUTING
Intercept incoming packets destined for our gateway and rewrite the destination IP before routing lookup occurs:

```bash
sudo iptables -t nat -A PREROUTING -s 198.51.100.12 -j DNAT --to-destination 192.0.2.84
```

#### Step 2: Source NAT / MASQUERADE in POSTROUTING
To ensure the backend server (`192.0.2.84`) sends return replies back to our gateway rather than attempting to route directly to the client, rewrite the source address to the gateway's outbound interface IP:

```bash
sudo iptables -t nat -A POSTROUTING -d 192.0.2.84 -j MASQUERADE
```

---

### Scenario 2: Policy Routing and SNAT on Multi-Homed Servers

If your server has multiple physical or virtual network interfaces and you must guarantee outbound traffic exits using a specific IP:

- `eth0`: `203.0.113.30` (Primary Management)
- `eth1`: `203.0.113.45` (Dedicated Egress IP)
- `eth2`: `203.0.113.90` (Private Storage Network)

#### Enforcing Outbound Egress IP via SNAT
To force all forwarded traffic destined for `192.0.2.84` to exit with source IP `203.0.113.45`:

```bash
sudo iptables -t nat -I POSTROUTING -d 192.0.2.84 -j SNAT --to-source 203.0.113.45
```

By placing this rule in **POSTROUTING**, the kernel alters the packet source header at the final stage before transmission onto the wire.

---

### Enabling Kernel Packet Forwarding

By default, the Linux kernel drops packets not destined for local sockets. You must enable IP forwarding:

```bash
# Apply dynamically
sudo sysctl -w net.ipv4.ip_forward=1

# Persist across reboots in /etc/sysctl.d/99-ipforward.conf:
echo "net.ipv4.ip_forward = 1" | sudo tee /etc/sysctl.d/99-ipforward.conf
```

Verify that the `FORWARD` filter chain permits the traffic:

```bash
sudo iptables -A FORWARD -m state --state RELATED,ESTABLISHED -j ACCEPT
sudo iptables -A FORWARD -d 192.0.2.84 -j ACCEPT
```
