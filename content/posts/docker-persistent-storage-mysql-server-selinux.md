---
title: "Docker Persistent Storage for MySQL with SELinux Enforcement"
date: 2016-07-16T21:12:28+00:00
url: "/docker-persistent-storage-mysql-server-selinux/"
draft: false
description: "How to configure persistent shared storage for MySQL containers on SELinux-enforced Linux systems (RHEL/CentOS/Fedora) using correct UID ownership and security contexts."
categories: ["blog", "Databases", "tech"]
---

Running stateful services like MySQL inside Docker containers requires mapping data volumes to host storage. On enterprise Linux distributions running **SELinux** in enforcing mode (such as Red Hat Enterprise Linux, CentOS, or Fedora), containerized processes are isolated using Type Enforcement and Multi-Category Security (MCS).

If the host directory lacks the appropriate SELinux context and file permissions, the MySQL daemon will encounter `Permission denied` errors during database initialization.

---

## 1. Pull the Official MySQL Image

Retrieve the official MySQL container image from Docker Hub:

```bash
docker pull mysql:latest
```

The MySQL container image supports several useful initialization environment variables:
- `MYSQL_ROOT_PASSWORD`: Sets the password for the root administrative user.
- `MYSQL_DATABASE`: Automatically creates a default application database upon container startup.
- `MYSQL_USER` and `MYSQL_PASSWORD`: Creates a dedicated non-root application user with privileges over the specified database.

---

## 2. Prepare the Host Storage Directory

Create a persistent directory on the host filesystem to store the MySQL database files:

```bash
sudo mkdir -p /var/mysql_data_store
```

### Configure File Ownership

Inside the container, MySQL runs as a dedicated system user. Depending on the base image:
- On Debian-based MySQL images, the default `mysql` UID/GID is typically `999:999`.
- On RHEL/CentOS systems, the traditional `mysql` UID/GID is `27:27`.

Set numeric ownership matching the container's MySQL daemon:

```bash
sudo chown -R 27:27 /var/mysql_data_store
sudo chmod 750 /var/mysql_data_store
```

---

## 3. Configure SELinux File Contexts

Containers run within restricted SELinux domains (such as `container_t` or `svirt_sandbox_file_t`). The host directory must allow container processes read and write access.

### Method A: Manual Context Assignment (`chcon`)

You can set the context on the storage directory manually:

```bash
sudo chcon -Rt svirt_sandbox_file_t /var/mysql_data_store
```

*(Note: On modern container runtimes with `container-selinux`, `container_file_t` is the standard type).*

```bash
# To ensure context persists across system relabeling:
sudo semanage fcontext -a -t container_file_t "/var/mysql_data_store(/.*)?"
sudo restorecon -Rv /var/mysql_data_store
```

### Method B: Docker `:z` or `:Z` Volume Flags (Recommended)

Docker provides built-in SELinux relabeling flags that automatically configure the context on mount:
- `:z`: Shares the volume across multiple containers (configures shared category labels).
- `:Z`: Assigns a private, unshared label exclusive to this container instance.

---

## 4. Launch the MySQL Container

Launch the container with volume mapping and environment variables:

```bash
docker run -d \
  --name mysql-ready \
  -v /var/mysql_data_store:/var/lib/mysql:z \
  -e MYSQL_ROOT_PASSWORD="MySecureRootPassword123!" \
  -e MYSQL_DATABASE="unixawy" \
  -p 3306:3306 \
  mysql:latest
```

---

## 5. Verify Connectivity and Persistence

Inspect the container's assigned IP address or connect directly via localhost:

```bash
# Retrieve internal container IP
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mysql-ready

# Test connection via CLI client
mysql -h 127.0.0.1 -u root -p"MySecureRootPassword123!" -e "SHOW DATABASES;"
```

Inspect the host storage directory to confirm that InnoDB tablespaces, logs, and system schemas are being written directly to the host filesystem:

```bash
sudo ls -lah /var/mysql_data_store
```

Even if the container is destroyed via `docker rm -f mysql-ready`, launching a new container mounted to `/var/mysql_data_store` will retain all tables and data intact.
