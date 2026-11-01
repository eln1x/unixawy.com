---
title: "audit keystrokes with pam"
date: 2015-10-07T22:36:23+00:00
url: "/audit-keystrokes-with-pam/"
draft: false
description: "The pam tty audit PAM module is used to enable or disable TTY auditing. By default, the kernel does not audit input on any TTY this module is part of auditd..."
categories: ["blog", "Linux", "Security"]
---

The pam_tty_audit PAM module is used to enable or disable TTY auditing. By default, the kernel does
not audit input on any TTY

this module is part of auditd and it takes  3 parameters

1 - disable  is a pattern to disable the module in specified users u can use =* to disable it globally

2 - enable  is a pattern to enable for specified users

3 - open_only to monitor fork apps

let's assume we want to monitor keystrokes via incoming ssh connection

this is helpful because some bad users could remove their history or use screen command

we will use the pam_tty_audit inside the ssh pam file /etc/pam.d/sshd

 

add this the module to end of the file

```
session    required     pam_tty_audit.so open_only disable=* enable=root,tester
```

 

 

to view users log

```
aureport --tty
```

here is output example

```
1. 10/07/2015 17:39:08 287 0 ? 18 bash "top",<ret>
2. 10/07/2015 17:39:09 289 0 ? 18 bash "ps",<ret>
3. 10/07/2015 17:39:11 291 0 ? 18 bash "ps awxf",<ret>
4. 10/07/2015 17:40:30 299 0 ? 18 bash "exit",<ret>
5. 10/07/2015 17:56:03 550 500 ? 28 bash "screen -r x",<ret>,"screen -dmS x",<ret>,"screen -r x",<ret>,<^D>
6. 10/07/2015 17:57:38 576 500 ? 29 bash "echo 100 > /etcdev/null",<ret>,
```

tty report provides u with the userid example 0 ? 18 bash user id 0 for root

500 ? 28 bash user id 500 for tester account
