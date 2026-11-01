---
title: "phpMyAdmin no password dev env"
date: 2016-06-26T13:26:36+00:00
url: "/phpmyadmin-no-password-dev-env/"
draft: false
description: "if you setup your development environment with no mysql root password after you setup phpmyadmin package it will land you with this error Login without a..."
categories: ["blog", "Linux"]
---

if you setup your development environment with no mysql root password

after you setup phpmyadmin package it will land you with this error

**Login without a password is forbidden by configuration (see AllowNoPassword)**

to fix this error  vi  /etc/phpmyadmin/config.inc.php

find line : 96 "    /* $cfg['Servers'][$i]['AllowNoPassword'] = TRUE;"

remove the comment /*

$cfg['Servers'][$i]['AllowNoPassword'] = TRUE;

now you will be able to login without password
