---
title: "Monitoring Linux Infrastructure with Performance Co-Pilot (PCP) and Web UI"
date: 2016-07-23T14:38:33+00:00
url: "/linux-performance-co-pilot-webui/"
draft: false
description: "A comprehensive guide to deploying Performance Co-Pilot (PCP), collecting kernel and subsystem metrics with pmcd and pmlogger, and visualizing system telemetry via Vector WebUI."
categories: ["blog", "Linux", "tech"]
image: "/uploads/2016/07/Screen-Shot-2016-07-23-at-1.23.04-PM.png"
---

**Performance Co-Pilot (PCP)** is an enterprise-grade system performance analysis and telemetry framework. Developed to monitor large distributed environments, PCP gathers live and historical metrics covering kernel internals, hardware subsystems, file systems, disk I/O, memory pressure, and networking.

---

## 1. Installation and Daemon Setup

On Red Hat Enterprise Linux, CentOS, or Fedora, install the core PCP packages:

```bash
sudo yum install -y pcp pcp-webjs
```

### Performance Metrics Collector Daemon (`pmcd`)

`pmcd` acts as the primary coordinator, querying Performance Metric Domain Agents (PMDAs) for subsystem statistics:

```bash
sudo systemctl enable --now pmcd
sudo systemctl status pmcd
```

Verify that default domain agents (proc, xfs, linux kernel) are running:

```text
CGroup: /system.slice/pmcd.service
        ├─4862 /usr/libexec/pcp/bin/pmcd
        ├─4865 /var/lib/pcp/pmdas/root/pmdaroot
        ├─4866 /var/lib/pcp/pmdas/proc/pmdaproc -d 3
        ├─4867 /var/lib/pcp/pmdas/xfs/pmdaxfs -d 11
        └─4868 /var/lib/pcp/pmdas/linux/pmdalinux
```

---

## 2. Real-Time CLI Analysis Tools

PCP includes powerful command-line monitoring utilities:

### `pmatop`: Comprehensive Resource Overview

`pmatop` provides an interactive real-time dashboard of CPU, memory, LVM, disk I/O, swap, network interfaces, and active processes:

```bash
pmatop
```

![pmatop interactive monitor](/uploads/2016/07/Screen-Shot-2016-07-23-at-1.23.04-PM.png)
*Figure 1: pmatop interactive performance dashboard.*

### `pmstat`: Compact System Metrics

`pmstat` outputs periodic summaries of load average, memory paging, swap utilization, context switches, and CPU execution modes:

```bash
# Sample every 1 second, for 10 iterations
pmstat -t 1sec -s 10
```

```text
loadavg                      memory      swap        io    system         cpu
  1 min   swpd   free   buff  cache   pi   po   bi   bo   in   cs  us  sy  id
   0.08   2720 119224      0 257332    0    0    1    0  139  129   1   1  98
   0.07   2716 118768      0 257404    0    0   32    6  590  912   6   8  81
```

### `pminfo` and `pmval`: Metric Exploration

List available kernel metrics using `pminfo`:

```bash
pminfo | grep kernel.all.cpu
```

Extract live values for specific counters using `pmval`:

```bash
# Monitor inbound network bytes across interfaces
pmval -s 5 network.interface.in.bytes
```

---

## 3. Historical Telemetry with `pmlogger`

To record historical time-series archives for retrospectives and capacity planning, start `pmlogger`:

```bash
sudo systemctl enable --now pmlogger
```

Archives are stored in `/var/log/pcp/pmlogger/<hostname>/`. You can query historical logs retrospectively with `pmval` using `-a` and specific time boundaries (`-S` and `-T`):

```bash
# Replay kernel load averages during a historical window
pmval -a /var/log/pcp/pmlogger/localhost/20160723.07.17 \
  -S '@ Sat Jul 23 07:20:00 2016' \
  -T '@ Sat Jul 23 07:35:00 2016' \
  kernel.all.load
```

---

## 4. Visualizing Metrics via Vector Web UI

PCP provides a high-performance web API daemon (`pmwebd`) capable of serving visual dashboards:

```bash
sudo systemctl enable --now pmwebd
```

Confirm that `pmwebd` is listening on port `44323`:

```bash
ss -tulpn | grep 44323
```

Navigate to `http://<server-ip>:44323/vector/` in your browser. The Vector interface delivers real-time SVG graphs of disk throughput, IOPS latency, memory allocation, and socket connections:

![Vector web interface dashboard](/uploads/2016/07/vector.png)
*Figure 2: Real-time telemetry visualized through PCP Vector Web UI.*
