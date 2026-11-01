---
title: "Investigating SELinux AVC Denials with ausearch and Centralized Rsyslog"
date: 2016-07-23T21:26:19+00:00
url: "/selinux/"
draft: false
description: "How to query and interpret SELinux Access Vector Cache (AVC) denial events using ausearch, and forward audit logs to centralized rsyslog collectors."
categories: ["blog", "Linux", "Security"]
---

When SELinux operates in enforcing mode, policy violations are intercepted and logged as Access Vector Cache (AVC) denial records in the Linux audit subsystem (`/var/log/audit/audit.log`).

Diagnosing blocked operations efficiently requires mastering `ausearch` and establishing structured log routing.

---

## 1. Querying AVC Denials with `ausearch`

The `ausearch` utility parses the binary-formatted audit logs to isolate specific event types and translate raw numeric IDs into human-readable strings.

### Find All AVC Denials Generated Today

```bash
ausearch -m avc -i -ts today
```

- `-m avc`: Filters events specifically matching the `AVC` (Access Vector Cache) audit record type.
- `-i`: Interprets numeric identifiers into human-readable text (resolves UIDs to usernames, GIDs to group names, and syscall numbers to system call names).
- `-ts today`: Limits the search timeframe to the current calendar day.

### Additional Useful Filters

```bash
# Query denials by executable name
ausearch -m avc -c httpd -ts recent

# Query denials by process ID (PID)
ausearch -m avc -p 1234

# Check for AVC denials alongside system audit messages
ausearch -m avc,user_avc,selinux_err -i
```

---

## 2. Converting AVC Denials into Remediation Rules

To examine why an operation was blocked and generate human-readable policy recommendations:

```bash
# Analyze denial reasons with audit2why
ausearch -m avc -ts today | audit2why

# Generate a custom Type Enforcement policy module
ausearch -m avc -ts today -c nginx | audit2allow -M my_custom_nginx_policy
```

---

## 3. Centralizing Audit and Syslog Records with Rsyslog

In distributed enterprise networks, audit logs should be streamed to a hardened central syslog server for real-time monitoring and SIEM ingestion.

### Central Log Server Configuration (`/etc/rsyslog.conf`)

Configure the central rsyslog server to accept incoming TCP traffic on port 514 and dynamically organize incoming logs by hostname:

```text
# Enable TCP Syslog Reception
$ModLoad imtcp
$InputTCPServerRun 514

# Define Dynamic Per-Host Log File Templates
$template DynamicFile,"/var/log/loghost/%HOSTNAME%/%syslogfacility-text%.log"

# Route all incoming facilities to the dynamic template
*.* -?DynamicFile
```

Restart rsyslog to activate the listener:

```bash
sudo systemctl restart rsyslog
```

### Forwarding Auditd Events via `audisp-syslog`

On client nodes, enable the auditd syslog plugin (`audisp-syslog` or `audisp-plugins`) in `/etc/audit/plugins.d/syslog.conf`:

```text
active = yes
direction = out
path = /sbin/audisp-syslog
type = builtin
args = LOG_INFO
format = string
```

Restart `auditd` to stream AVC denial records directly to your centralized logging infrastructure.
