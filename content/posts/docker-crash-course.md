---
title: "Docker Architecture and Container Operations Crash Course"
date: 2016-05-30T03:00:06+00:00
url: "/docker-crash-course/"
draft: false
description: "A comprehensive guide to Docker core concepts, daemon architecture, interactive vs. detached modes, port mapping, and image customization."
categories: ["DevOps", "Linux", "Containers"]
tags: ["docker", "containers", "linux", "devops", "sysadmin"]
---

Unlike traditional Type-1 and Type-2 hypervisors that virtualize complete hardware stacks and boot independent operating system kernels, **containers** share the host Linux kernel while isolating processes using kernel **Namespaces** (PID, NET, IPC, MNT, UTS) and **Control Groups (cgroups)**.

Docker packages application dependencies, libraries, and runtime binaries into lightweight, immutable container images.

---

### Core Architecture

Docker operates under a client-server model:
- **Docker Client (`docker`)**: The CLI tool you execute to issue commands.
- **Docker Daemon (`dockerd`)**: The background daemon listening for API requests to manage images, containers, networks, and storage volumes.
- **Docker Registry**: Public (Docker Hub) or private image repositories.

A container lifecycle is tied directly to its primary foreground process (`PID 1`). When that process exits, the container stops.

---

### Basic Container Operations

#### 1. Running Ephemeral Commands
When you run a container, Docker pulls the image layers if not cached locally, creates an isolated overlay filesystem, and executes the target process:

```bash
docker run --rm ubuntu uname -a
# Linux 4a27417f50b9 5.15.0-generic ... x86_64 GNU/Linux
```
`--rm` automatically removes the container's writable filesystem layer upon exit.

#### 2. Interactive Terminal (`-i -t`)
To enter an interactive shell inside a container:

```bash
docker run -it ubuntu /bin/bash
```
- `-i` (`--interactive`): Keeps standard input (`STDIN`) open.
- `-t` (`--tty`): Allocates a pseudo-TTY terminal.

#### 3. Detached Background Services (`-d`) & Port Mapping (`-p`)
For daemonized services (e.g., Nginx web server):

```bash
docker run -d --name webserver -p 8080:80 nginx:alpine
```
- `-d` (`--detach`): Runs the container in the background.
- `-p 8080:80`: Binds host port `8080` to container port `80`.

Verify running containers:
```bash
docker ps
# CONTAINER ID   IMAGE          COMMAND                  PORTS                  NAMES
# 1c0c6bc0c34f   nginx:alpine   "/docker-entrypoint.…"   0.0.0.0:8080->80/tcp   webserver
```

---

### Building and Committing Images

While production workloads should always be declared via `Dockerfile`, you can snapshot the filesystem state of a running or modified container into a reusable image using `docker commit`:

1. **Install tools inside an active container:**
   ```bash
   docker run -it --name dev-box ubuntu /bin/bash
   apt-get update && apt-get install -y python3 git
   exit
   ```

2. **Commit container modifications to a new tagged image:**
   ```bash
   docker commit -m "Added Python3 and Git" dev-box custom-python:1.0
   ```

3. **Verify the new local image:**
   ```bash
   docker images
   # REPOSITORY      TAG       IMAGE ID       SIZE
   # custom-python   1.0       3c7881fe969f   145MB
   ```

4. **Launch containers directly from your custom image:**
   ```bash
   docker run -it custom-python:1.0 python3 --version
   ```

---

### Maintenance & Cleanup Commands

To remove stopped containers, unused networks, and dangling image layers:

```bash
# Remove all stopped containers
docker container prune -f

# Forcefully remove all stopped and running containers
docker rm -f $(docker ps -aq)

# System-wide purge of unused Docker data (containers, networks, images)
docker system prune -a --volumes
```
