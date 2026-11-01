---
title: "Pluggable Authentication Modules"
date: 2015-08-03T16:51:56+00:00
url: "/pluggable-authentication-modules/"
draft: false
description: "Linux comes with Pam Modules to help you to interact with the running services in hardening way and custom the security of the service as you need. PAM is..."
categories: ["blog", "Linux", "Security"]
---

Linux comes with Pam Modules to help you to interact with the running services in hardening way and custom the security of the service as you need.

PAM is extra Rules to Control user interfaces ( Auth, Account, Session)  layers for the applications

the applications/services should be compiled with libpam.so

here is an example for sshd service

```bash
[root@centos-6 ~]# ldd $(which sshd)|grep pam
	libpam.so.0 => /lib64/libpam.so.0 (0x00007f81348fc000)
[root@centos-6 ~]#
```

and every layer of this interfaces reflected with another action of  different control flags (required, optional, include, sufficient) and every flag  takes parameters of the configuration

PAM modules located in /etc/pam.d/*

example sshd service

/etc/pam.d/sshd

```bash
#%PAM-1.0
auth       required     pam_sepermit.so
auth       include      password-auth
account    required     pam_nologin.so
account    include      password-auth
password   include      password-auth retry=5
# pam_selinux.so close should be the first session rule
session    required     pam_selinux.so close
session    required     pam_loginuid.so
# pam_selinux.so open should only be followed by sessions to be executed in the user context
session    required     pam_selinux.so open env_params
session    optional     pam_keyinit.so force revoke
session    include      password-auth
~
```

 

lets cut this in slices

- interfaces
- flags
- modules
- parameters

 

**lets go for the first object (Interfaces)**

1. auth : this interfaces responsible for account validation of password
2. account : this interface responsible for account allowed access like account age
3. password: this interface responsible for changing passwords
4. session: this interface responsible for interactions with another  access  like mounting

**Control Flags**

1. required : this flag must reflect with success message to allow a user to access the system but pam will keep checking the other rules too
2. requisite: this flag result reflect user status immediately and won't check the else  rules
3. sufficient: not mandatory to return with  success and if it fails the result will be ignored, but if  the return success and no fails before it, this will allow the user to pass the check
4. optional: this result be ignored during the check, it only reflects the interface if there is no other reference
5. include: this flag read the configuration file for this interface and append them to the current statement

PLEASE NOTE: this rules affected by sequence priority from the top to the bottom of line order

**Modules**

pam modules located in Linux system inside /lib/security or /lib64/security depends in your current system

```bash
[root@centos-6 ~]# file /lib64/security/pam_cracklib.so
/lib64/security/pam_cracklib.so: ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked, stripped
[root@centos-6 ~]#
```

 

**Parameters** 

every module come with its own parameters

```bash
[root@centos-6 ~]# man pam_cracklib
```

after navigating through the manual page

u will see description for this module and it own parameters

This module can be plugged into the password stack of a given application to provide some plug-in
strength-checking for passwords.

```
password  required pam_cracklib.so dcredit=-1 ucredit=-1 ocredit=-1 lcredit=0 minlen=8
```

**modifying the pam reflect the running service instant**
