---
title: "Deploying High-Availability Multi-Master MySQL NDB Clusters with MySQL Cluster Manager"
date: 2017-09-05T04:20:05+00:00
url: "/run-mysql-cluster-multi-masters-high-availability/"
draft: false
description: "A comprehensive production guide to architecting, deploying, scaling, and managing a distributed, multi-master MySQL NDB Cluster using Oracle MySQL Cluster Manager (MCM)."
categories: ["Databases", "Linux", "DevOps"]
tags: ["mysql", "ndb-cluster", "high-availability", "database-clustering", "distributed-systems", "sysadmin"]
image: "/uploads/2017/09/Screen-Shot-2017-09-04-at-6.06.34-PM.png"
---

Traditional MySQL replication architectures (active-passive or source-replica topologies) introduce replication lag and require failover orchestrators (e.g., Orchestrator or ProxySQL) to handle master crashes.

**MySQL NDB Cluster** is a shared-nothing, distributed database that provides real-time in-memory performance, 99.999% high availability, and **active-active multi-master** read/write capabilities across all SQL nodes.

This guide details configuring and scaling a multi-master NDB cluster using **Oracle MySQL Cluster Manager (MCM)**.

---

### Core Architecture & Node Roles

An NDB cluster consists of three distinct node types:

1. **Management Nodes (`ndb_mgmd`)**: Distribute cluster configuration, manage node handshakes, handle arbitrations, and collect cluster logs.
2. **Data Nodes (`ndbd` / `ndbmtd`)**: Store table data, indexes, and partitions in memory (or disk-data tablespaces). `ndbmtd` is the high-performance multi-threaded data engine.
3. **SQL / API Nodes (`mysqld`)**: Stateless MySQL server daemons that parse SQL queries from application load balancers and interact with data nodes via the NDB storage engine.

```text
               [ Application Layer / Load Balancer ]
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
 [SQL Node 1: 172.31.16.34]                   [SQL Node 2: 172.31.16.43]
 (mysqld + ndb_mgmd)                         (mysqld + ndb_mgmd)
        │                                               │
        └───────────────────────┬───────────────────────┘
                                ▼
         NDB Storage Engine Network (High-Speed Backplane)
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
 [Data Node 1: 172.31.23.137]                [Data Node 2: 172.31.24.183]
 (ndbmtd - Node Group 0)                     (ndbmtd - Node Group 0)
```

---

### Step 1: Initializing the MCM Agents

Install the MySQL Cluster Manager daemon (`mcmd`) across all participant nodes and start the agent:

```bash
# Executed on all cluster hosts
./bin/mcmd --bootstrap
```

Once running, launch the MCM interactive client (`mcm`):

```bash
./bin/mcm -a localhost:1862
```

---

### Step 2: Creating the Site and Registering Packages

Group your server hosts into a managed site:

```sql
mcm> create site -h 172.31.23.137,172.31.24.183,172.31.16.34,172.31.16.43 mysite;
```

Register the NDB cluster software package binary path:

```sql
mcm> add package -b /home/ops/mcm/cluster 7_6_8;
```

---

### Step 3: Defining Node Topology and Starting the Cluster

Define node assignments mapping physical IPs to processes:

```sql
mcm> create cluster -P 7_6_8 \
     -R ndbd@172.31.23.137,ndbd@172.31.24.183,\
        ndb_mgmd@172.31.16.43,ndb_mgmd@172.31.16.34,\
        mysqld@172.31.16.34,mysqld@172.31.16.43 \
     mycluster;
```

Launch the cluster across all nodes:

```sql
mcm> start cluster mycluster;
mcm> show status -r mycluster;
```

#### Status Verification:
```text
+--------+----------+---------------+---------+-----------+
| NodeId | Process  | Host          | Status  | Nodegroup |
+--------+----------+---------------+---------+-----------+
| 49     | ndb_mgmd | 172.31.16.43  | running |           |
| 50     | ndb_mgmd | 172.31.16.34  | running |           |
| 1      | ndbd     | 172.31.23.137 | running | 0         |
| 2      | ndbd     | 172.31.24.183 | running | 0         |
| 51     | mysqld   | 172.31.16.34  | running |           |
| 52     | mysqld   | 172.31.16.43  | running |           |
+--------+----------+---------------+---------+-----------+
```

---

### Step 4: Synchronizing User Privileges Across All SQL Nodes

Because the `mysql.user` authentication tables traditionally run under standard storage engines rather than NDB, user privileges created on SQL Node 1 do not automatically mirror to SQL Node 2 by default.

Enable distributed privileges across the cluster by loading the NDB privilege distribution script on one SQL node:

```bash
mysql -u root -p -h 127.0.0.1 < cluster/share/ndb_dist_priv.sql
```

User grants (`CREATE USER`, `GRANT`) are now automatically distributed and kept consistent across all SQL nodes in real-time.

---

### Step 5: Online Upgrades to Multi-Threaded Engine (`ndbmtd`)

To maximize CPU core utilization on multi-core data servers, convert the single-threaded `ndbd` engine to multi-threaded `ndbmtd` on the fly:

```sql
mcm> change process ndbd=ndbmtd mycluster;
```

MCM performs a rolling rolling restart across the cluster without interrupting client read/write transactions.
