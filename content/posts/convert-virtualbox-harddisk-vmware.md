---
title: "Converting VirtualBox Disk Images (VHD / VDI) to VMware (VMDK)"
date: 2015-01-12T18:44:44+00:00
url: "/convert-virtualbox-harddisk-vmware/"
draft: false
description: "How to convert virtual disk images between VirtualBox (VDI, VHD) and VMware (VMDK) using qemu-img and VBoxManage."
categories: ["blog", "Linux", "Virtualization"]
---

When migrating virtual machines from Oracle VirtualBox to VMware Workstation, Fusion, or ESXi, virtual disk formats must be converted to VMware's native format (`VMDK`).

There are two primary methods to accomplish this: using the universal **`qemu-img`** utility or VirtualBox's native **`VBoxManage`** CLI tool.

---

## Method 1: Using `qemu-img` (Recommended)

`qemu-img` is a versatile disk management tool capable of converting between raw, qcow2, VMDK, VDI, and VHD/VPC images.

### Installation

On Ubuntu/Debian:
```bash
sudo apt-get install -y qemu-utils
```

On Fedora/RHEL/CentOS:
```bash
sudo dnf install -y qemu-img
```

### Converting VHD to VMDK

To convert a Virtual Hard Disk (`.vhd` / Microsoft VPC format) to VMware format:

```bash
qemu-img convert -f vpc -O vmdk systemdisk.vhd systemdisk.vmdk
```

- `-f vpc`: Specifies the input format (`vpc` represents `.vhd`).
- `-O vmdk`: Specifies the output format (`vmdk`).

### Converting VDI to VMDK

If your VirtualBox VM uses native `.vdi` disks:

```bash
qemu-img convert -f vdi -O vmdk -o subformat=monolithicSparse virtualbox_disk.vdi vmware_disk.vmdk
```

---

## Method 2: Using `VBoxManage`

If VirtualBox is already installed on your host, you can convert `.vdi` files directly without installing additional utilities:

```bash
VBoxManage clonehd "source_disk.vdi" "target_disk.vmdk" --format VMDK --variant Standard
```

Once the conversion finishes, attach the newly created `.vmdk` file to your VMware virtual machine configuration.
