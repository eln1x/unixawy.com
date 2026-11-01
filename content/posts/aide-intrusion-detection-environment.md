---
title: "AIDE : Intrusion Detection Environment"
date: 2015-07-14T05:05:05+00:00
url: "/aide-intrusion-detection-environment/"
draft: false
description: "this article about Intrusion Detection for file system changes like modification changing owner extra, for critical files or directories in our environment we..."
categories: ["blog", "Linux", "Security", "tech"]
---

this article about Intrusion Detection for file system changes like modification changing owner extra, for critical files or directories in our environment

we using a software called AIDE

**Advanced Intrusion Detections Environment**
this software base on a library called mhash this lib used to calculate file hashes
and AIDE save the file info inside DB with base64 formate
the information that will be saved depends on the aide configuration file

example of default info for the Linux image file

```
/boot/vmlinuz-3.17.4-301.fc21.x86_64 0 16108227517 100755 18 0 0 5751144 MTQxNzExNTY2OA== MTQyMDMwMTk1Mw== 1 gcKKQ58dI3hgV9O1fbZuAL
Kxo5tk1U3hqQzyYX5TyYY= uDXtddP+6ZMAvFla06wJraWbbkUG7as9LyNUV8qnofW6vB5yQa4is7yrmLsSR5roIW+3/3W7t+1NrCfOOxMOaA== POSIX,dXNlcjo6cnd4C
mdyb3VwOjpyLXgKb3RoZXI6OnIteAo=,0 0 c3lzdGVtX3U6b2JqZWN0X3I6Ym9vdF90OnMw 0
```

let's decode this

```
/boot/vmlinuz-3.17.4-301.fc21.x86_64 0 16108227517 100755 18 0 0 5751144 1417115668 1420301953 1 BINARY  Binary POSIX,user::rwx
group::r-x
other::r-x
,0 0 system_u:object_r:boot_t:s0 0
```

the content owner, file permission, inode, ACL, SELinux file policy

 

simple detection report

```
AIDE 0.15.1 found differences between database and filesystem!!
Start timestamp: 2015-07-14 04:36:07

Summary:
  Total number of files:	143950
  Added files:			11
  Removed files:		0
  Changed files:		8

---------------------------------------------------
Added files:
---------------------------------------------------

added: /usr/bin/htop
added: /usr/share/doc/htop
added: /usr/share/doc/htop/AUTHORS
added: /usr/share/doc/htop/COPYING
added: /usr/share/doc/htop/ChangeLog
added: /usr/share/doc/htop/README
added: /usr/share/man/man1/htop.1.gz
added: /usr/share/pixmaps/htop.png
added: /var/log/cups/access_log-20150714
added: /var/log/monitorix-20150714
added: /var/log/monitorix-httpd-20150714
added: /var/www/html/n1x/aide.db

---------------------------------------------------
Changed files:
---------------------------------------------------

changed: /usr/bin
changed: /usr/share/doc
changed: /usr/share/man/man1
changed: /usr/share/pixmaps
changed: /var/log/cups/access_log
changed: /var/log/lastlog
changed: /var/log/monitorix
changed: /var/log/monitorix-httpd

---------------------------------------------------
Detailed information about changes:
---------------------------------------------------

Directory: /usr/bin
 Mtime    : 2015-07-08 12:06:15              , 2015-07-14 04:36:06
 Ctime    : 2015-07-08 12:06:15              , 2015-07-14 04:36:06

Directory: /usr/share/doc
 Mtime    : 2015-07-14 04:06:49              , 2015-07-14 04:36:06
 Ctime    : 2015-07-14 04:06:49              , 2015-07-14 04:36:06
 Linkcount: 1056                             , 1058

Directory: /usr/share/man/man1
 Mtime    : 2015-07-14 04:06:49              , 2015-07-14 04:36:06
 Ctime    : 2015-07-14 04:06:49              , 2015-07-14 04:36:06

Directory: /usr/share/pixmaps
 Mtime    : 2014-12-03 22:42:26              , 2015-07-14 04:36:06
 Ctime    : 2015-01-03 18:23:23              , 2015-07-14 04:36:06

File: /var/log/cups/access_log
 Size     : 754                              , 0
 Inode    : 392852                           , 395735

File: /var/log/lastlog
 Mtime    : 2015-07-14 03:51:31              , 2015-07-14 04:32:02
 Ctime    : 2015-07-14 03:51:31              , 2015-07-14 04:32:02
 SHA256   : zXYJguRcLmAJIGA66Wwx5FdKfHav3nfY , ZWr5tR5LHN1t5uEIGGmTz4ZSkvQcev6X
 SHA512   : M3/rCkZ/8aqLpC7BehIaUrjkP8dZD7QE , eTdILQ8ZQ7+H4TyJGN6B0ZPdGJwrXM38

File: /var/log/monitorix
 Size     : 1337                             , 0
 Inode    : 392753                           , 397808

File: /var/log/monitorix-httpd
 Size     : 61946                            , 0
 Inode    : 397342                           , 397809
```

another report for custom folder permission changed to 777

```
Directory: /var/www/html/n1x
 Perm     : drw-rw-rw-                       , drwxrwxrwx
 ACL      : old = A:
----
user::rw-
group::rw-
other::rw-
----
                  D: <NONE>
            new = A:
----
user::rwx
group::rwx
other::rwx
----
                  D: <NONE>
```

 

in configuration file we set a variable called webmon to monitor modification of /var/www/html/n1x/

webmon = p+i+u+g+acl+selinux
/var/www/html/n1x webmon

the p+i+u+g+acl+selinux stands for permission , inode , user , group , acl , selinux
