---
title: "phpMyAdmin error #1146"
date: 2016-06-26T13:45:41+00:00
url: "/phpmyadmin-error-1146-table-phpmyadmin-pma_tracking-doesnt-exist/"
draft: false
description: "1146 Table 'phpmyadmin.pma tracking' doesn't exist this error indicates that phpmyadmin pages failed in setup and you just ignored it in the setup process you..."
categories: ["blog", "Databases", "Linux"]
image: "/uploads/2016/06/Screen-Shot-2016-06-26-at-1.21.13-PM.png"
---

**#1146 - Table 'phpmyadmin.pma_tracking' doesn't exist**

![Screen Shot 2016-06-26 at 1.21.13 PM](/uploads/2016/06/Screen-Shot-2016-06-26-at-1.21.13-PM.png)

 

this error indicates that phpmyadmin pages failed in setup  and you just ignored it in the setup process

you need to reconfigure the package again

 

```bash
root@ubuntu:~# dpkg-reconfigure phpmyadmin
```

 

![Screen Shot 2016-06-26 at 1.29.55 PM](/uploads/2016/06/Screen-Shot-2016-06-26-at-1.29.55-PM.png)

after you follow the reinstall steps it will setup the missing sql files for pma tables
