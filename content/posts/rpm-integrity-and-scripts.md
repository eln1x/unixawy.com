---
title: "RPM Package Security: Cryptographic Verification and Scriptlet Auditing"
date: 2015-06-30T02:54:40+00:00
url: "/rpm-integrity-and-scripts/"
draft: false
description: "How to inspect GPG signatures, checksum digests, and embedded root install scriptlets in RPM packages to prevent software supply-chain compromises in Red Hat and CentOS."
categories: ["Linux", "Security"]
tags: ["rpm", "yum", "gpg", "supply-chain", "redhat", "centos", "sysadmin"]
---

Installing software packages from untrusted third-party repositories poses substantial security risks. In RPM-based systems (RHEL, CentOS, Fedora), an RPM is not merely an archive of binaries—it contains cryptographic signatures, file digests, and **embedded shell scripts ("scriptlets") that execute with full root privileges** during installation and removal.

Here is how to audit RPM package integrity and inspect scriptlets prior to execution.

---

### 1. Auditing Installed GPG Keys

When YUM/DNF installs signed packages, it checks them against GPG public keys registered in the local RPM database.

To enumerate all installed GPG keys:

```bash
rpm -qa gpg-pubkey*
# gpg-pubkey-e8562897-459f07a4
# gpg-pubkey-217521f6-45e8a532
```

To display metadata (signer name, key ID, expiration date) for a specific installed key:

```bash
rpm -qi gpg-pubkey-217521f6-45e8a532
```

---

### 2. Validating Package Signatures Prior to Installation

Before installing a downloaded `.rpm` file, verify its cryptographic GPG signature and payload digest:

```bash
rpm -K package.rpm
# package.rpm: (sha1) dsa sha1 md5 gpg OK
```

To view verbose signature details and determine exactly which key ID signed the binary:

```bash
rpm -vvK package.rpm
```
```text
D: Header V3 DSA signature: OK, key ID 862acc42
D: Header SHA1 digest: OK
D: MD5 digest: OK
```
If an RPM has been tampered with or signed by an untrusted key, RPM warns `NOT OK (MISSING KEYS)` or flags checksum mismatches.

---

### 3. Auditing Embedded RPM Scriptlets

A common supply-chain attack vector involves inserting malicious commands into RPM package lifecycle scripts. RPM packages can define four execution phases:
- `preinstall` (`%pre`): Runs before files are unpacked.
- `postinstall` (`%post`): Runs immediately after files are written.
- `preuninstall` (`%preun`): Runs before package removal.
- `postuninstall` (`%postun`): Runs after package removal.

To extract and review these scriptlets before installing an unverified package:

```bash
rpm -qp --scripts package.rpm
```

#### Example Output:
```bash
preinstall scriptlet (using /bin/sh):
getent group openvpn &>/dev/null || groupadd -r openvpn
getent passwd openvpn &>/dev/null || \
    /usr/sbin/useradd -r -g openvpn -s /sbin/nologin -c OpenVPN \
        -d /etc/openvpn openvpn

postinstall scriptlet (using /bin/sh):
/sbin/systemctl daemon-reload
```

---

### 4. Installing While Suppressing Scriptlets

If you need to unpack or install an RPM without allowing its embedded scripts to execute (e.g., during forensic inspection or in minimal container builds):

```bash
# Suppress all pre/post scriptlets:
sudo rpm -ivh --noscripts package.rpm

# Suppress triggers:
sudo rpm -ivh --notriggers package.rpm
```
