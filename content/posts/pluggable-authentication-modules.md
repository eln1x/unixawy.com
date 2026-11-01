---
title: "Understanding Linux Pluggable Authentication Modules (PAM)"
date: 2015-08-03T16:51:56+00:00
url: "/pluggable-authentication-modules/"
draft: false
description: "A comprehensive guide to Linux Pluggable Authentication Modules (PAM): management groups, control flags, module stacks, and configuration architecture."
categories: ["Linux", "Security"]
tags: ["linux", "pam", "authentication", "sysadmin", "hardening"]
---

Linux uses **Pluggable Authentication Modules (PAM)** to decouple system applications (such as `sshd`, `login`, `sudo`, and `su`) from underlying authentication mechanisms. Instead of hardcoding authentication logic into each daemon, applications dynamically link against PAM (`libpam.so`).

To verify whether a service supports PAM, check its dynamic libraries with `ldd`:

```bash
ldd $(which sshd) | grep pam
# libpam.so.0 => /lib64/libpam.so.0 (0x00007f81348fc000)
```

---

### PAM Configuration Structure

PAM configuration files reside in `/etc/pam.d/`. Each service typically has its own configuration file (e.g., `/etc/pam.d/sshd`, `/etc/pam.d/sudo`).

Each rule in a PAM configuration follows a 4-part syntax:

```text
<Management_Group>    <Control_Flag>    <Module_Path>    [Arguments/Options]
```

#### Example `/etc/pam.d/sshd`:
```text
auth       required     pam_sepermit.so
auth       include      password-auth
account    required     pam_nologin.so
account    include      password-auth
password   include      password-auth retry=5
session    required     pam_selinux.so close
session    required     pam_loginuid.so
session    required     pam_selinux.so open env_params
session    optional     pam_keyinit.so force revoke
session    include      password-auth
```

---

### 1. Management Groups (Interfaces)

PAM divides authentication into four distinct tasks:

| Group | Purpose | Description |
| :--- | :--- | :--- |
| **`auth`** | Authentication | Validates user identity (prompts for passwords, OTP tokens, or biometric data). |
| **`account`** | Account Validation | Verifies account status (checks expiration dates, allowed login hours, or access limits). |
| **`password`** | Credential Updates | Handles password changes and enforces complexity rules. |
| **`session`** | Session Management | Configures and tears down user environments (mounting directories, setting resource limits, auditing TTYs). |

---

### 2. Control Flags

Control flags determine how PAM handles success or failure as it evaluates a stack from top to bottom:

- **`required`**: Must succeed for the overall authentication request to pass. If it fails, PAM continues executing the remaining modules in the stack, but the final outcome is guaranteed failure (prevents leaking which specific check failed).
- **`requisite`**: Must succeed. If it fails, PAM **immediately aborts** execution of that stack and rejects the request.
- **`sufficient`**: If this module succeeds and no previous `required` module has failed, PAM immediately grants success without evaluating the rest of the stack. If it fails, the failure is ignored and execution continues.
- **`optional`**: Success or failure is generally ignored unless no other modules in the stack return a definitive status.
- **`include`**: Pulls in all lines from another configuration file matching the current management group.

> **Important:** PAM processes rules in strict top-to-bottom order. The sequence of rules is critical to security.

---

### 3. Modules and Arguments

PAM modules are shared libraries located in `/lib/security/` or `/lib64/security/`:

```bash
file /lib64/security/pam_cracklib.so
# /lib64/security/pam_cracklib.so: ELF 64-bit LSB shared object, x86-64, dynamically linked
```

Each module accepts specific arguments. For example, `pam_cracklib.so` enforces password strength:

```text
password   required   pam_cracklib.so retry=3 minlen=12 dcredit=-1 ucredit=-1 ocredit=-1
```

- `minlen=12`: Minimum 12 characters.
- `dcredit=-1`: At least one digit required.
- `ucredit=-1`: At least one uppercase character required.
- `ocredit=-1`: At least one special/other symbol required.

Changes to `/etc/pam.d/` take effect immediately on new connection attempts without requiring daemon restarts.
