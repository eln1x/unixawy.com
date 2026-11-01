---
title: "Persistent mount for luks with unlock Key"
date: 2015-07-05T04:18:13+00:00
url: "/persistent-mount-for-luks-with-unlock-key/"
draft: false
description: "creating a encrypted disk with luks our Little problem here to mount a encrypted disk automatically on boot so no need to enter the pass for mounting but this..."
categories: ["blog", "Linux", "Security", "tech"]
---

[creating a encrypted disk](/linux-disk-encryption-with-luks/) with luks

our  Little problem here to mount a encrypted disk  automatically on boot

so no need to enter the pass for mounting but this **risky** if the machine theft happen because we will use a key inside the system and it will be leaked if our machine stolen

so lets do it first we have to create a key and add it  our partition

to create a key

```bash
[root@localhost ~]# dd if=/dev/random of=/root/key bs=4096 count=1
0+1 records in
0+1 records out
113 bytes (113 B) copied, 0.000462577 s, 244 kB/s
[root@localhost ~]# cat /root/key
y  ]da 0 k yhv A  l fn   ZÇ _i)SK  D Y 6ó S  w   ; V     ,   +"   OE    { [hf 
                                                                               OR 
[root@localhost ~]#
```

don't forget it to set key permission to be 600

now we need to tell our luks partition to use this key

```bash
[root@localhost ~]# cryptsetup luksAddKey /dev/sdb1 /root/key
Enter any passphrase:
[root@localhost ~]#
```

 

now we need to make it available in device mapper

to use encrypted disks while boot there is a crypt tab

```
vi /etc/crypttab

crypted1 /dev/sdb1 /root/keyfirst field is the device mapper name
```

the second one is the disk partition

third is the key file

```bash
[root@localhost ~]# vi /etc/fstab

/dev/mapper/crypted1    /mnt/crypted1           ext4    defaults        0 0
```

as u can see we put the device mapper name  that we used it in crypttab file and normal mount

reboot the system and enjoy it
