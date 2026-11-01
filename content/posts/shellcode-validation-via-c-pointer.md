---
title: "Testing and Validating Shellcode in C via Function Pointers"
date: 2018-10-15T17:19:50+00:00
url: "/shellcode-validation-via-c-pointer/"
draft: false
description: "A minimal C harness to test, validate, and debug raw assembly shellcode by casting a byte array into an executable function pointer."
categories: ["exploit-dev", "Security"]
tags: ["c", "shellcode", "exploit-dev", "gcc", "assembly", "debugging"]
---

When writing or modifying custom assembly shellcode (such as egg hunters, socket reuse payloads, or stagers), you must verify that the payload functions correctly before embedding it into a full exploit delivery chain.

A standard C test harness executes shellcode by casting a char array in memory to a function pointer and calling it directly.

---

### The C Test Harness

```c
#include <stdio.h>
#include <string.h>

// Example: Software breakpoint (INT3) or your target shellcode
const char shellcode[] = 
    "\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80";

int main(int argc, char **argv)
{
    printf("Shellcode length: %zu bytes\n", strlen(shellcode));

    // Cast the array address to a callable function pointer
    int (*ret)() = (int (*)())shellcode;

    // Transfer control flow to shellcode
    ret();

    return 0;
}
```

---

### Compilation Flags: Disabling Modern Mitigations

Modern compilers enable Stack Canaries and enforce Non-Executable Memory (**DEP / NX**) by default. If you attempt to execute data placed in the `.rodata` or `.data` section without special flags, the kernel terminates the process with a `SIGSEGV` / segmentation fault.

Compile with `-z execstack` and `-fno-stack-protector`:

```bash
# 32-bit compilation:
gcc -m32 -fno-stack-protector -z execstack shellcode_test.c -o test32

# 64-bit compilation:
gcc -fno-stack-protector -z execstack shellcode_test.c -o test64
```

- **`-z execstack`**: Clears the `GNU_STACK` ELF header flag, instructing the kernel loader to mark memory pages containing data and the stack as executable (`RWX`).
- **`-fno-stack-protector`**: Disables stack canary verification.

---

### Debugging Under GDB

To step through your shellcode instruction-by-instruction:

```bash
gdb -q ./test32
(gdb) break main
(gdb) run
(gdb) stepi
```
