---
title: "Linux Disk Encryption with LUKS"
date: 2015-07-05T02:50:28+00:00
url: "/linux-disk-encryption-with-luks/"
draft: false
description: "today we going to make an encrypted disk partition list prepare our partition I have a new disk in /dev/sdb I will create a partition 100 on it with fdisk our..."
categories: ["blog", "Linux", "Security"]
---

today we going to make an encrypted disk partition

list prepare our partition

I have a new disk in  /dev/sdb

I will create a partition 100 on it with fdisk

```bash
[root@localhost ~]# fdisk /dev/sdb

Welcome to fdisk (util-linux 2.25.2).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

/dev/sdb: device contains a valid 'crypto_LUKS' signature, it's strongly recommended to wipe the device by command wipefs(8) if this setup is unexpected to avoid possible collisions.

Device does not contain a recognized partition table.
Created a new DOS disklabel with disk identifier 0xc0e7edd0.

Command (m for help): p
Disk /dev/sdb: 1 GiB, 1073741824 bytes, 2097152 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0xc0e7edd0

Command (m for help): n
Partition type
   p   primary (0 primary, 0 extended, 4 free)
   e   extended (container for logical partitions)
Select (default p): p
Partition number (1-4, default 1):
First sector (2048-2097151, default 2048):
Last sector, +sectors or +size{K,M,G,T,P} (2048-2097151, default 2097151): +100M

Created a new partition 1 of type 'Linux' and of size 100 MiB.

Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.

[root@localhost ~]# fdisk /dev/sdb

Welcome to fdisk (util-linux 2.25.2).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

Command (m for help): p
Disk /dev/sdb: 1 GiB, 1073741824 bytes, 2097152 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0xc0e7edd0

Device     Boot Start    End Sectors  Size Id Type
/dev/sdb1        2048 206847  204800  100M 83 Linux
```

our new partition is /dev/sdb1

to encrypt this partition we have to format it first with LUKS

```bash
[root@localhost ~]# cryptsetup  luksFormat /dev/sdb1

WARNING!
========
This will overwrite data on /dev/sdb1 irrevocably.

Are you sure? (Type uppercase yes): YES
Enter passphrase:
Verify passphrase:
[root@localhost ~]#
```

okay now we have a partition disk encrypted we need to make it usable

to use this disk first u have to open it with LUKS

when you use LUKS to open partition  you should **name** the partition and this name will be used later for mounting

let's see how to do it

```bash
[root@localhost ~]# cryptsetup -v luksOpen /dev/sdb1 <strong>crypted1</strong>
Enter passphrase for /dev/sdb1:
Key slot 0 unlocked.
Command successful.
[root@localhost ~]#
```

u will get new partition in device mapper called crypted1  this is the **name**

```bash
[root@localhost ~]# ls -l /dev/mapper/crypted1
lrwxrwxrwx. 1 root root 7 Jul  5 02:20 /dev/mapper/crypted1 -> ../dm-2
[root@localhost ~]#
```

it's open but we still can't use it need some filesystem structure so we will add ext4 to this mapper

```bash
[root@localhost ~]# mkfs.ext4 /dev/mapper/crypted1
mke2fs 1.42.11 (09-Jul-2014)
Creating filesystem with 100352 1k blocks and 25168 inodes
Filesystem UUID: 9d6073d6-2536-4d5a-b21d-9586d20f4acf
Superblock backups stored on blocks:
	8193, 24577, 40961, 57345, 73729

Allocating group tables: done
Writing inode tables: done
Creating journal (4096 blocks): done
Writing superblocks and filesystem accounting information: done

[root@localhost ~]#
```

finally, our partition is ready for use

and here we go

```bash
[root@localhost ~]# mkdir /mnt/crypted1
[root@localhost ~]# mount /dev/mapper/crypted1 /mnt/crypted1/
[root@localhost ~]# echo "top s3cr3t" > /mnt/crypted1/file.txt
[root@localhost ~]# df -h
Filesystem               Size  Used Avail Use% Mounted on
/dev/mapper/fedora-root  6.5G  4.1G  2.0G  68% /
devtmpfs                 991M     0  991M   0% /dev
tmpfs                   1001M   96K 1001M   1% /dev/shm
tmpfs                   1001M  912K 1000M   1% /run
tmpfs                   1001M     0 1001M   0% /sys/fs/cgroup
tmpfs                   1001M   44K 1001M   1% /tmp
/dev/sda1                477M  103M  345M  23% /boot
tmpfs                    201M  4.0K  201M   1% /run/user/42
tmpfs                    201M   12K  201M   1% /run/user/1000
tmpfs                    201M     0  201M   0% /run/user/0
/dev/mapper/crypted1      91M  1.6M   83M   2% /mnt/crypted1
```

now we can unmount this partition and close it and our file is safe ;)

```bash
[root@localhost ~]# umount /mnt/crypted1
[root@localhost ~]# cryptsetup luksClose crypted1
```

happy privacy!
