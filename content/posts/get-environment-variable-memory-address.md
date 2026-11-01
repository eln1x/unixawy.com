---
title: "Get Environment Variable memory  Address"
date: 2014-12-04T19:32:27+00:00
url: "/get-environment-variable-memory-address/"
draft: false
description: "some time u put the shellcode inside the environment and u will need the address of it to build ur payload here is a simple C code to get the address"
categories: ["Bash", "blog", "exploit-dev", "Security"]
---

some time u put the shellcode inside  the environment and u will need the address of it to build ur payload

here is a simple C code to get the address

```
  1 #include <stdio.h>
  2 #include <stdlib.h>
  3
  4 int main(int argc, char *argv[])
  5 {
  6     char *nix = getenv("NIX");
  7     printf("%p\n", nix);
  8     return 0;
  9 }
```
