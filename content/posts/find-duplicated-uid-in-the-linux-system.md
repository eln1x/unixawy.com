---
title: "Detecting Duplicate User IDs (UIDs) in Linux"
date: 2015-07-16T02:03:09+00:00
url: "/find-duplicated-uid-in-the-linux-system/"
draft: false
description: "How to audit Linux passwd databases for duplicate UIDs—a common indicator of backdoor accounts and local privilege abuse."
categories: ["Linux", "Security"]
tags: ["linux", "auditing", "users", "uid", "bash"]
---

In Linux, user identity and permissions are determined strictly by numerical User IDs (**UIDs**), not usernames. If multiple user accounts share the same UID, they possess identical access rights across the file system.

Attackers who compromise a system sometimes create a secondary account (e.g., `guest` or `support`) with `UID 0` to maintain stealthy root access without alerting administrators reviewing login usernames.

### Finding Duplicate UIDs

To inspect all local and directory accounts (including LDAP/NIS/SSSD if configured), query `getent passwd`:

```bash
getent passwd | cut -d : -f 3 | sort -n | uniq -d
```

### Breaking Down the Command:
- `getent passwd`: Retrieves all user accounts across local `/etc/passwd` and networked identity services.
- `cut -d : -f 3`: Extracts the 3rd field, which represents the UID.
- `sort -n`: Numerically sorts the UIDs.
- `uniq -d`: Outputs only duplicate entries.

If the command outputs `0`, an unprivileged-looking username has been mapped directly to root permissions.

### Finding Which Accounts Share a Duplicate UID

Once you identify a duplicate UID (for example, UID `1002` or `0`), query the specific users assigned to it:

```bash
awk -F: '$3 == 0 { print $1, $3 }' /etc/passwd
```
