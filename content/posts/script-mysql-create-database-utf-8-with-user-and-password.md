---
title: "Script : MySQL Create Database UTF-8 with user and password"
date: 2014-11-24T08:46:44+00:00
url: "/script-mysql-create-database-utf-8-with-user-and-password/"
draft: false
description: "we do create many databases every day and i love UTF 8 data formate so i decided to make something simple and save my time here is the syntax to create a..."
categories: ["blog", "Databases", "Python"]
image: "/uploads/2014/11/mysql_utf8.png"
---

we do  create many  databases every day and i love UTF-8 data formate so i decided to make  something simple and save my time

here is the syntax to create a database called unixawy in utf8

```
CREATE DATABASE `unixawy` CHARACTER SET utf8 COLLATE utf8_general_ci;
```

to add a user for unixawy with password unixawysecret

```
GRANT ALL ON `test1`.* TO 'unixawy'@'localhost' IDENTIFIED BY 'unixawysecret';
FLUSH PRIVILEGES;
```

also, i made a simple script to save my time
![mysql_utf8](/uploads/2014/11/mysql_utf8.png)

 

```python
#!/usr/bin/env python
#MYSQL CREATE UTF8 DATABASE WITH ACCESS USERNAME & PASSWORD
#Ahmed Mahfouz AKA _N1X_
import sys,os

mysql_root="root"
mysql_pwd="mysqlrootpassword_here"
hostname="localhost"
try:
	db = sys.argv[1]
	username = sys.argv[2]
	password = sys.argv[3]

	create_db = "CREATE DATABASE " + "`"+ db + "`" + " CHARACTER SET utf8 COLLATE utf8_general_ci;"
	adddb_user =  "GRANT ALL ON `" + db  + "`.* TO '" + username+ "'@'localhost' IDENTIFIED BY " +"'"+ password + "';"
	reload = "FLUSH PRIVILEGES;"
	show_query = raw_input("Do u want to show mysql query Y/N (default N)")
	if show_query.lower() == 'y':
		print create_db
		print adddb_user
		print reload
	update_db = raw_input("if you want to apply  prees Y/N: ")
	if update_db.lower() == 'y':
		sql_create = "echo %s|mysql -u %s -p%s -h%s" %(create_db.strip(";").replace("`","\`"),mysql_root,mysql_pwd,hostname)
		sql_adduser = "echo %s|mysql -u %s -p%s -h%s" %(adddb_user.strip(";").replace("`","\`").replace("'","\\'"),mysql_root,mysql_pwd,hostname)
		sql_commit ="echo %s|mysql -u %s -p%s -h%s" %(reload.strip(";"),mysql_root,mysql_pwd,hostname)
		#print sql_create
		#print "x"*10
		#print adddb_user
		#print sql_adduser
		print "Creating Database"
		os.system(sql_create)
		print "Adding User to Database"
		os.system(sql_adduser)
		print "Finishing"
		os.system(sql_commit)

except IndexError:
	print "usage: python mysql_db_user_pass_gen.py database_name username password"
	exit()
```
