---
title: "users in shadow file explanation"
date: 2015-07-16T01:09:24+00:00
url: "/users-in-shadow-file-explanation/"
draft: false
description: "this article explain the /etc/shadow this file content the users information example of the user data username n1x password..."
categories: ["blog", "Linux"]
---

this article explain the /etc/shadow

this file content the users information

example of the user data

```c
n1x:$6$UoDmVdoW$tYQQm5uHgOpeEKPygIaQ1GM/0IBbdYVrLHu8ZYF5pT17D3VM.FFKa2wS8J6gqbGKC2IpgImXy7SYVJK9r/fdw.:16631:7:15:2:14:16819:
```

username -> n1x
password -> $6$UoDmVdoW$tYQQm5uHgOpeEKPygIaQ1GM/0IBbdYVrLHu8ZYF5pT17D3VM.FFKa2wS8J6gqbGKC2IpgImXy7SYVJK9r/fdw.
last date password update since 1970-1-1 -> 16631

you can calculate it simply in python

```python
>>> from datetime import timedelta,datetime
>>> s = '1970-01-01'
>>> x = datetime.strptime(s,"%Y-%m-%d")
>>> x + timedelta(days=16631)
datetime.datetime(2015, 7, 15, 0, 0)
```

minmum password age -> 7
maximum password age -> 15
warning days -> 2
inactive days -> 14
expiration date -> 16819

we can list or modify a user by a chage command
example

```bash
[root@localhost ~]# chage -m 7 -M 15 -W 2 -I 14 -E 2016-01-19 n1x
[root@localhost ~]# chage -l n1x
Last password change					: Jul 15, 2015
Password expires					: Jul 30, 2015
Password inactive					: Aug 13, 2015
Account expires						: Jan 19, 2016
Minimum number of days between password change		: 7
Maximum number of days between password change		: 15
Number of days of warning before password expires	: 2
[root@localhost ~]#
```

for setting default config for all users you can use /etc/login.defs

# Password aging controls:
#
# PASS_MAX_DAYS Maximum number of days a password may be used.
# PASS_MIN_DAYS Minimum number of days allowed between password changes.
# PASS_MIN_LEN Minimum acceptable password length.
# PASS_WARN_AGE Number of days warning given before a password expires.
#
PASS_MAX_DAYS 30
PASS_MIN_DAYS 10
PASS_MIN_LEN 10
PASS_WARN_AGE 1
