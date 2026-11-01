---
title: "Automation: Creating UTF-8 MySQL Databases and Users via Python"
date: 2014-11-24T08:46:44+00:00
url: "/script-mysql-create-database-utf-8-with-user-and-password/"
draft: false
description: "A Python utility to streamline provisioning MySQL databases configured with UTF-8 character encoding, along with dedicated application users and privileges."
categories: ["blog", "Databases", "Python"]
image: "/uploads/2014/11/mysql_utf8.png"
---

When provisioning new web applications or services, setting up clean UTF-8 databases and isolating access permissions to dedicated application users is a routine administrative task.

Using the proper character set (`utf8mb4` in modern MySQL, or `utf8` in legacy environments) prevents multi-byte character encoding errors and collation mismatches.

---

## The Standard SQL Provisioning Queries

The standard sequence to create an application database with UTF-8 support and grant least-privilege permissions to a dedicated user is:

```sql
-- Create database with UTF-8 encoding
CREATE DATABASE `unixawy` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Create application user and grant permissions
CREATE USER 'unixawy_user'@'localhost' IDENTIFIED BY 'StrongGeneratedPassword';
GRANT ALL PRIVILEGES ON `unixawy`.* TO 'unixawy_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## Python Provisioning Automation Script

To avoid repetitive manual command-line tasks, this Python script automates database creation, user creation, privilege assignment, and confirmation prompting:

![MySQL UTF-8 Script Execution](/uploads/2014/11/mysql_utf8.png)
*Figure 1: Automated database and credential generation.*

```python
#!/usr/bin/env python3
"""
Automated MySQL Database and User Provisioning Script
Author: Ahmad Mahfouz (_N1X_)
Description: Provisions a UTF-8 database with an isolated local user.
"""

import sys
import subprocess
import getpass

def run_query(sql_query, host, root_user, root_password):
    """Executes a SQL query via the mysql client binary."""
    cmd = [
        "mysql",
        f"-h{host}",
        f"-u{root_user}",
        f"-p{root_password}",
        "-e", sql_query
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"[!] SQL Execution Error: {res.stderr.strip()}")
        sys.exit(1)

def main():
    if len(sys.argv) < 4:
        print("Usage: python mysql_provision.py <database_name> <username> <password> [host]")
        sys.exit(1)

    db_name = sys.argv[1]
    username = sys.argv[2]
    password = sys.argv[3]
    host = sys.argv[4] if len(sys.argv) > 4 else "localhost"

    root_user = input("MySQL Root User [root]: ").strip() or "root"
    root_password = getpass.getpass("MySQL Root Password: ")

    create_db_query = (
        f"CREATE DATABASE IF NOT EXISTS `{db_name}` "
        f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    )
    create_user_query = (
        f"CREATE USER IF NOT EXISTS '{username}'@'localhost' IDENTIFIED BY '{password}';"
    )
    grant_query = (
        f"GRANT ALL PRIVILEGES ON `{db_name}`.* TO '{username}'@'localhost'; "
        f"FLUSH PRIVILEGES;"
    )

    print("\n--- Planned SQL Actions ---")
    print(create_db_query)
    print(create_user_query)
    print(grant_query)
    print("---------------------------\n")

    confirm = input("Execute these statements on target host? (y/N): ").strip().lower()
    if confirm != 'y':
        print("Aborted.")
        sys.exit(0)

    print("[*] Creating database...")
    run_query(create_db_query, host, root_user, root_password)

    print("[*] Creating user and assigning privileges...")
    run_query(create_user_query, host, root_user, root_password)
    run_query(grant_query, host, root_user, root_password)

    print(f"[+] Successfully provisioned database '{db_name}' for user '{username}'.")

if __name__ == "__main__":
    main()
```
