---
title: "Host-Based File Integrity Monitoring with AIDE"
date: 2015-07-14T05:05:05+00:00
url: "/aide-intrusion-detection-environment/"
draft: false
description: "How to configure Advanced Intrusion Detection Environment (AIDE) on Linux to detect unauthorized file tampering, privilege escalations, ACL changes, and rootkits."
categories: ["Linux", "Security"]
tags: ["aide", "file-integrity-monitoring", "fim", "linux", "intrusion-detection", "sysadmin", "compliance"]
---

When an adversary compromises a Linux server, they frequently alter system binaries (installing backdoored binaries like `sshd` or `login`), inject malicious cronjobs, modify web directories, or alter file permissions (e.g., granting SUID or world-writable access).

**AIDE (Advanced Intrusion Detection Environment)** is a host-based File Integrity Monitoring (FIM) tool that builds a cryptographic baseline database of file attributes, hashes, permissions, and SELinux labels to detect file tampering.

---

### How AIDE Operates

AIDE scans the filesystem according to rules defined in `/etc/aide.conf`, calculates cryptographic checksums (SHA-256, SHA-512) and metadata attributes for each file, and stores them in a baseline database (`/var/lib/aide/aide.db.gz`).

On subsequent verification runs (`aide --check`), AIDE compares the live filesystem against the baseline database and generates a report detailing added, removed, or modified files.

---

### Step 1: Defining Custom Monitoring Rules

In `/etc/aide.conf`, you define rule groups using attribute flags:

| Flag | Monitored Attribute |
| :--- | :--- |
| **`p`** | File permissions |
| **`i`** | Inode number |
| **`u` / `g`** | User / Group ownership |
| **`s`** | File size |
| **`m` / `c`** | Modification time (mtime) / Inode change time (ctime) |
| **`sha256`** | SHA-256 cryptographic hash |
| **`acl`** | Extended Access Control Lists |
| **`selinux`** | SELinux security context label |

#### Example Custom Rule:
```text
# Monitor web root for permission tampering, ownership changes, and hash modifications
WEBMON = p+i+u+g+s+m+c+sha256+acl+selinux

# Apply rule to directory tree
/var/www/html/n1x   WEBMON

# Exclude noisy, dynamic cache directories
!/var/www/html/n1x/cache
```

---

### Step 2: Initializing the Cryptographic Baseline

Initialize the database:

```bash
sudo aide --init
```

AIDE outputs the initialized database to `/var/lib/aide/aide.db.new.gz`. Install it as the active baseline:

```bash
sudo cp /var/lib/aide/aide.db.new.gz /var/lib/aide/aide.db.gz
```

> **Security Best Practice:** In high-assurance environments, store the active baseline `aide.db.gz` on read-only media or an off-box logging server to prevent attackers who gain root from updating the baseline.

---

### Step 3: Running Integrity Audits

To audit the filesystem against the baseline:

```bash
sudo aide --check
```

#### Sample Tampering Report:

```text
AIDE 0.15.1 found differences between database and filesystem!!

Summary:
  Total number of files:  143950
  Added files:            1
  Removed files:          0
  Changed files:          1

---------------------------------------------------
Changed files:
---------------------------------------------------
Directory: /var/www/html/n1x
 Perm     : drwxr-xr-x                       , drwxrwxrwx
 ACL      : old = user::rwx,group::r-x,other::r-x
            new = user::rwx,group::rwx,other::rwx

File: /var/log/lastlog
 SHA256   : zXYJguRcLmAJIGA66Wwx5FdKfHav3nfY , ZWr5tR5LHN1t5uEIGGmTz4ZSkvQcev6X
```

The report immediately flags that `/var/www/html/n1x` was changed to world-writable (`777`) and `/var/log/lastlog` had its contents modified.
