---
title: "find duplicated UID in the linux system"
date: 2015-07-16T02:03:09+00:00
url: "/find-duplicated-uid-in-the-linux-system/"
draft: false
description: "u can identify the duplicated uid in your system this useful to identify if there some manipulation inside the users' accounts getent passwd|cut d : f3 |sort..."
categories: ["blog"]
---

u can identify the duplicated uid in your system
this useful to identify if there some manipulation inside the users' accounts

getent passwd|cut -d : -f3 |sort -n|uniq -d

it only returns the duplicated uid

btw: if it returns 0 :D you know the rest
