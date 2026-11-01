---
title: "Docker Containers Crash Course"
date: 2016-05-30T03:00:06+00:00
url: "/docker-crash-course/"
draft: false
description: "Docker Crash Course As Hypervisor is slow to boot and use a lot of resources and needs full installation the Container Technology not that old we used to use..."
categories: ["blog", "Linux"]
---

# Docker Crash Course

As Hypervisor is slow to boot and use a lot of resources and needs full installation

the Container Technology not that old we used to use LXC - openVZ extra

but what a cool about Docker is it really lightweight with awesome images build  and we can ship many services in one machine

it comes into two parts [DockerClient,  DockerServer]

and today i will write the best quick intro i could tell

## 1 - Introduction [how it will work]

docker run the process inside the container and when it has done it EXIT the container ( by EXIT I mean it STOP the container )

docker has official images [distros] called  saved in ( registry ) there is public registry also you can have a private registry, example hub.docker.com

every container you run get id example 915c72318028

## 2- installation

you can get docker to install from https://get.docker.com

```bash
wget https://get.docker.com -O docker_setup.sh
```

we did download the sh install filer remember to user CAPITAL -O

we run the docker setup via root account

to verify Docker Installation use

```bash
$ docker version
 Version:      1.11.1
 API version:  1.23
 Go version:   go1.5.4
 Git commit:   5604cbe
 Built:        Tue Apr 26 23:30:23 2016
 OS/Arch:      linux/amd64

Server:
 Version:      1.11.1
 API version:  1.23
 Go version:   go1.5.4
 Git commit:   5604cbe
 Built:        Tue Apr 26 23:30:23 2016
 OS/Arch:      linux/amd64
```

as you can there is 2 versions for the client and server

## 3- Basic Usage

to be able to run container First you have to decide what image you want to use

so lets pickup ubuntu for example

so we can search the public hub to find ubuntu by

```bash
compiler@ubuntu:~/docker$ sudo docker search ubuntu
NAME                              DESCRIPTION                                     STARS     OFFICIAL   AUTOMATED
ubuntu                            Ubuntu is a Debian-based Linux operating s...   3999      [OK]
ubuntu-upstart                    Upstart is an event-based replacement for ...   63        [OK]
rastasheep/ubuntu-sshd            Dockerized SSH service, built on top of of...   28                   [OK]
torusware/speedus-ubuntu          Always updated official Ubuntu docker imag...   26                   [OK]
ubuntu-debootstrap                debootstrap --variant=minbase --components...   24        [OK]
ioft/armhf-ubuntu                 [ABR] Ubuntu Docker images for the ARMv7(a...   12                   [OK]
nickistre/ubuntu-lamp             LAMP server on Ubuntu                           7                    [OK]
```

 

there is a list of Ubuntu images but the most important is the OFFICIAL images ( the one we can trust )

FYI: you and other people can make and upload images easily

so let's RUN our first ubuntu container via docker

for the first time docker will pull images from the hub and save it locally in your machine for faster boot :D

to list the current images

$ **docker images**

```bash
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
ubuntu              latest              2fa927b5cdd3        2 days ago          122 MB
nginx               latest              b1fcb97bc5f6        5 days ago          182.8 MB
hello-world         latest              94df4f0ce8a4        4 weeks ago         967 B
```

 

```bash
compiler@ubuntu:~/docker$ docker run ubuntu
compiler@ubuntu:~/docker$ echo $?
0
compiler@ubuntu:~/docker$
```

and here we go.

yes as you see EXACTLY the command passed successfully,

so where is the container!

you can list running containers via docker **ps**

```bash
compiler@ubuntu:~/docker$ sudo docker ps
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
compiler@ubuntu:~/docker$
```

as you can see it not listed because ps is for running containers only!

the answer for the next question, simple yes your container finished work and stopped as we mentioned in the introduction

Docker will keep your container running as long as you keep it busy ( this is the cool thing about Docker and Resource Save )

so let's list all containers even the stopped one

 

```bash
compiler@ubuntu:~/docker$ docker<strong> ps -a</strong>
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                           PORTS               NAMES
915c72318028        ubuntu              "/bin/bash"              14 minutes ago      Exited (0) 14 minutes ago                            elegant_snyder
compiler@ubuntu:~/docker$
```

the status of the container is Exited (0)

so next time we need run container with a command to see it working

```bash
compiler@ubuntu:~/docker$ sudo docker run ubuntu <strong>id</strong>
uid=0(root) gid=0(root) groups=0(root)
compiler@ubuntu:~/docker$

compiler@ubuntu:~/docker$ sudo docker run ubuntu <strong>uname -a</strong>
Linux 4a27417f50b9 3.13.0-86-generic #131-Ubuntu SMP Thu May 12 23:33:13 UTC 2016 x86_64 x86_64 x86_64 GNU/Linux
compiler@ubuntu:~/docker$
```

and this means we run 2 containers and the status of them stopped

as you can see the container started in less than a second

### jump in container shell

but this time we will add 2 parameters to run -i -t
-i, --interactive               Keep STDIN open even if not attached

-t, --tty                       Allocate a pseudo-TTY

this both to keep us connected to a container

```bash
compiler@ubuntu:~$ sudo docker run -it ubuntu /bin/bash
root@75907b371305:/# hostname
75907b371305
root@75907b371305:/# id
uid=0(root) gid=0(root) groups=0(root)
root@75907b371305:/# uptime
01:03:48 up 1 day, 9:13, 0 users, load average: 0.00, 0.01, 0.05
root@75907b371305:/#
```

 

### docker in detached mode

```bash
compiler@ubuntu:~/docker$ sudo docker run -itd ubuntu /bin/bash
96d3c78ab0f8927693e448444445781b45e61796b914990ef4acd0986aca096d
compiler@ubuntu:~/docker$ docker ps
CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES
96d3c78ab0f8 ubuntu "/bin/bash" 2 seconds ago Up 2 seconds stupefied_morse
```

no we have the container up and running

 

### using port forward with docker in detached mode

docker come with awesome port mapping, for example, we want to run nginx container and by

image default it listens to 80,443

```bash
compiler@ubuntu:~/docker$ docker run -d -P nginx
1c0c6bc0c34fc6648a426b6c9d58eb079c86471c1bea521a720b3f3204f76059
compiler@ubuntu:~/docker$
```

```bash
compiler@ubuntu:~/docker$ sudo docker ps
CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES
1c0c6bc0c34f nginx "nginx -g 'daemon off" About a minute ago Up About a minute 0.0.0.0:32775->80/tcp, 0.0.0.0:32774->443/tcp gigantic_noether
```

there is 2 port forwards here

0.0.0.0:32775->80/tcp, 0.0.0.0:32774->443/tcp

localhost:32775 to nginx container:80

localhost:32774 to nginx container:443/tcp

## 4- Building Docker Images

building a docker image is like create an ( OS Template ) for reuse, you don't have to setup all your dependencies each time you decide to run container, you build image once and you use it as mass production.

### Docker Images

first, we need to understand how is images looks like

images

```bash
compiler@ubuntu:~/docker$ sudo docker images
REPOSITORY TAG IMAGE ID CREATED SIZE
ubuntu latest 2fa927b5cdd3 2 days ago 122 MB
nginx latest b1fcb97bc5f6 5 days ago 182.8 MB
```

images come with repository and tag

each repository can have many apps

for example:

privterepo/webserver

privterepo/db

privterepo/logs

and each app could have a tag name example

privterepo/webserver:2.5.1

privterepo/webserver:2.6.1

**Docker Commit ( save container changes as a template )** 

so we need to install some packages inside one of our containers let's say we want to install python Django

and all our app dependencies  once you did finish with installing your packages

let's save the status of this container as image

first, we need  3 things

1 - Container ID

2- Registry Name  ( you can write anything you want depends if you will upload it or not )

3- modification name

4- Tag name ( Version )

 

let's assume we build a container for development and we installed our needed  libs

we will use the container id to commit it docker commit 505815e27433 private/app:1.0

```bash
compiler@ubuntu:~/docker$ docker commit 505815e27433 private/app:1.0
sha256:3c7881fe969f5be91f8b766910a7d5dea94db7900b1d31dd2ded259d73fec2b6
compiler@ubuntu:~/docker$ docker images
REPOSITORY TAG IMAGE ID CREATED SIZE
privte/app 1.0 3c7881fe969f 3 seconds ago 129.3 MB
nginx latest b1fcb97bc5f6 5 days ago 182.8 MB
```

as you can see in our images there is a new one with id: 3c7881fe969f

also, you can create an image without specifying a version

```bash
$ docker commit 505815e27433 private/app
```

and an image will be versioned as the latest 

```bash
private/app          latest              b2f06fe9a07d        2 seconds ago       129.3 MB
```

so we can use our new image to build as many as containers on it 

keep in mind you can make multi commits for the same modification you made in a container

 

### running Docker container from a self-made image

```bash
docker run -it private/app:1.0 /bin/bash
```

or use the latest version ( the default tag name )

```bash
docker run -it private/app /bin/bash
```

 

Destroy  all containers

```
docker rm -f `docker ps -a|awk '{print $1}'|grep -v CONTAINER`
```
