---
title: "removable disk could lead to privilege escalation"
date: 2015-07-05T22:41:43+00:00
url: "/removable-disk-could-lead-to-privilege-escalation/"
draft: false
description: "privilege escalation Linux with flash disk removable media with setUID, setGID files could give privilege escalation example copy nice command to ur flash..."
categories: ["blog", "Security", "tech"]
---

## privilege escalation Linux with flash disk

removable media with setUID, setGID files could give privilege escalation
example copy nice command to ur flash storage and ask ur friend to print files in his system then run the command
nice like

```
nice whoami
```

it will say root

the problem occurs from a mounted partition without noexec,nosuid parameter

enjoy ur automount

and

happy hacking ;)
