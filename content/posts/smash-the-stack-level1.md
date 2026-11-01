---
title: "Smash The Stack: IO Level 1 Walkthrough"
date: 2014-12-01T00:08:03+00:00
url: "/smash-the-stack-level1/"
draft: false
description: "A walkthrough of Level 1 on the Smash The Stack IO wargame, analyzing a SUID binary using strings and GDB to extract the passcode."
categories: ["Bash", "exploit-dev", "Linux", "Security"]
tags: ["smashthestack", "wargame", "reversing", "gdb"]
---

In this challenge on the Smash The Stack IO wargame, the binaries are located under `/levels`.

Let's inspect the target binary for Level 1:

```bash
level1@io:/levels$ ls -alh level01
-r-sr-x--- 1 level2 level1 1.2K Jan 13  2014 level01
```

Notice the permissions: `-r-sr-x---` with the SUID bit set for `level2`. Executing this binary successfully will spawn a process with `level2` privileges.

### Initial Execution

Running the program prompts for a passcode:

```bash
level1@io:/levels$ ./level01
Enter the 3 digit passcode to enter: 838
```

Providing an arbitrary number exits silently with no output.

### Static Inspection

Before diving into dynamic analysis, inspect the printable strings in the binary:

```bash
level1@io:/levels$ strings level01
Enter the 3 digit passcode to enter: 
Congrats you found it, now read the password for level2 from /home/level2/.pass
/bin/sh
```

The binary references a success message and spawns a shell via `/bin/sh`.

### Dynamic Analysis with GDB

Let's disassemble `main` inside GDB:

```bash
level1@io:/levels$ gdb -q level01
(gdb) disassemble main
Dump of assembler code for function main:
   0x08048080 <+0>:     push   $0x8049128
   0x08048085 <+5>:     call   0x804810f <puts>
   0x0804808a <+10>:    call   0x804809f <fscanf>
   0x0804808f <+15>:    cmp    $0x10f,%eax
   0x08048094 <+20>:    je     0x80480dc <YouWin>
   0x0804809a <+26>:    call   0x8048103 <exit>
End of assembler dump.
```

Breaking down the assembly:
1. `call <puts>` prints the prompt.
2. `call <fscanf>` reads user input into `%eax`.
3. `cmp $0x10f,%eax` compares the input with immediate value `0x10f`.
4. `je <YouWin>` jumps to the winning function if equal.

Convert the hexadecimal value `0x10f` to decimal:

```python
>>> 0x10f
271
```

### Verification & Exploitation

Run the binary again with passcode `271`:

```bash
level1@io:/levels$ ./level01
Enter the 3 digit passcode to enter: 271
Congrats you found it, now read the password for level2 from /home/level2/.pass
sh-4.2$ whoami
level2
sh-4.2$ cat /home/level2/.pass
```

We obtain the shell as `level2` and retrieve the password for the next level.
