---
title: "Fixing phpMyAdmin Error #1146: Table 'phpmyadmin.pma_tracking' Doesn't Exist"
date: 2016-06-26T13:45:41+00:00
url: "/phpmyadmin-error-1146-table-phpmyadmin-pma_tracking-doesnt-exist/"
draft: false
description: "How to resolve MySQL error #1146 (Table 'phpmyadmin.pma_tracking' doesn't exist) on Ubuntu and Debian systems by repairing the phpMyAdmin configuration storage database."
categories: ["blog", "Databases", "Linux"]
image: "/uploads/2016/06/Screen-Shot-2016-06-26-at-1.21.13-PM.png"
---

When navigating through phpMyAdmin, you may encounter the following error:

```text
#1146 - Table 'phpmyadmin.pma_tracking' doesn't exist
```

![phpMyAdmin error 1146](/uploads/2016/06/Screen-Shot-2016-06-26-at-1.21.13-PM.png)
*Figure 1: Missing internal configuration storage tables in phpMyAdmin.*

This error indicates that phpMyAdmin's internal metadata and configuration storage database (`phpmyadmin`) was either skipped during initial package installation or failed to execute its SQL initialization scripts.

---

## Solution 1: Reconfigure via `dpkg-reconfigure` (Recommended)

On Debian and Ubuntu systems, the cleanest method to repair the metadata database is using `dbconfig-common` via `dpkg-reconfigure`:

```bash
sudo dpkg-reconfigure phpmyadmin
```

![dpkg-reconfigure phpmyadmin prompt](/uploads/2016/06/Screen-Shot-2016-06-26-at-1.29.55-PM.png)
*Figure 2: Prompting dbconfig-common to recreate the database.*

1. Select **Yes** when prompted to configure the database for `phpmyadmin` with `dbconfig-common`.
2. Provide the MySQL administrative password to grant setup permissions.
3. Choose a password for the internal `phpmyadmin` database user (or leave blank for an automatically generated string).

---

## Solution 2: Manual SQL Script Import

If you installed phpMyAdmin manually or prefer to provision the required schema by hand:

1. Locate the default schema creation script provided by phpMyAdmin:

```bash
# Common paths for create_tables.sql:
/usr/share/doc/phpmyadmin/examples/create_tables.sql.gz
# or
/usr/share/phpmyadmin/sql/create_tables.sql
```

2. Decompress and import the SQL schema into your MySQL server:

```bash
zcat /usr/share/doc/phpmyadmin/examples/create_tables.sql.gz | mysql -u root -p
```

3. Ensure `/etc/phpmyadmin/config.inc.php` has the tracking table configured:

```php
$cfg['Servers'][$i]['tracking'] = 'pma__tracking';
```

Log out and back in to phpMyAdmin; the tracking table error will be resolved.
