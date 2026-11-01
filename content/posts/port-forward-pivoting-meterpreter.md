---
title: "port forward & pivoting  with meterpreter"
date: 2015-01-08T22:55:55+00:00
url: "/port-forward-pivoting-meterpreter/"
draft: false
description: "Let's assume u attacked machine with 2 nic cards our IP is 10.0.0.5 first, one ip is 10.0.0.10 that you reach it from and in ifconfig shows, the machine has a..."
categories: ["blog", "Security", "tech"]
---

Let's assume u attacked machine with 2 nic cards

our IP is 10.0.0.5

first, one ip is 10.0.0.10 that you reach it from

and in ifconfig shows, the machine has a different  IP 10.0.2.30

you can scan the network 10.0.2.x via meterpreter

arp_scan

```
meterpreter > run arp_scan -r 10.0.2.1-255
```

we can connect to the RDP server of the machine 10.0.2.30

via adding a route from out local port 9389 to the machine 10.0.2.30:3389

```
meterpreter > portfwd add -l 9389 -p 3389 -r 10.0.2.30
```

so now we can connect to our local port 0.0.0.0:9389 and it will redirect us to 10.0.2.30:3389

 

pivoting is easier to do with Metasploit  session

```
route add 10.0.2.1 255.255.255.0 1
```

the last number is the session id

so now u can attack the machine  10.0.2.30 directly

 

have fun!
