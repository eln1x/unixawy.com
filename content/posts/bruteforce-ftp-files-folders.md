---
title: "bruteforce ftp files and folders"
date: 2014-12-06T18:15:48+00:00
url: "/bruteforce-ftp-files-folders/"
draft: true
description: "sometimes if the listing not working we need to brute force files and folders here is a simple python script to brute force folders FTP brute force files note..."
categories: ["blog", "Python", "Security"]
---

sometimes if the listing not working we need to brute force files and folders

here is a simple python script to brute-force folders

```python
import ftplib,sys
serv = 'serverip'
dirs = open("common.txt")
ftp = ftplib.FTP(serv)
ftp.login("anonymous", "x@n1x.host")
ftp.debug(1)
for dict in dirs.readlines():
	try:
		ftp.cwd(dict.strip())
	except ftplib.error_perm:
		continue
	print dict
	sys.exit()
```

FTP brute force files

note this script will try to download files in your dictionary attack

so recommend to run it inside tmp folder

```python
import ftplib,sys
serv = 'host ip'
dirs = open("common.txt")
ftp = ftplib.FTP(serv)
ftp.login("anonymous", "s@x")
ftp.debug(1)
for dict in dirs.readlines():
	try:
		ftp.retrbinary("RETR " + dict.strip(),open(dict.strip(), 'wb').write)
	except ftplib.error_perm:
		continue
	print dict
	sys.exit()
```
