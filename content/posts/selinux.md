---
title: "ausearch"
date: 2016-07-23T21:26:19+00:00
url: "/selinux/"
draft: true
description: "ausearch m avc i ts today search for avc today $ModLoad imtcp $InputTCPServerRun 514 $template DynamicFile,\"/var/log/loghost/%HOSTNAME%/%syslogfacility..."
categories: ["blog"]
---

ausearch -m avc -i -ts today   # search for avc today

 

 

$ModLoad imtcp
$InputTCPServerRun 514

$template DynamicFile,"/var/log/loghost/%HOSTNAME%/%syslogfacility-text%.log"
*.* -?DynamicFile
