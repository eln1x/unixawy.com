---
title: "MySQL force delete rows"
date: 2014-12-13T20:27:08+00:00
url: "/mysql-force-delete-rows/"
draft: false
description: "MySQL check if there is a relation between rows before deleting it it will raise an error can't delete or update a parent row we need to till mysql to stop..."
categories: ["blog", "Databases"]
---

MySQL check if there is a relation between rows before deleting it

it will raise an error

can't delete or update a parent row

we need to till mysql to stop this check

```sql
SET FOREIGN_KEY_CHECKS = 0
```

to reactivate it

```
SET FOREIGN_KEY_CHECKS =1
```

 

enjoy
