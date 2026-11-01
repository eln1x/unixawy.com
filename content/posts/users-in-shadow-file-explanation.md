---
title: "Dissecting the Linux /etc/shadow File: Password Hashes and Aging Fields"
date: 2015-07-16T01:09:24+00:00
url: "/users-in-shadow-file-explanation/"
draft: false
description: "A detailed breakdown of the 9 fields in the Linux /etc/shadow file, password hash algorithms ($1, $5, $6), epoch timestamp math, and account aging with chage."
categories: ["Linux", "Security"]
tags: ["linux", "shadow", "password-security", "chage", "cryptography", "sysadmin"]
---

In Linux, user account definitions reside in `/etc/passwd` (world-readable), while encrypted password hashes and credential aging rules reside in `/etc/shadow` (restricted to root with `0640` or `0600` permissions).

Understanding `/etc/shadow` field definitions is essential for system auditing, incident response, and credential analysis.

---

### Anatomy of an `/etc/shadow` Entry

Each line consists of **9 colon-separated fields**:

```text
n1x:$6$UoDmVdoW$tYQQm5uHgOpe...:16631:7:15:2:14:16819:
```

| Field # | Attribute Name | Value in Example | Description |
| :---: | :--- | :--- | :--- |
| **1** | **Username** | `n1x` | Account login name matching `/etc/passwd`. |
| **2** | **Encrypted Password** | `$6$UoDmVdoW$...` | Cryptographic hash prefixed by algorithm identifier. |
| **3** | **Last Changed Date** | `16631` | Days since the Unix Epoch (Jan 1, 1970) when password was last updated. |
| **4** | **Minimum Age** | `7` | Days user must wait before they can change password again. |
| **5** | **Maximum Age** | `15` | Days before the password expires and must be changed. |
| **6** | **Warning Period** | `2` | Days prior to expiration that warning prompts begin displaying. |
| **7** | **Inactivity Period** | `14` | Days after expiration during which user can still change password; past this, account is disabled. |
| **8** | **Expiration Date** | `16819` | Absolute date (in days since epoch) when account is permanently disabled. |
| **9** | **Reserved** | *(empty)* | Flag reserved for future operating system use. |

---

### Identifying Password Hash Algorithms

The second field begins with `$id$salt$hash`. The ID reveals the cryptographic hashing algorithm used:

- **`$1$`**: Legacy MD5
- **`$2a$` / `$2y$`**: Blowfish (bcrypt)
- **`$5$`**: SHA-256
- **`$6$`**: SHA-512 (standard on modern Linux distributions)
- **`$y$`**: Yescrypt (modern default on Debian 12+ and Fedora)
- **`!`** or **`*`**: Account locked or password disabled (cannot log in via password).

---

### Calculating Human-Readable Dates from Epoch Days

To convert the integer day counts (such as `16631` or `16819`) into standard dates using Python:

```python
from datetime import datetime, timedelta

epoch = datetime(1970, 1, 1)
last_changed = epoch + timedelta(days=16631)
print(last_changed.strftime("%Y-%m-%d"))
# Output: 2015-07-15
```

---

### Managing Shadow Policies with `chage`

Rather than manually editing `/etc/shadow`, use the `chage` (change age) command:

```bash
# Set aging policy: min 7 days, max 90 days, warn 7 days, inactive 14 days, expire 2026-12-31
sudo chage -m 7 -M 90 -W 7 -I 14 -E 2026-12-31 n1x

# Display active account aging details
sudo chage -l n1x
```

### System-Wide Default Settings (`/etc/login.defs`)

To set default aging rules for all newly created accounts, configure `/etc/login.defs`:

```text
PASS_MAX_DAYS   90
PASS_MIN_DAYS   7
PASS_WARN_AGE   7
PASS_MIN_LEN    12
```
