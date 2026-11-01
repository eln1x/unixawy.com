---
title: "Hardening Linux Boot: Securing GRUB, Single-User Mode, and Console Hotkeys"
date: 2015-08-17T03:42:42+00:00
url: "/protect-bootsingle-user-mode/"
draft: false
description: "How to prevent unauthorized local console takeovers on Linux by password-protecting GRUB, enforcing sulogin on single-user recovery mode, and disabling console reboot interrupts."
categories: ["Linux", "Security"]
tags: ["linux", "grub", "boot-security", "single-user-mode", "hardening", "physical-security"]
image: "/uploads/2015/08/Screen-Shot-2015-08-17-at-3.32.33-AM.png"
---

Physical access to a Linux machine often guarantees total system compromise if boot configurations remain unhardened. By default, anyone with physical or KVM console access can interrupt the GRUB bootloader, append `single`, `init=/bin/sh`, or `emergency` to the kernel arguments, and bypass authentication into a root shell.

Securing the boot process requires hardening three independent layers:
1. **Password-protecting the GRUB bootloader**
2. **Requiring authentication for single-user/emergency mode**
3. **Disabling interactive startup prompts and console reboot hotkeys**

---

### 1. Password-Protecting Single-User Mode (`sulogin`)

In legacy SysVinit/Upstart configurations (`/etc/sysconfig/init`):
```text
# Default may allow unauthenticated root access via sushell:
# SINGLE=/sbin/sushell

# Change to sulogin to mandate root password verification:
SINGLE=/sbin/sulogin
```

On modern **systemd** distributions (RHEL 7/8/9, Ubuntu 18.04+), emergency and rescue targets invoke `/usr/lib/systemd/systemd-sulogin-shell` by default. Verify that root authentication is enforced before spawning maintenance shells:

```bash
# Check emergency service definition
systemctl cat emergency.service | grep ExecStart
# ExecStart=-/usr/lib/systemd/systemd-sulogin-shell emergency
```

When someone triggers maintenance mode, the console demands root credentials before granting shell access:

```text
Give root password for maintenance
(or type Control-D to continue):
```

---

### 2. Password-Protecting the GRUB2 Bootloader

Protecting the bootloader prevents unauthorized users from modifying kernel parameters or choosing alternate kernels without authentication:

1. **Generate an encrypted PBKDF2 password hash:**
   ```bash
   grub2-setpassword
   # (Or: grub-mkpasswd-pbkdf2)
   ```
   This stores the cryptographic hash in `/boot/grub2/user.cfg`.

2. **Define an authorized superuser in `/etc/grub.d/01_users`:**
   ```text
   cat <<EOF >> /etc/grub.d/01_users
   set superusers="admin"
   password_pbkdf2 admin grub.pbkdf2.sha512...
   EOF
   ```

3. **Rebuild the GRUB configuration:**
   ```bash
   # BIOS:
   sudo grub2-mkconfig -o /boot/grub2/grub.cfg
   # UEFI:
   sudo grub2-mkconfig -o /boot/efi/EFI/redhat/grub.cfg
   ```

Users can still boot standard kernels normally, but pressing `e` to edit parameters requires the `admin` password.

---

### 3. Disabling Interactive Startup (`PROMPT=no`)

During legacy startup sequences, pressing `i` initiates interactive startup, allowing anyone at the console to selectively bypass system services (including the firewall / `iptables`):

![Interactive Boot Bypass](/uploads/2015/08/Screen-Shot-2015-08-17-at-3.32.33-AM.png)

Disable this prompt in `/etc/sysconfig/init`:

```text
PROMPT=no
```

---

### 4. Disabling Console `Ctrl+Alt+Delete` Reboots

Prevent malicious or accidental console keystrokes from rebooting the server:

#### On systemd:
Mask the target responsible for handling the interrupt:

```bash
sudo systemctl mask ctrl-alt-del.target
```

#### On Upstart:
Override `/etc/init/control-alt-delete.override`:
```bash
echo "exec /usr/bin/logger -p authpriv.warning 'Ctrl-Alt-Delete pressed at console; reboot blocked.'" | sudo tee /etc/init/control-alt-delete.override
```
