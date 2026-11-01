---
title: "SMASH THE STACK Level1"
date: 2014-12-01T00:08:03+00:00
url: "/smash-the-stack-level1/"
draft: false
description: "after login to the ssh server levels located on /levels so let's play level1 as u notice it had suid permeation r sr x for level2 so it will lead us to a user..."
categories: ["Bash", "blog", "exploit-dev", "Linux", "Security", "tech"]
---

after login to the ssh server

levels located on /levels

so let's play  level1

```bash
level2@io:/levels$ ls -alh level01
-r-sr-x--- 1 level2 level1 1.2K Jan 13  2014 level01
```

as u notice it had suid permeation  -r-sr-x--- for level2  so it will lead us to a user (level2 )

```bash
level1@io:/levels$ ./level01
Enter the 3 digit passcode to enter: 838
```

I entered any test number and it leads me with no respond :D crazy huh!

so I decided to look inside the binary file (quick look )

```bash
level1@io:/levels$ strings level01
,0<	w
Enter the 3 digit passcode to enter: Congrats you found it, now read the password for level2 from /home/level2/.pass
/bin/sh 
```

it had a sting "Enter the 3 digit passcode to enter: Congrats you found it, now read the password for level2 from /home/level2/.pass"

and it execute /bin/bash

so lets fire gdb and see what inside

```bash
level1@io:/levels$ gdb level01
(gdb) disassemble main
Dump of assembler code for function main:
   0x08048080 <+0>:	push   $0x8049128
   0x08048085 <+5>:	call   0x804810f <puts>
   0x0804808a <+10>:	call   0x804809f <fscanf>
   0x0804808f <+15>:	cmp    $0x10f,%eax
   0x08048094 <+20>:	je     0x80480dc <YouWin>
   0x0804809a <+26>:	call   0x8048103 <exit>
End of assembler dump.
```

 

first  puts() function to print the string above

```
   0x08048085 <+5>:	call   0x804810f <puts>
```

then fscanf() function to read the passcode

```
   0x0804808a <+10>:	call   0x804809f <fscanf>
```

then the sweet thing  a compare function

```
   0x0804808f <+15>:	cmp    $0x10f,%eax
```

it compares between hex and data inside eax

so let's see what hex says

```
>>> print 0x10f
271
>>>271
```

seems  we got the passcode lets try it

```bash
   (gdb) r
Starting program: /levels/level01
Enter the 3 digit passcode to enter: 271
Congrats you found it, now read the password for level2 from /home/level2/.pass
process 27887 is executing new program: /bin/bash
sh-4.2$
```

I love to see

```
process 27887 is executing new program: /bin/bash
```
