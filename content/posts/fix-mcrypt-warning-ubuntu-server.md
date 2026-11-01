---
title: "Resolving PHP Mcrypt Extension Symlink Conflicts on Ubuntu Server"
date: 2016-06-26T12:39:03+00:00
url: "/fix-mcrypt-warning-ubuntu-server/"
draft: false
description: "How to fix the PHP mcrypt module warning on Ubuntu Server when conflicting configuration symlinks prevent php5enmod from activating the extension."
categories: ["blog", "Linux", "Web"]
---

When configuring legacy PHP environments on Ubuntu Server and attempting to activate the `mcrypt` cryptographic module, administrators may encounter symlink collision warnings.

---

## The Error Condition

After installing the extension packages:

```bash
sudo apt-get install mcrypt php5-mcrypt
```

Attempting to register the module via `php5enmod` produces the following error:

```text
root@ubuntu:~# php5enmod mcrypt
WARNING: Not enabling the mcrypt module for apache2 SAPI since module symlink
WARNING: already exists in /etc/php5/apache2/conf.d with different content.
WARNING: Not enabling the mcrypt module for cli SAPI since module symlink
WARNING: already exists in /etc/php5/cli/conf.d with different content.
```

This error occurs when old or stale configuration symlinks pointing to prior configuration targets exist in the SAPI configuration directories (`/etc/php5/apache2/conf.d/` and `/etc/php5/cli/conf.d/`), preventing the package manager from linking the canonical `/etc/php5/mods-available/mcrypt.ini`.

---

## Resolution

1. Remove the stale symlinks from the active SAPI configuration directories:

```bash
sudo unlink /etc/php5/apache2/conf.d/20-mcrypt.ini
sudo unlink /etc/php5/cli/conf.d/20-mcrypt.ini
```

2. Re-enable the module cleanly across all SAPIs:

```bash
sudo php5enmod mcrypt
```

3. Restart Apache to apply the module to the web runtime:

```bash
sudo service apache2 restart
```

Verify that `mcrypt` is loaded by querying the CLI runtime:

```bash
php -m | grep -i mcrypt
```
