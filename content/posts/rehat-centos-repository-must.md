---
title: "Essential Third-Party Repositories for Red Hat and CentOS"
date: 2014-12-14T17:44:29+00:00
url: "/rehat-centos-repository-must/"
draft: false
description: "A quick reference for adding essential third-party YUM repositories on Red Hat Enterprise Linux and CentOS (EPEL, IUS, Remi, and RPM Forge)."
categories: ["Linux", "SysAdmin"]
tags: ["redhat", "centos", "yum", "rpm", "repositories"]
---

Default Red Hat Enterprise Linux (RHEL) and CentOS installations include only core system packages. To install modern software stacks, development tools, and updated dependencies, administrators frequently configure trusted third-party repositories.

Here are the most common repositories and how to enable them on CentOS / RHEL:

### 1. EPEL (Extra Packages for Enterprise Linux)
Maintained by the Fedora Special Interest Group, EPEL provides a massive collection of high-quality supplemental packages:

```bash
sudo yum install epel-release -y
```

### 2. IUS (Inline with Upstream Stable)
Provides up-to-date versions of key software (such as Python and Git) for Enterprise Linux:

```bash
sudo rpm -ivh https://repo.ius.io/ius-release-el7.rpm
```

### 3. Remi Repository
Maintained by Remi Collet, this is the standard repository for recent PHP releases and associated web tooling:

```bash
sudo rpm -ivh http://rpms.famillecollet.com/enterprise/remi-release-7.rpm
```

### 4. Repoforge (RPMforge)
*(Archived reference)*: Formerly used for additional multimedia and utility tools:

```bash
sudo rpm -ivh http://pkgs.repoforge.org/rpmforge-release/rpmforge-release-0.5.3-1.el7.rf.x86_64.rpm
```

After installing your desired repository RPMs, clean and rebuild your YUM cache:

```bash
sudo yum clean all
sudo yum makecache
```
