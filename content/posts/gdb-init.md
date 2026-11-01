---
title: "Lightweight Exploit Development Interface Using .gdbinit Hooks"
date: 2019-02-04T22:35:25+00:00
url: "/gdb-init/"
draft: false
description: "How to configure native GDB stop hooks and Intel disassembly syntax in ~/.gdbinit to automatically display registers, opcodes, and stack memory on break without third-party plugins."
categories: ["Security", "exploit-dev"]
tags: ["gdb", "reverse-engineering", "exploit-dev", "assembly", "debugging"]
---

When debugging binaries during exploit development or wargames, third-party frameworks like GEF, Pwndbg, or Peda provide helpful dashboard views. However, in restricted testing environments, CTF shells, or isolated embedded targets, you may not have internet access or Python dependencies installed to run external tools.

You can configure vanilla GDB to provide an automated register and stack inspection view using native `define hook-stop` hooks in `~/.gdbinit`.

---

### Custom `~/.gdbinit` Configuration

Create or update `~/.gdbinit` in your home directory:

```text
# Switch syntax from AT&T to Intel standard
set disassembly-flavor intel

# Define an automatic hook executed every time GDB pauses execution
define hook-stop
  echo \n================== [ REGISTERS ] ==================\n
  info register eax ebx ecx edx esi edi ebp esp eip

  echo \n================== [ NEXT OPCODES ] ===============\n
  x/8i $pc

  echo \n================== [ STACK (ESP) ] ================\n
  x/16wx $esp

  echo \n================== [ FRAME (EBP) ] ================\n
  x/8wx $ebp
  echo \n====================================================\n
end
```

*(For 64-bit binaries, replace 32-bit registers with `rax`, `rbx`, `rcx`, `rdx`, `rsi`, `rdi`, `rbp`, `rsp`, `rip`).*

---

### How It Works

1. **`set disassembly-flavor intel`**: Switches opcode rendering from AT&T (`mov %esp, %ebp`) to standard Intel syntax (`mov ebp, esp`).
2. **`hook-stop`**: An internal GDB trigger. Whenever a breakpoint is struck, a step finishes (`stepi`/`nexti`), or a signal (e.g., `SIGSEGV`) occurs, GDB automatically executes the commands within the hook.
3. **Execution Context**:
   - Displays core CPU registers.
   - Shows the next 8 instructions about to execute at `$pc`.
   - Displays the top 16 words on the stack starting at `$esp`.
