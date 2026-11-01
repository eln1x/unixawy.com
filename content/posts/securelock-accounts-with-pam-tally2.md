---
title: "Secure/Lock accounts with PAM tally2"
date: 2015-08-05T00:50:28+00:00
url: "/securelock-accounts-with-pam-tally2/"
draft: false
description: "pam tally2 is a PAM module to allow interaction in users interfaces on numbers of failed login attempt it can reset count on success, can deny access if too..."
categories: ["blog", "Linux", "Security", "tech"]
---

pam_tally2 is a PAM module to allow interaction in users interfaces on numbers of failed login attempt it can reset count on success, can deny access if too many attempts fail.

this module is unique because it  not just reflect remote connection but also reflect the ttys and any system login method as it uses PAM

example from tty:

```
Centos release 6.5 (Final)
Kernel 2.6.32-431.el6.x86 on an x86_64
centos-6 login:n1x
Account locked due to 8 failed logins
Password:
```

 

some parameters

1. deny used to block access of numbers of failed attempts
2. unlock_time used to set a time duration for blocked access in seconds
3. even_deny_root root is excluded by default, you set this parameter to tell tally2 count for root too
4. root_unlock_time same as unlock_time but  for root only

 

example PAM config:

```
auth        required      pam_tally2.so deny=2 unlock_time=30 even_deny_root root_unlock_time=10
```

 

to reflect the tty access we have to configure our tally2 module in /etc/pam.d/system-auth

 

here is our final layout for system-auth

```bash
#%PAM-1.0
# This file is auto-generated.
# User changes will be destroyed the next.

auth        required      pam_env.so
auth        required      pam_tally2.so deny=2 unlock_time=30 even_deny_root root_unlock_time=10
auth        sufficient    pam_unix.so nullok try_first_pass
auth        requisite     pam_succeed_if.so uid >= 500 quiet
auth        required      pam_deny.so

account     required      pam_tally2.so
account     required      pam_unix.so
account     sufficient    pam_localuser.so
account     sufficient    pam_succeed_if.so uid < 500 quiet
account     required      pam_permit.so

password    requisite     pam_cracklib.so try_first_pass retry=3 type=
password    sufficient    pam_unix.so sha512 shadow nullok try_first_pass use_authtok
password    required      pam_deny.so

session     optional      pam_keyinit.so revoke
session     required      pam_limits.so
session     [success=1 default=ignore] pam_succeed_if.so service in crond quiet use_uid
session     required      pam_unix.so
~
```

to reflect the  remote connections  that use password example sshd

we config our /etc/pam.d/password-auth with tally

```bash
#%PAM-1.0
# This file is auto-generated.
# User changes will be destroyed the next time authconfig is run.
auth        required      pam_env.so
auth        required      pam_tally2.so deny=2 unlock_time=30 even_deny_root root_unlock_time=10
auth        sufficient    pam_unix.so nullok try_first_pass
auth        requisite     pam_succeed_if.so uid >= 500 quiet
auth        required      pam_deny.so

account     required      pam_tally2.so
account     required      pam_unix.so
account     sufficient    pam_localuser.so
account     sufficient    pam_succeed_if.so uid < 500 quiet
account     required      pam_permit.so

password    requisite     pam_cracklib.so try_first_pass retry=3 type=
password    sufficient    pam_unix.so sha512 shadow nullok try_first_pass use_authtok
password    required      pam_deny.so

session     optional      pam_keyinit.so revoke
session     required      pam_limits.so
session     [success=1 default=ignore] pam_succeed_if.so service in crond quiet use_uid
session     required      pam_unix.so
```

 

notice that we have done 2 things  one in auth interface that verifies the account and 2nd one in the account interface to reflect the permissions of the account

 

here is some output of /var/log/secure

 

```
Aug  5 02:09:53 centos-6 login: pam_tally2(login:auth): user root (0) tally 3, deny 2
Aug  5 02:13:37 centos-6 sshd[12921]: pam_tally2(sshd:auth): user root (0) tally 10, deny 2
```

as you see tally2 kills the connection :)

for manual interaction with tally2 counter

there is a command called pam_tally2

```bash
[root@centos-6 ~]# pam_tally2
Login           Failures Latest failure     From
root                2    08/05/15 02:11:45  192.168.72.1
```

to remove a counter failures

```bash
[root@centos-6 ~]# pam_tally2 -r -u root
Login           Failures Latest failure     From
root               10    08/05/15 02:13:37  192.168.72.1
[root@centos-6 ~]# pam_tally2 -r -u root
Login           Failures Latest failure     From
root                0
```
