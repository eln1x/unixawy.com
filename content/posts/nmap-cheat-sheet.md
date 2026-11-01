---
title: "Nmap Network Scanning & Reconnaissance Cheat Sheet"
date: 2015-02-03T02:17:38+00:00
url: "/nmap-cheat-sheet/"
draft: false
description: "A comprehensive reference guide for Nmap network discovery, TCP/UDP scanning techniques, evasion flags, protocol audits, and NSE scripts."
categories: ["Security", "Networking"]
tags: ["nmap", "reconnaissance", "port-scanning", "network-security", "penetration-testing", "cheat-sheet"]
---

**Nmap ("Network Mapper")** is the industry standard for network discovery, port scanning, and vulnerability surface mapping.

This cheat sheet compiles the most critical scanning flags categorized by operational objective.

---

### 1. Host Discovery (Ping Sweeps)

Determine which hosts are alive on a target network without performing full port scans:

```bash
# ICMP Echo Request
nmap -sn -PE <target_range>

# ICMP Timestamp & Address Mask Requests
nmap -sn -PP <target_range>
nmap -sn -PM <target_range>

# ARP Ping (fastest for local subnet discovery)
nmap -sn -PR <local_subnet>

# TCP SYN / ACK Ping (probes ports without full scan)
nmap -sn -PS22,80,443 <target_range>
nmap -sn -PA80,443 <target_range>
```

---

### 2. Core Port Scanning Techniques

| Flag | Scan Type | Description |
| :--- | :--- | :--- |
| **`-sS`** | **TCP SYN (Stealth)** | Default scan. Sends SYN, receives SYN/ACK, then sends RST without completing handshake. Stealthy and fast. |
| **`-sT`** | **TCP Connect** | Completes the full 3-way handshake (`connect()` syscall). Used when unprivileged or behind strict proxies. |
| **`-sU`** | **UDP Scan** | Probes UDP endpoints (DNS, SNMP, NTP, DHCP). Slower because closed ports return ICMP port unreachable. |
| **`-sV`** | **Version Detection** | Interrogates open ports to determine service name and version numbers. |
| **`-sA`** | **TCP ACK Scan** | Maps firewall rules and state tables (determines filtered vs. unfiltered ports). |
| **`-sW`** | **TCP Window Scan** | Exploits anomalies in TCP Window sizes of certain OS implementations. |

```bash
# Typical comprehensive scan:
nmap -sS -sV -sC -O -p- -T4 <target>
```

---

### 3. Advanced & Inverse TCP Scans (Bypassing Stateless Firewalls)

Inverse scans manipulate TCP header flags (RFC 793). Open ports drop the packet without reply, whereas closed ports respond with a `RST`:

```bash
# NULL Scan (No flags set)
nmap -sN <target>

# FIN Scan (Only FIN flag set)
nmap -sF <target>

# Xmas Scan (FIN, PSH, and URG flags set - lights up like a Christmas tree)
nmap -sX <target>

# Maimon Scan (FIN/ACK)
nmap -sM <target>
```

---

### 4. Advanced Evasion & Identity Spoofing

```bash
# Idle / Zombie Scan (Blind scan using an IP ID idle host)
nmap -sI <zombie_host> <target>

# Spoof Source IP Address
nmap -e eth0 -Pn -S <spoofed_ip> <target>

# Spoof MAC Address
nmap --spoof-mac 00:11:22:33:44:55 <target>

# Fragment Packets into 8-byte chunks (splits TCP headers across packets)
nmap -f <target>
```

---

### 5. Specialized Protocols

```bash
# SCTP INIT and Cookie-Echo Scans (common in telecommunication networks)
nmap -sY <target>
nmap -sZ <target>

# Raw IP Protocol Scan (discovers which IP protocols: ICMP, TCP, UDP, GRE, ESP are supported)
nmap -sO <target>
```
