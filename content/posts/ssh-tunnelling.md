---
title: "Mastering SSH Port Forwarding: Local, Remote, and Dynamic SOCKS Proxies"
date: 2015-08-12T23:18:08+00:00
url: "/ssh-tunnelling/"
draft: false
description: "A practical guide to SSH port forwarding: local port forwarding (-L), dynamic SOCKS proxies (-D), and reverse remote tunnels (-R) for bypassing NAT and firewalls."
categories: ["Linux", "Networking", "Security"]
tags: ["ssh", "port-forwarding", "tunneling", "socks-proxy", "pivoting", "red-team", "sysadmin"]
---

SSH is far more than an encrypted remote terminal—it is an extensible transport protocol capable of encapsulating arbitrary TCP traffic across segmented network boundaries, NAT gateways, and restrictive firewalls.

Here is how to leverage **Dynamic**, **Local**, and **Remote Reverse** SSH tunnels.

---

### 1. Dynamic Port Forwarding (`-D`): SOCKS Proxy

Dynamic port forwarding turns your SSH client into a local SOCKS5 proxy server. Any application configured to use this proxy routes its network requests through the remote SSH host.

```bash
ssh -D 1080 -q -C -N user@remote.corp
```

- `-D 1080`: Binds local SOCKS proxy on `127.0.0.1:1080`.
- `-q`: Quiet mode.
- `-C`: Enables stream compression.
- `-N`: Do not execute a remote command (tunneling only).

Configure your browser, `curl`, or `proxychains` to point to `socks5://127.0.0.1:1080` to browse internal networks visible only to the remote server.

---

### 2. Local Port Forwarding (`-L`): Accessing Internal Services

Local port forwarding maps a local port on your machine directly to a remote destination accessible from the SSH jump server:

```bash
# Syntax: ssh -L [local_port]:[target_destination]:[target_port] [jump_host]
ssh -L 8080:192.168.1.50:80 user@jump.corp
```

Connecting to `http://localhost:8080` on your browser transparently forwards packets through `jump.corp` to `192.168.1.50:80`.

---

### 3. Remote Reverse Port Forwarding (`-R`): Punching Inbound through NAT

What if a target machine sits behind a strict NAT firewall with no public IP, and you need to connect back to its SSH service?

Have the internal machine initiate a reverse tunnel to your external control server (`external.corp`):

```bash
# Executed on the internal/client machine:
ssh -f -N -R 9932:127.0.0.1:22 operator@external.corp
```

- `-R 9932:127.0.0.1:22`: Instructs `external.corp` to listen on port `9932` and forward all incoming connections back through the established SSH channel to the client's local port `22`.
- `-f`: Backgrounds the SSH process before command execution.

Now, on your control server (`external.corp`), you can connect directly into the internal machine:

```bash
ssh -p 9932 -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no root@127.0.0.1
```

You are now logged into the internal NAT-isolated system.
