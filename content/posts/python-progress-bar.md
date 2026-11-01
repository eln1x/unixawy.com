---
title: "Python Progress Bar"
date: 2014-12-04T19:04:28+00:00
url: "/python-progress-bar/"
draft: false
description: "simple standalone bar u can implement it on your code it will show a progress bar of items range"
categories: ["blog", "Python"]
---

simple standalone bar u can implement it on your code

it will show a progress bar of items range

```python
from time import sleep
import sys
for i in range(21):
    sys.stdout.write('\r')
    # the exact output you're looking for:
    sys.stdout.write("[%-20s] %d%%" % ('='*i, 5*i))
    sys.stdout.flush()
    sleep(0.25)
```
