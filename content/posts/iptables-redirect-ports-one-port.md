---
title: "IPTABLES redirect all ports to one port"
date: 2015-01-08T21:27:08+00:00
url: "/iptables-redirect-ports-one-port/"
draft: false
description: "hello this iptables rule to redirect all incoming traffic from all ports to one port example 80 on ip 192.168.1.10 enjoy"
categories: ["blog", "Firewall", "Linux"]
---

hello this  iptables rule

to redirect all incoming traffic from all ports to one port example 80 on ip 192.168.1.10

```
iptables -A PREROUTE -t nat -i eth0 -p tcp  --dport 1:65535 -j DNAT --to-destination 192.168.1.10:80
```

enjoy
