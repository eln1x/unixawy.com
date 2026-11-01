---
title: "Port Forwarding and Redirection with iptables DNAT"
date: 2015-01-08T21:27:08+00:00
url: "/iptables-redirect-ports-one-port/"
draft: false
description: "How to use Linux Netfilter iptables PREROUTING rules with DNAT to redirect broad port ranges or all incoming TCP traffic to a single destination port."
categories: ["Linux", "Networking", "Security"]
tags: ["linux", "iptables", "firewall", "nat", "dnat", "sysadmin"]
---

In honeypot deployments, captive portals, or specialized traffic inspection environments, administrators often need to forward all incoming traffic—regardless of destination port—to a single listening service (such as an HTTP inspection proxy or logging daemon).

This can be accomplished at line rate within the Linux kernel using **Netfilter Destination NAT (DNAT)** via `iptables`.

---

### Redirecting Inbound Port Ranges via DNAT

To redirect all incoming TCP traffic across ports `1` through `65535` arriving on interface `eth0` to an internal service listening on port `80` at `192.168.1.10`:

```bash
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 1:65535 -j DNAT --to-destination 192.168.1.10:80
```

#### Breaking Down the Rule:
- `-t nat`: Specifies the Network Address Translation table.
- `-A PREROUTING`: Appends the rule to the PREROUTING chain, altering packets immediately upon arrival before routing decisions are made.
- `-i eth0`: Matches traffic entering on network interface `eth0`.
- `-p tcp --dport 1:65535`: Matches all TCP destination ports from 1 through 65535.
- `-j DNAT --to-destination 192.168.1.10:80`: Rewrites the destination IP and port to `192.168.1.10:80`.

---

### Prerequisites & Forwarding Configuration

1. **Enable IPv4 Packet Forwarding in the Kernel:**
   ```bash
   sudo sysctl -w net.ipv4.ip_forward=1
   ```

2. **Permit Forwarded Packets in the FILTER Table:**
   Ensure your firewall allows forwarded traffic to the target host:
   ```bash
   sudo iptables -A FORWARD -i eth0 -d 192.168.1.10 -p tcp --dport 80 -j ACCEPT
   ```

3. **Redirecting to Localhost (Local Redirection):**
   If the target service runs on the same machine rather than an external IP, use the `REDIRECT` target instead of `DNAT`:
   ```bash
   sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 1:65535 -j REDIRECT --to-ports 8080
   ```
