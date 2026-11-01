---
title: "Duplicate File Finder By MD5SUM"
date: 2014-12-04T18:59:01+00:00
url: "/duplicate-file-finder-md5sum/"
draft: false
description: "Hello this is a simple script to find the duplicated files by md5sum so if u have 2 files with the same content but with different names, u still can catch them"
categories: ["blog", "Python", "Security"]
---

Hello

this is a simple script to find the duplicated files by md5sum

so if u have 2 files with the same content  but with different   names, u still can catch them

```python
#duplicate file finder by file  md5sum
#author N1X

import sys
import os
import subprocess
from os.path import join, abspath
from os import walk 
from time import sleep

try:
	sys.argv[1]
except IndexError:
	print "usage: python filedub.py /full/path/to/dir/"
	sys.exit()
fileList = {}
targetdir = sys.argv[1]
totalfiles = 0
devnull = open('/dev/null', 'w')

print "#" * 20
print '#' * 5 , 'Scan Start on :' , targetdir
print '#' * 20 
print 'Total Founded:'
for root, dirs, files in os.walk(targetdir, topdown=True, onerror=None, followlinks=False):
	totalfiles += len(files)
	for file in files:
		file = abspath(join(root, file)) 
		cmd = 'md5sum "%s"' % file
		sum = subprocess.Popen(cmd , stderr=subprocess.PIPE, shell=True, stdout=subprocess.PIPE)
		sum = sum.communicate()[0]
		print sum
		sum = sum.split()
		try:
			sum[0]
		except IndexError:
			continue	
		sum = sum[0]
		if fileList.has_key(sum):
			fileList[sum].append(file)
		else:
			fileList[sum] = [file]

	print '\r%s'%totalfiles,
	sys.stdout.flush()
	sleep(0.5)		
for key in fileList.keys():
	if len(fileList[key]) > 1 :
		print "\n"
		print "Total Duplicate for checksum[%s] is :  %s)" %(key,len(fileList[key]))
		i=0
		for dub in fileList[key]:
			i = i + 1
			print i,":" ,dub,"if you want to delete this file pres y"
			action = raw_input('--> ')
			if action == "y":
				os.remove(dub)
	
```
