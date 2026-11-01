---
title: "Auditing User Keystrokes with pam_tty_audit and Linux Auditd"
date: 2015-10-07T22:36:23+00:00
url: "/audit-keystrokes-with-pam/"
draft: false
description: "How to capture and audit real-time interactive TTY keystrokes in Linux using the pam_tty_audit module and aureport, preventing bash history tampering."
categories: ["Linux", "Security"]
tags: ["linux", "pam", "auditd", "monitoring", "forensics", "ssh"]
---

Relying on standard shell history (`~/.bash_history`) for security auditing is fundamentally flawed: users can unset `HISTFILE`, launch sessions inside `screen`/`tmux`, prepend commands with spaces, or delete history files before logout.

To reliably monitor user commands at the kernel level, Linux provides the `pam_tty_audit` PAM module. This module enables TTY input logging directly through the Linux Audit daemon (`auditd`), capturing keystrokes before the shell receives them.

---

### Module Parameters

`pam_tty_audit.so` supports three key arguments:
1. `enable=<users>`: Comma-separated list or glob pattern of users to audit.
2. `disable=<users>`: Comma-separated list or glob pattern of users to exclude (e.g., `disable=*` to disable by default).
3. `open_only`: Prevents recording keystrokes when passwords or non-echoing prompts are active.

---

### Configuration: Auditing SSH Sessions

To audit all interactive commands executed over SSH by specific accounts (such as `root` and privileged operators):

1. **Edit the SSH PAM configuration** (`/etc/pam.d/sshd`):
   ```bash
   sudo vim /etc/pam.d/sshd
   ```

2. **Append the session directive at the end of the file:**
   ```text
   session    required     pam_tty_audit.so open_only disable=* enable=root,admin,tester
   ```

3. **Ensure the audit daemon is active:**
   ```bash
   sudo systemctl enable --now auditd
   ```

---

### Reviewing Captured Keystrokes

To review keystrokes captured across all audited TTY sessions, use `aureport`:

```bash
sudo aureport --tty
```

#### Example Output:

```text
TTY Report
===============================================
# date time tid comm data
===============================================
1. 10/07/2015 17:39:08 287 0 ? 18 bash "top",<ret>
2. 10/07/2015 17:39:09 289 0 ? 18 bash "ps",<ret>
3. 10/07/2015 17:39:11 291 0 ? 18 bash "ps awxf",<ret>
4. 10/07/2015 17:40:30 299 0 ? 18 bash "exit",<ret>
5. 10/07/2015 17:56:03 550 500 ? 28 bash "screen -r x",<ret>,"screen -dmS x",<ret>,"screen -r x",<ret>,<^D>
6. 10/07/2015 17:57:38 576 500 ? 29 bash "echo 100 > /dev/null",<ret>
```

Each log entry records:
- **Timestamp & UID**: e.g., UID `0` (`root`), UID `500` (`tester`).
- **Terminal PID & Shell**: The process context handling input.
- **Exact keystroke sequence**: Complete commands including control characters (`<ret>`, `^D`).
