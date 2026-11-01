---
title: "umask permissions explanation"
date: 2015-07-10T07:16:00+00:00
url: "/umask-permissions-explanation/"
draft: false
description: "what is umask? umask is the default permissions for writing a file in the system where the settings for umask? 1 /etc/profile 2 /etc/bashrc 3 users can change..."
categories: ["blog", "Linux"]
---

what is umask?
umask is the default permissions for writing a file in the system

where the settings for umask?
1 - /etc/profile
2 - /etc/bashrc

```bash
if [ $UID -gt 199 ] && [ "`id -gn`" = "`id -un`" ]; then
umask 002
else
umask 022
fi
```

3 - users can change umask in the fly via umask command

what is current umask value?
u can run the command "umask to get the value"

```bash
[root@localhost ~]# umask
0022
```

 

first bit zero for
4000 = SUID
2000 = SGID
1000 = sticky bit

how to calculate it

first, let's create a file with root account that has umask 0022

```bash
[root@localhost ~]# touch test_default_umask_for_root
[root@localhost ~]# ls -l test_default_umask_for_root
-rw-r--r--. 1 root root 0 Jul 10 06:04 test_default_umask_for_root
```

 

the file wrote in permission 644, and our umask value is 0022

so here how to set the correct one
first, let's assume we want to make the default files rwrwrw 666
r = 4
w = 2
so every sector for the owner, group, others
to get the correct umask number we will say
777 - x = 666
this is equal to
777 - 666 = x
x = 111
so our umask will be 111

example

```bash
[root@localhost ~]# umask 111
[root@localhost ~]# touch 111
[root@localhost ~]# ls -alah 111
-rw-rw-rw-. 1 root root 0 Jul 14 03:51 111
```

```
002 -rw-rw-r--.drwxrwxr-x. no write for other
022 -rw-r--r--.drwxr-xr-x. no write + read + execute
027 -rw-r-----.drwxr-x---. no write + group read
077 -rw-------.drwx------. only belowngs to woner
```

 

 

2 to remove the write permeation

7 to remove all permeation

0 give it all permeations  actually ( don't implement any permeation  try 000 ;))
