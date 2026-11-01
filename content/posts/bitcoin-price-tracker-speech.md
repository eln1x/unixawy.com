---
title: "Bitcoin Speech Price Tracker"
date: 2014-12-04T18:29:01+00:00
url: "/bitcoin-price-tracker-speech/"
draft: false
description: "simple python script to bitcoin price speech is the target price reached it takes argument 1 as a target price simple but still useful to monitor bitcoin price..."
categories: ["blog", "Python"]
---

simple python script

to bitcoin price speech is the target price reached
it takes argument 1 as a target price
simple but still useful

to monitor bitcoin price via speech

 

```python
#!/usr/bin/env python

import json
import urllib2
import sys
import os
import time
import datetime

i = 0 
while True:

	link = "https://btc-e.com/api/2/btc_usd/ticker/"
	try:
		content = urllib2.urlopen(link)
		data_out = json.loads(content.read())
		last = data_out['ticker']['last']
	except:
		time.sleep(3)
		os.system("espeak 'connection lost'")
		continue
	i += 1

	if int(last) >= int(sys.argv[1]):
		os.system("espeak wakeup")
		cli = "notify-send 'the current price is : %s'" %last
		os.system(cli)
		print last 
	print "Target : " +  str(sys.argv[1]) + " Last: " +  str(last)  + " DateTime: "  + str(datetime.datetime.now())
	if i == 10:
		cli = "notify-send 'the current price is : %s'" %last
		os.system(cli)
		i = 0
	time.sleep(9)
```
