---
title: "Hardening Linux Passwords with pam_cracklib and pam_pwquality"
date: 2015-08-03T18:33:37+00:00
url: "/password-policy-with-pam_cracklib/"
draft: false
description: "A practical guide to enforcing strict password complexity, dictionary checks, and immediate expiration across Linux accounts using pam_cracklib."
categories: ["Linux", "Security"]
tags: ["linux", "pam", "pam_cracklib", "password-policy", "hardening", "sysadmin"]
---

Weak passwords remain one of the most common vectors for initial access and lateral movement in enterprise Linux environments. By default, many Linux distributions enforce minimal password complexity rules.

The `pam_cracklib` module (and its modern successor `pam_pwquality`) provides password strength checks by testing proposed passwords against dictionary wordlists, entropy requirements, and complexity rules.

---

### Key Configuration Parameters

Understanding the parameter syntax:
- Positive credits (e.g., `dcredit=1`): Bonus characters that reduce the required total length.
- Negative credits (e.g., `dcredit=-1`): **Strict minimum requirements** (must contain at least that number of characters).

| Parameter | Function | Recommended Setting |
| :--- | :--- | :--- |
| `minlen=12` | Minimum total characters required | `12` or higher |
| `dcredit=-1` | Minimum number of digits required | `-1` |
| `ucredit=-1` | Minimum uppercase characters required | `-1` |
| `lcredit=-1` | Minimum lowercase characters required | `-1` |
| `ocredit=-1` | Minimum special/punctuation symbols required | `-1` |
| `maxrepeat=2` | Maximum consecutive repeated characters | `2` |
| `reject_username` | Forbids passwords containing the username | Included |
| `enforce_for_root` | Enforces the policy on the `root` account | **Crucial** |
| `dictpath=<path>` | Custom wordlist path for dictionary checks | e.g., `/usr/share/dict/words` |

---

### Step 1: Configuring PAM Password Policy

In Red Hat, CentOS, and Debian/Ubuntu derivatives, password policies are typically applied in `/etc/pam.d/system-auth` (RHEL/CentOS) or `/etc/pam.d/common-password` (Debian/Ubuntu):

```text
# Example /etc/pam.d/system-auth
password    required    pam_cracklib.so try_first_pass retry=3 minlen=12 dcredit=-1 ucredit=-1 ocredit=-1 lcredit=-1 reject_username enforce_for_root
```

When users attempt to set a non-compliant password, PAM immediately rejects the update with specific feedback:
- `BAD PASSWORD: is too similar to the old one`
- `BAD PASSWORD: it is based on a dictionary word`
- `BAD PASSWORD: it is based on a (reversed) dictionary word`
- `BAD PASSWORD: it does not contain enough DIFFERENT characters`
- `BAD PASSWORD: it is too short`

---

### Step 2: Enforcing Immediate Password Resets on Next Login

To immediately enforce the new policy across all interactive users on the system, set their password expiration date to zero using `chage`:

```bash
# Expire passwords for all users with an interactive shell (excluding system accounts)
for user in $(awk -F: '$7 ~ /(bash|sh|zsh)$/ && $1 != "root" { print $1 }' /etc/passwd); do
    sudo chage -d 0 "$user"
done
```

#### User Experience upon Next Login:

```text
$ ssh operator@target.corp
operator@target.corp's password:
WARNING: Your password has expired.
You must change your password now and login again!
Changing password for user operator.
(current) UNIX password: 
New password: 
Retype new password: 
passwd: all authentication tokens updated successfully.
Connection to target.corp closed.
```

The user is forced to choose a new password meeting the `pam_cracklib` complexity standard before obtaining an interactive shell.
