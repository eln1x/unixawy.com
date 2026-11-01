---
title: "Resetting MySQL and MariaDB Root Passwords"
date: 2014-11-24T08:15:35+00:00
url: "/rest-mysql-root-password/"
draft: false
description: "A practical guide to recovering and resetting a forgotten MySQL or MariaDB root password using skip-grant-tables or an init-file."
categories: ["blog", "Databases", "Linux"]
---

Locked out of MySQL with `ERROR 1045 (28000): Access denied for user 'root'@'localhost'`? 

When root credentials are lost or desynchronized, you cannot change the password while the daemon enforces standard privileges. You must restart the database daemon in a bypass mode, update the authentication tables, and restart the service normally.

Here are two reliable methods to recover access.

---

### Method 1: Using `--skip-grant-tables`

This method starts the daemon without reading the grant tables, allowing local root login without a password.

1. **Stop the running MySQL/MariaDB service:**
   ```bash
   sudo service mysqld stop
   # On systemd systems:
   # sudo systemctl stop mysqld
   ```

2. **Start MySQL safely without grant tables:**
   ```bash
   sudo mysqld_safe --skip-grant-tables &
   ```

3. **Log into MySQL without credentials:**
   ```bash
   mysql -u root
   ```

4. **Update the root user password:**
   ```sql
   USE mysql;
   UPDATE user SET password = PASSWORD("YOUR_NEW_PASSWORD") WHERE User = 'root';
   FLUSH PRIVILEGES;
   QUIT;
   ```
   *(Note: On modern MySQL 5.7+ / 8.0+, use `ALTER USER 'root'@'localhost' IDENTIFIED BY 'YOUR_NEW_PASSWORD';` or update `authentication_string`)*.

5. **Stop the temporary daemon and restart normally:**
   ```bash
   sudo killall mysqld
   sudo service mysqld start
   ```

---

### Method 2: Using an `--init-file`

If you prefer an automated single-pass reset without interactive shells:

1. **Create an initialization SQL script** (e.g., `/tmp/reset_pwd.txt`):
   ```sql
   UPDATE mysql.user SET Password = PASSWORD('YOUR_NEW_PASSWORD') WHERE User = 'root';
   FLUSH PRIVILEGES;
   ```

2. **Stop the database service:**
   ```bash
   sudo service mysqld stop
   ```

3. **Execute the init file with `mysqld_safe`:**
   ```bash
   sudo mysqld_safe --init-file=/tmp/reset_pwd.txt &
   ```

4. **Stop the instance and restart cleanly:**
   ```bash
   sudo killall mysqld
   rm -f /tmp/reset_pwd.txt
   sudo service mysqld start
   ```
