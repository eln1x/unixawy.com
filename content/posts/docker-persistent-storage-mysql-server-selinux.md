---
title: "Docker Persistent Storage for MySQL Server and SELinux"
date: 2016-07-16T21:12:28+00:00
url: "/docker-persistent-storage-mysql-server-selinux/"
draft: false
description: "hello everyone today we will make MySQL Docker Container with Shared Storage first let's pull latest MySQL version of docker after we did download the latest..."
categories: ["blog", "Databases", "tech"]
---

hello everyone today we will make

# MySQL Docker Container with Shared Storage

first let's pull latest MySQL  version of docker

```bash
docker pull mysql
```

after we did download the latest image

this image come in handy with some awesome parameters

1. MYSQL_ROOT_PASSWORD
2. MYSQL_DATABASE

with this  parameters, we can create a database and set root password for mysql

now let's create a folder in our host so we can use it instead of /var/lib/mysql (let's keep the mysql data in the host not inside a container)

```bash
mkdir /var/mysql_data_store
```

```bash
chmod -R 27:27 /var/mysql_data_store
```

remember it should be numeric formate

then we change the folder context to for selinux to  treat this as a virtualized sandbox

```bash
chcon -t svirt_sandbox_file_t /var/mysql_data_store
```

```bash
docker run --name mysql-ready -v /var/mysql_data_store:/var/lib/mysql -e MYSQL_ROO_PASSWORD=un1x4wyp4ssw0rd  -e MYSQL_DATABASE=unixawy -d mysql
```

here we created a database called unixawy and root password un1x4wyp4ssw0rd

inspect your docker and connect to it IP

```bash
mysql -uroot -pun1x4wyp4ssw0rd -h$(docker inspect -f '{{ .NetworkSettings.IPAddress }}' mysql-ready)
```

now each container you run with this command will share the same database data

check database content in your node storage via ls /var/mysql_data_store

cheers
