---
title: "Rest MySQL root password"
date: 2014-11-24T08:15:35+00:00
url: "/rest-mysql-root-password/"
draft: false
description: "we all hate this ERROR 1045 (28000): the problem starts with \"you can't access and u will not be able to change the MySQL/MariaDB password while the service is..."
categories: ["blog", "Databases", "Linux"]
---

we all hate this ERROR 1045 (28000):

the problem starts with  "you can't access and u will not be able to change the MySQL/MariaDB password while the service is running u have to disable it and run mysqld_safe which will allow u to update the user table inside MySQL database with no password then u will be able to run MySQL/MariaDB again with  the new password"

First Solution

1 - service mysqld stop

2 - mysqld_safe --skip-grant-tables

3 - run mysql command it will let u in without password

4 - now u will be able to  update the user table

apply this code inside mysql shell

```sql
mysql> USER mysql;
mysql> UPDATE user set password=PASSWORD("UNIXAWY") where User='root';
mysql> flush privileges;
mysql> quit
```

the new root password will be UNIXAWY

5 - killall mysqld

6- service mysqld start

Second Solution

1- create file restmysqlpwd.txt

2 - insert this code inside

```sql
UPDATE mysql.user SET Password=PASSWORD('UNIXAWY') WHERE User='root';
FLUSH PRIVILEGES;
```

 

3 - service mysqld stop

4 - mysqld_safe --init-file restmysqlpwd.txt

5- killall mysqld

6 - service mysqld start
