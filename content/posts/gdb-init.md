---
title: "GDB hook .gdbinit"
date: 2019-02-04T22:35:25+00:00
url: "/gdb-init/"
draft: false
description: "GDB hook that helps without third party apps"
categories: ["blog", "Security", "tech"]
---

GDB hook that helps without third-party apps

```
set disassembly-flavor intel
define hook-stop
info register eax
info register ebx
info register ecx
info register edx
info register ebp
info register esp
info register edi
info register eip
 
echo OPCODE ->\r\n
 
x/10i $pc
 
echo ESP ->\r\n
x/16w $esp
echo EBP ->\r\n
 
x/16w $ebp
end
```
