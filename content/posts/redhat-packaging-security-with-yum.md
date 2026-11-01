---
title: "RedHat Packaging Security with yum"
date: 2015-06-29T09:40:05+00:00
url: "/redhat-packaging-security-with-yum/"
draft: false
description: "RedHat comes with a mitigated package called RHSA (RedHat security advisory) This RHSA comes with a unique id like CVE Contain the date of fix and these type..."
categories: ["blog", "Linux"]
---

RedHat comes with a mitigated package called RHSA (RedHat security advisory)

This RHSA comes with a unique id  like CVE Contain the date of fix and these type packages  come for the applications that shipped from RedHat

Example RHSA-2015:0291
For listing available updates for application

```
yum updateinfo list openssl

FEDORA-2015-0512  security openssl-1:1.0.1k-1.fc21.x86_64
FEDORA-2015-4303  security openssl-1:1.0.1k-6.fc21.x86_64
FEDORA-2015-10108 security openssl-1:1.0.1k-10.fc21.x86_64
```

For quick installation to security batches

```
yum update --security
```

Get sure that you installed  yum-security plugin first

To install  batches for a specified  RHSA u can use this

```
yum update --advisory=rhsa
```

Or batch updates for a specified CVE

```
yum update --cve=CVE
```

example

```bash
yum updateinfo FEDORA-2015-9599
Loaded plugins: langpacks

===============================================================================
  qemu-2.1.3-8.fc21
===============================================================================
  Update ID : FEDORA-2015-9599
    Release : Fedora 21
       Type : security
     Status : stable
     Issued : 2015-06-07 09:00:34
       Bugs : 1151253 - User interface freezes when entering space character in Xfig
	    : 1213053 - Backport {Haswell,Broadwell}-noTSX cpu models
	    : 1222894 - qemu: insecure temporary file use in /net/slirp.c [fedora-all]
	    : 1222892 - CVE-2015-4037 qemu: insecure temporary file use in /net/slirp.c
Description : * User interface freezes when entering space character in Xfig
            :   (bz #1151253)
            : * CVE-2015-4037: insecure temporary file use in
            :   /net/slirp.c (bz #1222894)
            : * Backport {Haswell,Broadwell}-noTSX cpu models
            :   (bz #1213053)
updateinfo info done
[root@localhost ~]# yum update --bzs=1222892,1222894,1213053,1151253 --cves=CVE-2015-4037
Loaded plugins: langpacks

--> Finished Dependency Resolution

Dependencies Resolved

=====================================================================================================
 Package                     Arch              Version                      Repository          Size
=====================================================================================================
Updating:
 libcacard                   x86_64            2:2.1.3-8.fc21               updates             73 k
 qemu-common                 x86_64            2:2.1.3-8.fc21               updates            258 k
 qemu-guest-agent            x86_64            2:2.1.3-8.fc21               updates            157 k
 qemu-img                    x86_64            2:2.1.3-8.fc21               updates            586 k
 qemu-kvm                    x86_64            2:2.1.3-8.fc21               updates             53 k
 qemu-system-x86             x86_64            2:2.1.3-8.fc21               updates            3.6 M

Transaction Summary
=====================================================================================================
Upgrade  6 Packages

Total download size: 4.7 M
Is this ok [y/d/N]: y
Downloading packages:
Delta RPMs reduced 331 k of updates to 172 k (47% saved)
(1/6): libcacard-2.1.2-6.fc21_2.1.3-8.fc21.x86_64.drpm                        |  53 kB  00:00:01
(2/6): qemu-kvm-2.1.3-8.fc21.x86_64.rpm                                       |  53 kB  00:00:01
(3/6): qemu-guest-agent-2.1.3-8.fc21.x86_64.rpm                               | 157 kB  00:00:03
(4/6): qemu-img-2.1.3-8.fc21.x86_64.rpm                                       | 586 kB  00:00:05
(5/6): qemu-common-2.1.2-6.fc21_2.1.3-8.fc21.x86_64.drpm                      | 119 kB  00:00:07
(6/6): qemu-system-x86-2.1.3-8.fc21.x86_64.rpm                                | 3.6 MB  00:00:24
-----------------------------------------------------------------------------------------------------
Total                                                                183 kB/s | 4.6 MB  00:00:25
Running transaction check
Running transaction test
Transaction test succeeded
Running transaction (shutdown inhibited)
  Updating   : 2:qemu-common-2.1.3-8.fc21.x86_64                                                1/12
  Updating   : 2:qemu-system-x86-2.1.3-8.fc21.x86_64                                            2/12
  Updating   : 2:qemu-kvm-2.1.3-8.fc21.x86_64                                                   3/12
  Updating   : 2:qemu-img-2.1.3-8.fc21.x86_64                                                   4/12
  Updating   : 2:libcacard-2.1.3-8.fc21.x86_64                                                  5/12
  Updating   : 2:qemu-guest-agent-2.1.3-8.fc21.x86_64                                           6/12
  Cleanup    : 2:qemu-kvm-2.1.2-6.fc21.x86_64                                                   7/12
  Cleanup    : 2:qemu-system-x86-2.1.2-6.fc21.x86_64                                            8/12
  Cleanup    : 2:qemu-common-2.1.2-6.fc21.x86_64                                                9/12
  Cleanup    : 2:qemu-img-2.1.2-6.fc21.x86_64                                                  10/12
  Cleanup    : 2:libcacard-2.1.2-6.fc21.x86_64                                                 11/12
  Cleanup    : 2:qemu-guest-agent-2.1.2-6.fc21.x86_64                                          12/12
  Verifying  : 2:qemu-guest-agent-2.1.3-8.fc21.x86_64                                           1/12
  Verifying  : 2:qemu-system-x86-2.1.3-8.fc21.x86_64                                            2/12
  Verifying  : 2:libcacard-2.1.3-8.fc21.x86_64                                                  3/12
  Verifying  : 2:qemu-kvm-2.1.3-8.fc21.x86_64                                                   4/12
  Verifying  : 2:qemu-img-2.1.3-8.fc21.x86_64                                                   5/12
  Verifying  : 2:qemu-common-2.1.3-8.fc21.x86_64                                                6/12
  Verifying  : 2:qemu-kvm-2.1.2-6.fc21.x86_64                                                   7/12
  Verifying  : 2:libcacard-2.1.2-6.fc21.x86_64                                                  8/12
  Verifying  : 2:qemu-img-2.1.2-6.fc21.x86_64                                                   9/12
  Verifying  : 2:qemu-guest-agent-2.1.2-6.fc21.x86_64                                          10/12
  Verifying  : 2:qemu-system-x86-2.1.2-6.fc21.x86_64                                           11/12
  Verifying  : 2:qemu-common-2.1.2-6.fc21.x86_64                                               12/12

Updated:
  libcacard.x86_64 2:2.1.3-8.fc21                   qemu-common.x86_64 2:2.1.3-8.fc21
  qemu-guest-agent.x86_64 2:2.1.3-8.fc21            qemu-img.x86_64 2:2.1.3-8.fc21
  qemu-kvm.x86_64 2:2.1.3-8.fc21                    qemu-system-x86.x86_64 2:2.1.3-8.fc21

Complete!
```

 

Very important to get sure of the new updated pushed to the system is compatible with the running software and your production environment  **it may install a new version of the software**

We will take later about backporting and advanced package verification
