---
title: "Persistent Automated Mounting for LUKS Encrypted Volumes at Boot"
date: 2015-07-05T04:18:13+00:00
url: "/persistent-mount-for-luks-with-unlock-key/"
draft: false
description: "How to configure automated headless unlocking and persistent mounting for LUKS block devices on system boot using keyfiles, /etc/crypttab, and /etc/fstab."
categories: ["Linux", "Security"]
tags: ["linux", "encryption", "luks", "crypttab", "fstab", "automation", "sysadmin"]
---

In [Block-Level Disk Encryption with LUKS](/linux-disk-encryption-with-luks/), we explored interactive unlocking via passphrases. However, on unattended servers, secondary data drives or database volumes must frequently unlock and mount automatically during system boot without manual console intervention.

This guide outlines configuring keyfile-based authentication for LUKS partitions using `/etc/crypttab` and `/etc/fstab`.

> **Security Architecture Note:** Storing a plaintext decryption key on the same machine that hosts the encrypted data protects against drive theft (decommissioning or drive pulling), but does **not** protect against complete machine theft where the root filesystem is unencrypted. Ensure your root partition is also protected or store the key on a dedicated hardware token / TPM / networked keyserver.

---

### Step 1: Generate a High-Entropy Keyfile

Generate a 4096-byte random keyfile from `/dev/urandom` and restrict permissions strictly to `root`:

```bash
sudo dd if=/dev/urandom of=/etc/luks_keys/sdb1.key bs=512 count=8
sudo chmod 400 /etc/luks_keys/sdb1.key
```

---

### Step 2: Enroll the Keyfile into a LUKS Key Slot

LUKS supports up to 8 independent key slots. You can keep your existing interactive passphrase in Slot 0 while adding the keyfile to Slot 1:

```bash
sudo cryptsetup luksAddKey /dev/sdb1 /etc/luks_keys/sdb1.key
```
Enter an existing valid passphrase to authorize enrolling the new key.

---

### Step 3: Configure `/etc/crypttab`

The `/etc/crypttab` file instructs the system to initialize encrypted device mappings during early boot before mounting filesystems.

Edit `/etc/crypttab`:

```text
# <target_name>    <source_device>         <key_file_path>             <options>
secure_storage     /dev/sdb1               /etc/luks_keys/sdb1.key     luks
```

*(Best Practice: Replace `/dev/sdb1` with its persistent UUID obtained via `blkid /dev/sdb1`, e.g. `UUID=9d6073d6-2536-4d5a-b21d-9586d20f4acf`)*.

---

### Step 4: Configure `/etc/fstab` for Persistent Mounting

Add an entry in `/etc/fstab` pointing to the decrypted device mapper node:

```text
/dev/mapper/secure_storage    /mnt/secure_data    ext4    defaults,nofail    0  2
```
Adding `nofail` ensures that if the secondary drive fails to initialize, the operating system continues booting into an interactive maintenance shell rather than hanging.

---

### Step 5: Test Without Rebooting

Test your configuration immediately to ensure there are no syntax errors:

```bash
# Test crypttab configuration
sudo cryptdisks_start secure_storage
# (Or on systemd: sudo systemctl restart systemd-cryptsetup@secure_storage)

# Test fstab mounting
sudo mount -a
```

Verify that `/mnt/secure_data` is mounted and operational. The volume will now automatically unlock and mount across all subsequent system reboots.
