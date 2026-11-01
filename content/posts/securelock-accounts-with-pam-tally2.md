---
title: "Account Lockout on Failed Logins with pam_tally2 / pam_faillock"
date: 2015-08-05T00:50:28+00:00
url: "/securelock-accounts-with-pam-tally2/"
draft: false
description: "How to configure PAM to automatically lock accounts after repeated failed login attempts across SSH, consoles, and TTYs using pam_tally2."
categories: ["Linux", "Security"]
tags: ["linux", "pam", "pam_tally2", "pam_faillock", "brute-force", "hardening"]
---

Unthrottled authentication services are susceptible to online credential brute forcing and password spraying attacks. While tools like `fail2ban` monitor application logs to block IP addresses at the firewall layer, PAM modules enforce account lockouts at the OS level across all authentication entry points (SSH, TTY consoles, display managers, and `su`).

Historically handled by `pam_tally2` (and superseded in RHEL 8+ / Debian 11+ by `pam_faillock`), this module tracks failed attempts and locks accounts for a specified duration.

---

### Key Configuration Parameters

| Parameter | Purpose | Example |
| :--- | :--- | :--- |
| `deny=<N>` | Lock account after `N` failed attempts | `deny=5` |
| `unlock_time=<seconds>` | Duration before account automatically unlocks | `unlock_time=900` (15 mins) |
| `even_deny_root` | Apply lockout policy to the `root` user | Included |
| `root_unlock_time=<seconds>` | Dedicated unlock duration for `root` | `root_unlock_time=300` (5 mins) |

> **Warning:** When using `even_deny_root`, ensure `root_unlock_time` is configured to avoid permanent denial-of-service on local consoles.

---

### Configuring PAM Stacks

Account lockout requires directives in two separate PAM management groups:
1. **`auth`**: Increments the failure counter when authentication fails, or resets it upon success.
2. **`account`**: Checks if the failure count exceeds `deny` and refuses access before verifying other credentials.

#### 1. Local TTY Logins (`/etc/pam.d/system-auth`)

```text
auth        required      pam_env.so
auth        required      pam_tally2.so deny=5 unlock_time=900 even_deny_root root_unlock_time=300
auth        sufficient    pam_unix.so nullok try_first_pass
auth        required      pam_deny.so

account     required      pam_tally2.so
account     required      pam_unix.so
account     required      pam_permit.so
```

#### 2. Remote SSH Logins (`/etc/pam.d/password-auth`)

Mirror the configuration in `/etc/pam.d/password-auth` to ensure remote SSH sessions are constrained by the same lockout counters:

```text
auth        required      pam_tally2.so deny=5 unlock_time=900 even_deny_root root_unlock_time=300
account     required      pam_tally2.so
```

---

### Audit Logs in `/var/log/secure`

When an account exceeds the threshold, PAM logs the lockout event and refuses connection:

```text
Aug  5 02:09:53 centos-6 login: pam_tally2(login:auth): user operator (1001) tally 6, deny 5
Aug  5 02:13:37 centos-6 sshd[12921]: pam_tally2(sshd:auth): user operator (1001) tally 7, deny 5
```

---

### Monitoring and Resetting Locked Accounts

Administrators can inspect and reset lockout tallies using the `pam_tally2` utility:

#### View current failed login tallies:
```bash
sudo pam_tally2
# Login     Failures Latest failure     From
# operator         6 08/05/26 02:11:45  192.168.72.1
```

#### Inspect a specific user:
```bash
sudo pam_tally2 -u operator
```

#### Manually unlock and reset an account counter:
```bash
sudo pam_tally2 -u operator --reset
```
*(On modern systems running `pam_faillock`, use `faillock --user operator --reset`).*
