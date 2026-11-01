---
title: "Shellcode validation via C pointer"
date: 2018-10-15T17:19:50+00:00
url: "/shellcode-validation-via-c-pointer/"
draft: false
description: "C snippet to test the shellcode replace your shellcode with your custom payload compile options"
categories: ["blog"]
---

C snippet to test the shellcode

replace your shellcode with your custom payload

 

```c
char shellcode[] = "\xcc\xcc\xcc\xcc\xcc\xcc\xcc\xcc\xcc\xcc\xcc\xcc";

int main(int argc, char **argv){
        int (*target)();
        target = (int(*)())shellcode;
        (int)(*target)();
}
```

compile options

```bash
gcc shellcode.c -o shellcode  -fno-stack-protector -z execstack
```

```bash
gdb ./shellcode
```
