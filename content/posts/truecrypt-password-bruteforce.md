---
title: "TrueCrypt Password bruteforce"
date: 2014-12-04T18:53:52+00:00
url: "/truecrypt-password-bruteforce/"
draft: false
description: "hello, guys, this script will simply mount the container with the password form the given password list"
categories: ["blog", "Linux", "Python", "Security"]
---

hello, guys, this  script will simply mount the container

with the password form the given password list

```python
#!/usr/bin/env python
#TrueCrypt Crack Passowrd Based In Dic Attack
#Author : N1X
import subprocess
import sys
file = open(sys.argv[2])
passlist=file.readlines()

for password in passlist:
	print password.strip()
	command = "truecrypt -t --non-interactive %s -p %s" %(sys.argv[1],password.strip())
	p = subprocess.Popen(command,shell=True,stderr=subprocess.PIPE)
	r =  p.stderr.read()
	if r.startswith('Error'):
		pass
	else:
		print "Found Passowrd is :" + password
		exit()	
```
