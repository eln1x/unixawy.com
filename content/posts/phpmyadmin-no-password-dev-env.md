---
title: "Enabling Passwordless Login in phpMyAdmin for Local Development"
date: 2016-06-26T13:26:36+00:00
url: "/phpmyadmin-no-password-dev-env/"
draft: false
description: "How to resolve 'Login without a password is forbidden by configuration (see AllowNoPassword)' in phpMyAdmin for local developer environments."
categories: ["blog", "Linux", "Databases"]
---

When configuring a local development environment (such as on a virtual machine or local development container) where MySQL `root` has an empty password, phpMyAdmin blocks authentication attempts by default with the following error:

```text
Login without a password is forbidden by configuration (see AllowNoPassword)
```

This security safeguard prevents accidental deployment of passwordless database instances in publicly accessible environments.

---

## Enabling Empty Passwords in `config.inc.php`

To enable passwordless authentication for local sandbox testing, modify the phpMyAdmin configuration file:

```bash
sudo nano /etc/phpmyadmin/config.inc.php
```

Locate the `AllowNoPassword` directive within the server connection settings block (around line 96 in standard Debian/Ubuntu installations):

```php
/* $cfg['Servers'][$i]['AllowNoPassword'] = TRUE; */
```

Uncomment the line by removing the comment markers:

```php
$cfg['Servers'][$i]['AllowNoPassword'] = TRUE;
```

Save the file and exit the editor. You can now authenticate immediately to phpMyAdmin using username `root` with the password field left empty.

> [!CAUTION]
> Never enable `AllowNoPassword` on internet-facing servers or production infrastructure. Restrict this configuration exclusively to isolated local development sandboxes.
