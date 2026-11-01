---
title: "Regex to find mac address"
date: 2015-07-31T00:49:11+00:00
url: "/regex-to-find-mac-address/"
draft: false
description: "today i was doing some forensics to find mac address inside syslog in linux systems i wrote this simple grep command to filter mac address from log files grep..."
categories: ["blog"]
---

today i was doing some forensics to find mac address inside syslog in linux systems
i wrote this simple grep command to filter mac address from log files

grep '[0-9a-zAz]\{2\}:[0-9a-zAz]\{2\}:[0-9a-zAz]\{2\}:[0-9a-zAz]\{2\}:[0-9a-zAz]\{2\}:[0-9a-zAz]\{2\}'

 

 

have fun
