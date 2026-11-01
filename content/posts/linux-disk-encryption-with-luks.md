---
title: "Block-Level Disk Encryption on Linux with LUKS and dm-crypt"
date: 2015-07-05T02:50:28+00:00
url: "/linux-disk-encryption-with-luks/"
draft: false
description: "A complete step-by-step walkthrough of formatting, unlocking, mounting, and securing encrypted Linux block partitions using cryptsetup and LUKS."
categories: ["Linux", "Security"]
tags: ["linux", "encryption", "luks", "dm-crypt", "storage", "privacy"]
---

**Linux Unified Key Setup (LUKS)** is the standard specification for Linux block-device encryption. Implemented via the `dm-crypt` kernel module and managed with `cryptsetup`, LUKS provides transparent disk encryption below the filesystem layer.

This guide walks through creating an encrypted partition on a storage device, initializing the LUKS header, formatting the decrypted mapping, and managing its mount lifecycle.

---

### Step 1: Partitioning the Target Disk

Identify your target drive (e.g., `/dev/sdb`) using `lsblk` or `fdisk -l`. Use `fdisk` or `parted` to create a partition:

```bash
sudo fdisk /dev/sdb
```
- Type `n` for a new primary partition.
- Specify partition size (e.g., `+100M` or full disk capacity).
- Type `w` to write the partition table.

Our new partition is now available at `/dev/sdb1`.

---

### Step 2: Initializing the LUKS Container (`luksFormat`)

Initialize the partition as an encrypted LUKS container:

```bash
sudo cryptsetup -y -v luksFormat /dev/sdb1
```

```text
WARNING!
========
This will overwrite data on /dev/sdb1 irrevocably.

Are you sure? (Type uppercase yes): YES
Enter passphrase: 
Verify passphrase: 
Command successful.
```

The partition now contains a LUKS header with encrypted key slots. Raw data cannot be read without the passphrase.

---

### Step 3: Unlocking the Encrypted Container (`luksOpen`)

To interact with the encrypted volume, decrypt and map it into the Linux Device Mapper:

```bash
sudo cryptsetup luksOpen /dev/sdb1 secure_storage
```

Enter your passphrase. Upon verification, the kernel creates an unencrypted virtual block device at:
`/dev/mapper/secure_storage`

---

### Step 4: Creating the Filesystem and Mounting

Format the virtual mapping with your preferred filesystem (e.g., `ext4` or `xfs`):

```bash
sudo mkfs.ext4 /dev/mapper/secure_storage
```

Create a mount point and mount the decrypted volume:

```bash
sudo mkdir -p /mnt/secure_data
sudo mount /dev/mapper/secure_storage /mnt/secure_data
```

Verify the active mount:

```bash
df -h /mnt/secure_data
# Filesystem                   Size  Used Avail Use% Mounted on
# /dev/mapper/secure_storage    91M  1.6M   83M   2% /mnt/secure_data
```

Any files written to `/mnt/secure_data` are automatically encrypted on-the-fly before writing to physical sectors on `/dev/sdb1`.

---

### Step 5: Locking Down the Encrypted Partition

When work is finished, cleanly unmount the filesystem and close the device mapper mapping:

```bash
# 1. Unmount the filesystem
sudo umount /mnt/secure_data

# 2. Tear down the decrypted kernel mapping
sudo cryptsetup luksClose secure_storage
```

Once closed, the device mapper node `/dev/mapper/secure_storage` is removed from the kernel, leaving only the encrypted raw sectors on `/dev/sdb1`.
