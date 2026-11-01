---
title: "Regular Expressions for Extracting MAC Addresses in Incident Response"
date: 2015-07-31T00:49:11+00:00
url: "/regex-to-find-mac-address/"
draft: false
description: "Practical regular expressions and grep commands to parse, extract, and validate MAC addresses from system logs, network captures, and digital forensics evidence."
categories: ["blog", "Linux", "Security"]
---

During digital forensics and incident response investigations, analyzing DHCP leases, ARP caches, firewall events, and syslog entries often requires extracting physical network hardware addresses (MAC addresses).

A standard IEEE 802 MAC-48 address consists of six groups of two hexadecimal digits separated by colons (`00:1A:2B:3C:4D:5E`) or hyphens (`00-1A-2B-3C-4D-5E`), or three groups of four hexadecimal digits separated by dots (`001a.2b3c.4d5e`).

---

## 1. Extracting MAC Addresses with `grep`

### Standard Colon-Separated Format

To extract colon-delimited MAC addresses using extended regular expressions (`grep -E`):

```bash
grep -E -o '([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}' /var/log/syslog
```

Using POSIX Basic Regular Expression syntax:

```bash
grep -o '[0-9a-fA-F]\{2\}\(:[0-9a-fA-F]\{2\}\)\{5\}' /var/log/messages
```

### Flexible Pattern (Colons, Hyphens, or Cisco Dot Notation)

In heterogenous enterprise networks, different vendors format MAC addresses differently:
- Linux / UNIX: `00:11:22:33:44:55`
- Windows: `00-11-22-33-44-55`
- Cisco IOS: `0011.2233.4455`

To match both colon and hyphen separators with boundary checking:

```bash
grep -E -i -o '\b([0-9a-f]{2}[:-]){5}([0-9a-f]{2})\b' /var/log/messages
```

---

## 2. Python Extraction Script for Large Log Files

When processing multi-gigabyte log archives, Python's `re` module allows extracting unique hardware addresses alongside frequency counting:

```python
#!/usr/bin/env python3
import re
import sys
from collections import Counter

MAC_REGEX = re.compile(r'\b(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})\b')

def parse_macs(filename):
    counter = Counter()
    with open(filename, 'r', errors='ignore') as f:
        for line in f:
            matches = MAC_REGEX.findall(line)
            for mac in matches:
                normalized = mac.upper().replace('-', ':')
                counter[normalized] += 1
                
    print(f"{'MAC Address':<20} | {'Count'}")
    print("-" * 30)
    for mac, count in counter.most_common():
        print(f"{mac:<20} | {count}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python parse_macs.py <logfile>")
        sys.exit(1)
    parse_macs(sys.argv[1])
```
