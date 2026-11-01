---
title: "Enterprise Linux Security Patching with YUM and Red Hat Security Advisories (RHSA)"
date: 2015-06-29T09:40:05+00:00
url: "/redhat-packaging-security-with-yum/"
draft: false
description: "How to manage security patching on Red Hat Enterprise Linux and CentOS using YUM security plugins, RHSA IDs, CVE tracking, and updateinfo."
categories: ["blog", "Linux", "Security"]
---

Red Hat Enterprise Linux (RHEL) and derivative distributions classify package fixes into structured advisories:
- **RHSA (Red Hat Security Advisory):** Contains fixes for security vulnerabilities and assigned CVEs.
- **RHBA (Red Hat Bug Advisory):** Contains stability, performance, and bug fixes.
- **RHEA (Red Hat Enhancement Advisory):** Introduces non-critical product enhancements or feature additions.

Using the `yum-plugin-security` extension (standard in RHEL 6/7 and integrated directly into `dnf` on RHEL 8/9), system administrators can audit and apply security-only patches without risking unexpected major version upgrades.

---

## 1. Inspecting Available Security Updates

To query available security updates for installed packages without modifying the system, use `yum updateinfo`:

```bash
# List all pending security advisories
yum updateinfo list security

# Query security advisories affecting a specific package (e.g., openssl)
yum updateinfo list openssl
```

Example output:

```text
FEDORA-2015-0512  security openssl-1:1.0.1k-1.fc21.x86_64
FEDORA-2015-4303  security openssl-1:1.0.1k-6.fc21.x86_64
FEDORA-2015-10108 security openssl-1:1.0.1k-10.fc21.x86_64
```

To display full advisory details, including severity, affected bugzilla IDs, and CVE descriptions:

```bash
yum updateinfo info FEDORA-2015-9599
```

Output:

```text
===============================================================================
  qemu-2.1.3-8.fc21
===============================================================================
  Update ID : FEDORA-2015-9599
    Release : Fedora 21
       Type : security
     Status : stable
      Bugs  : 1151253 - User interface freezes when entering space character
            : 1222894 - qemu: insecure temporary file use in /net/slirp.c
            : 1222892 - CVE-2015-4037 qemu: insecure temporary file use
Description : Insecure temporary file usage in slirp networking layer.
```

---

## 2. Applying Security Patches

### Apply All Available Security Updates

To upgrade all installed packages that have an associated security advisory:

```bash
yum update --security
```

### Target a Specific Advisory (RHSA)

To deploy patches for a designated advisory ID:

```bash
yum update --advisory=RHSA-2015:0291
```

### Target Specific CVEs or Bugzilla Tickets

You can selectively apply patches addressing designated vulnerability identifiers:

```bash
yum update --cve=CVE-2015-4037
# Or combine Bugzilla IDs and CVE identifiers
yum update --bzs=1222892,1222894 --cves=CVE-2015-4037
```

---

## 3. Best Practices for Production Environments

1. **Verify Backported Patches:** Red Hat frequently backports security fixes into stable upstream package releases without bumping the major software version. This preserves API/ABI compatibility across enterprise environments.
2. **Review Changelogs:** Inspect package changes prior to upgrading:
   ```bash
   rpm -q --changelog openssl | head -n 20
   ```
3. **Simulate Transactions:** Always test the update transaction first:
   ```bash
   yum update --security --assumeno
   ```
