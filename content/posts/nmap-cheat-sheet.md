---
title: "nmap cheat sheet"
date: 2015-02-03T02:17:38+00:00
url: "/nmap-cheat-sheet/"
draft: false
description: "nmap scan sheet cheat :D Host Discovery arp scan Stealth Scan Idle Scan Version Scan TCP Full connect scan Null Scan Soofing Source Xmas Scan FIN scan Maimon..."
categories: ["blog", "Security"]
---

nmap scan sheet cheat :D

Host Discovery

```
nmap -PE <range>
nmap -PP <range>
nmap -PM <range>
```

arp scan

```
nmap -PR <range>
```

Stealth Scan

```
nmap -sS <range>
```

 

Idle Scan

```
nmap -sI zombie <range>
```

 

Version Scan

```
nmap -sV <range>
```

TCP Full connect scan

```
nmap -sT <range>
```

 

Null Scan

```
nmap -sN <range>
```

 

Soofing Source

```
address spoof
    nmap -S spoofed source address
mac spoof
    nmap --spoof-mac
```

Xmas Scan

```
nmap -sX <range>
```

 

FIN scan 

```
nmap -sF <range>
```

 

Maimon scan

```
nmap -sM <range>
```

 

ACK Scan

```
nmap -sA <range>
```

 

Window Scan

```
nmap -sW <range>
```

 

UDP scan

```
nmap -sU -sV <range>
```

 

SCTP scan

```
init scan
    nmap -sY <range> 
echo scan
    nmap -sZ <range>
```

 

IP Protocol scan

```
nmap -sO <range>
```
