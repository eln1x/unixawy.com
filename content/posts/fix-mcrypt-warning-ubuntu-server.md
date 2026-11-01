---
title: "Fix Mcrypt WARNING Ubuntu Server"
date: 2016-06-26T12:39:03+00:00
url: "/fix-mcrypt-warning-ubuntu-server/"
draft: false
description: "today I faced problem in setup a mcrypt module I did install it via when i did try to enable it via I got this error root@ubuntu:/etc/php5/apache2/conf.d..."
categories: ["blog", "Linux"]
---

today I faced problem in setup a mcrypt module

I did install it via

```bash
apt-get install mcrypt php5-mcrypt
```

when i did try to enable it via

```bash
php5enmod mcrypt
```

I got this error

root@ubuntu:/etc/php5/apache2/conf.d# php5enmod mcrypt
WARNING: Not enabling the mcrypt module for apache2 SAPI since module symlink
WARNING: already exists in /etc/php5/apache2/conf.d with different content.
WARNING: Not enabling the mcrypt module for cli SAPI since module symlink
WARNING: already exists in /etc/php5/cli/conf.d with different content.

to solve this unlink the 20-mcrypt.ini inside this folders

```bash
unlink /etc/php5/apache2/conf.d/20-mcrypt.ini
unlink /etc/php5/cli/conf.d/20-mcrypt.ini

service apache2 restart
```
