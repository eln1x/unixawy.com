---
title: "Convert VirtualBox HardDisk To VMware"
date: 2015-01-12T18:44:44+00:00
url: "/convert-virtualbox-harddisk-vmware/"
draft: false
description: "hello in this article we will simply convert vhd file (VirtualBox disk image) to VMware disk our VirtualBox disk is \"systemdisk.vhd\" we will use qemu emulator..."
categories: ["blog", "Linux"]
---

hello in this article we will simply convert vhd file (VirtualBox disk image)

to VMware disk

 

our VirtualBox disk is "systemdisk.vhd"

we will use qemu emulator to convert the disk

our target app to do the convert is

qemu-img

```
qemu-img convert -f vpc -O vmdk systemdisk.vhd systemdisk.vmdk
```
