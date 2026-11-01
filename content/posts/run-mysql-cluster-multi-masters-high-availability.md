---
title: "Run MySQL Cluster Multi Masters For High Availability"
date: 2017-09-05T04:20:05+00:00
url: "/run-mysql-cluster-multi-masters-high-availability/"
draft: false
description: "Hello Folks, it's has been a while I didn't write new articles, it's has been a while I didn't write new articles, so time to give back to the community, I..."
categories: ["blog", "Databases", "Linux", "tech"]
image: "/uploads/2017/09/Screen-Shot-2017-09-04-at-6.06.34-PM.png"
---

Hello Folks, it's has been a while I didn't write new articles,

it's has been a while I didn't write new articles, so time to give back to the community, I will describe how to implement MySQL cluster for high-availability and disturbed workload

MySQL Cluster Architect comes with new process ndbd and ndb_mgmd

ndb is used to handle all data and table using the NDB Cluster Engine

ndbmtd multi-threaded data  handler in NDB Cluster Engine

ndb_mgmd is the Cluster Management Server Daemon responsible for distributing the configuration and log around the cluster

in this setup, we will use 4 servers to distribute MySQL service cluster process

Group Beta

- 172.31.24.183  ndbd
- 172.31.23.137 ndbd

Group Alpha

- 172.31.16.43 mysqld & ndb_mgmd
- 172.31.16.34 mysql & ndb_mgmd

our applications will communicate to load balance that distributes the workload  to Alpha Group

to begin setup we have to download MySQL cluster manager package from Oracle website https://edelivery.oracle.com/osdc/faces/Home.jspx feel free to create your account

![](/uploads/2017/09/Screen-Shot-2017-09-04-at-6.06.34-PM.png)

pickup your platform and download the package for I use the Cluster+Generic Linux x86 (64bit) version

download and extract the package  in all nodes

inside the mcm1.4.3 folder  is a bin folder  has 2 files mcm and mcmd the client and the demon for the cluster manager

we need to run mcmd in all nodes so they can communicate to each other

lets setup out cluster first we need to create a site ( all nodes we need to group it in a site )

now lets run the client add the site  MySQL Cluster Manager Interface

![mcm client](/uploads/2017/09/Screen-Shot-2017-09-04-at-6.27.59-PM.png)

```bash
mcm> create site -h 172.31.23.137,172.31.24.183,172.31.16.34,172.31.16.43, 172.31.44.168 mysite;
```

 

![](/uploads/2017/09/Screen-Shot-2017-09-04-at-6.30.22-PM.png)

second, we need to load the cluster package in the site we created

```bash
mcm> add package -b /home/ops/mcm/cluster 7_6_8;
+----------------------------+
| Command result             |
+----------------------------+
| Package added successfully |
+----------------------------+
1 row in set (0.23 sec)
```

 

now let's define the roles for the node who plays what

```bash
mcm> create cluster -P 7_6_8 -R ndbd@172.31.23.137,ndbd@172.31.24.183,ndb_mgmd@172.31.16.43,ndb_mgmd@172.31.16.34,mysqld@172.31.16.34,mysqld@172.31.16.43 mycluster;
```

172.31.23.137  & 172.31.24.183 plays data role

172.31.16.43 & 172.31.16.34  mysqld & cluster management

![](/uploads/2017/09/Screen-Shot-2017-09-04-at-6.36.10-PM.png)

now run the cluster and check the services status

```bash
mcm> start cluster mycluster

+------------------------------+
| Command result               |
+------------------------------+
| Cluster started successfully |
+------------------------------+
1 row in set (17.02 sec)

mcm> show status -r mycluster
```

![](/uploads/2017/09/Screen-Shot-2017-09-04-at-6.38.47-PM.png)

confirm the roles for each host upon your design

now we want to communicate with out lovely cluster

```bash
mcm> get -d  port:mysqld mycluster;
+------+-------+----------+---------+----------+---------+---------+---------+
| Name | Value | Process1 | NodeId1 | Process2 | NodeId2 | Level   | Comment |
+------+-------+----------+---------+----------+---------+---------+---------+
| port | 3306  | mysqld   | 51      |          |         | Default |         |
| port | 3306  | mysqld   | 52      |          |         | Default |         |
+------+-------+----------+---------+----------+---------+---------+---------+
2 rows in set (0.07 sec)
```

as we built 2 servers with mysqld they are up and running under node id 51,52

by default, mysql cluster will not sync the mysql.user table as it running in MyISM and for that, we need to enable a MySQL routine that sync the users over the cluster

to do that first login to mysqld nodes as a root and import distribute MySQL privileges routine .sql

```bash
mysql -h 127.0.0.1 < cluster/share/ndb_dist_priv.sql
```

now create your remote account and it will be synced over the cluster

Now feel free to scale up alpha or beta to any number you want also you can create nodes mixed of alpha and beta.

and keep your eyes on the nodes

```bash
mcm>  list hosts mysite;
+---------------+-----------+---------+
| Host          | Status    | Version |
+---------------+-----------+---------+
| 172.31.23.137 | Available | 1.4.3   |
| 172.31.24.183 | Available | 1.4.3   |
| 172.31.16.34  | Available | 1.4.3   |
| 172.31.16.43  | Available | 1.4.3   |
| 172.31.44.168 | Available | 1.4.3   |
+---------------+-----------+---------+
5 rows in set (0.02 sec)
```

to add a new node to our cluster we load the mcm package in the node and the demon

mcm> add package -b /home/ec2-user/mcm/cluster -h 172.31.20.215 7_6_8;

```bash
mcm> add package -b /home/ops/mcm/cluster -h 172.31.20.215 7_6_8;
+----------------------------+
| Command result             |
+----------------------------+
| Package added successfully |
+----------------------------+
1 row in set (0.23 sec)
```

 

```bash
mcm> show status -r mycluster
    -> ;
+--------+----------+---------------+---------+-----------+---------+
| NodeId | Process  | Host          | Status  | Nodegroup | Package |
+--------+----------+---------------+---------+-----------+---------+
| 49     | ndb_mgmd | 172.31.16.43  | running |           | 7_6_8   |
| 50     | ndb_mgmd | 172.31.16.34  | running |           | 7_6_8   |
| 1      | ndbd     | 172.31.23.137 | running | 0         | 7_6_8   |
| 2      | ndbd     | 172.31.24.183 | running | 0         | 7_6_8   |
| 51     | mysqld   | 172.31.16.34  | running |           | 7_6_8   |
| 52     | mysqld   | 172.31.16.43  | running |           | 7_6_8   |
+--------+----------+---------------+---------+-----------+---------+
6 rows in set (0.03 sec)

mcm>  list hosts mysite;
+---------------+-----------+---------+
| Host          | Status    | Version |
+---------------+-----------+---------+
| 172.31.23.137 | Available | 1.4.3   |
| 172.31.24.183 | Available | 1.4.3   |
| 172.31.16.34  | Available | 1.4.3   |
| 172.31.16.43  | Available | 1.4.3   |
| 172.31.44.168 | Available | 1.4.3   |
| 172.31.20.215 | Available | 1.4.3   |
+---------------+-----------+---------+
6 rows in set (0.02 sec)
```

as it clear our new node 172.31.20.215 is in the sites but didn't join the cluster yet because he has no rule to add it  and after that, we need to start the role inside the cluster so nodes can collaborate and sync

```bash
mcm> add process -R  mysqld@172.31.20.215 mycluster;
+----------------------------+
| Command result             |
+----------------------------+
| Process added successfully |
+----------------------------+
1 row in set (2 min 7.23 sec)
```

```bash
mcm> add process -R  ndb_mgmd:53@172.31.20.215 mycluster;
+----------------------------+
| Command result             |
+----------------------------+
| Process added successfully |
+----------------------------+
1 row in set (1 min 55.55 sec)
```

now adding extra node and load more database data store on 172.31.20.215

```bash
mcm> add process -R  ndbd@172.31.20.215 ,ndbd@172.31.28.186 mycluster;
+----------------------------+
| Command result             |
+----------------------------+
| Process added successfully |
+----------------------------+
1 row in set (2 min 1.18 sec)
```

checking our cluster status

```bash
mcm> show status -r mycluster;
+--------+----------+----------------+----------+-----------+---------+
| NodeId | Process  | Host           | Status   | Nodegroup | Package |
+--------+----------+----------------+----------+-----------+---------+
| 49     | ndb_mgmd | 172.31.16.43   | running  |           | 7_6_8   |
| 50     | ndb_mgmd | 172.31.16.34   | running  |           | 7_6_8   |
| 53     | ndb_mgmd | 172.31.20.215  | added    |           | 7_6_8   |
| 1      | ndbd     | 172.31.23.137  | stopping | 0         | 7_6_8   |
| 2      | ndbd     | 172.31.24.183  | running  | 0         | 7_6_8   |
| 3      | ndbd     | 172.31.20.215  | added    | n/a       | 7_6_8   |
| 4      | ndbd     | 172.31.28.186  | added    | n/a       | 7_6_8   |
| 51     | mysqld   | 172.31.16.34   | running  |           | 7_6_8   |
| 52     | mysqld   | 172.31.16.43   | running  |           | 7_6_8   |
| 54     | mysqld   | 172.31.20.215  | added    |           | 7_6_8   |
+--------+----------+----------------+----------+-----------+---------+
11 rows in set (0.01 sec)
```

to run added processes  on target cluster we use start process -a mycluster

```bash
mcm> start process -a mycluster;
+------------------------------+
| Command result               |
+------------------------------+
| Process started successfully |
+------------------------------+
1 row in set (9.51 sec)
```

now everything should be steady for our cluster

```bash
mcm> show status -r mycluster;
+--------+----------+----------------+---------+-----------+---------+
| NodeId | Process  | Host           | Status  | Nodegroup | Package |
+--------+----------+----------------+---------+-----------+---------+
| 49     | ndb_mgmd | 172.31.16.43   | running |           | 7_6_8   |
| 50     | ndb_mgmd | 172.31.16.34   | running |           | 7_6_8   |
| 53     | ndb_mgmd | 172.31.20.215  | running |           | 7_6_8   |
| 1      | ndbd     | 172.31.23.137  | running | 0         | 7_6_8   |
| 2      | ndbd     | 172.31.24.183  | running | 0         | 7_6_8   |
| 3      | ndbd     | 172.31.20.215  | running | 1         | 7_6_8   |
| 4      | ndbd     | 172.31.28.186  | running | 1         | 7_6_8   |
| 51     | mysqld   | 172.31.16.34   | running |           | 7_6_8   |
| 52     | mysqld   | 172.31.16.43   | running |           | 7_6_8   |
| 54     | mysqld   | 172.31.20.215  | running |           | 7_6_8   |
+--------+----------+----------------+---------+-----------+---------+
11 rows in set (0.04 sec)
```

now let's change all ndbd to multi-threaded version

```bash
mcm> change process ndbd=ndbmtd mycluster;

+------------------------------+
| Command result               |
+------------------------------+
| Process changed successfully |
+------------------------------+
1 row in set (2 min 9.81 sec)
```

![](/uploads/2017/09/Screen-Shot-2017-09-05-at-3.31.33-AM.png)

all our data engine now running multi-threaded version

 

Happy Hits :D
