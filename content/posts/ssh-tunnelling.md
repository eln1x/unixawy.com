---
title: "SSH Tunnelling"
date: 2015-08-12T23:18:08+00:00
url: "/ssh-tunnelling/"
draft: false
description: "the most famous method is using D parameter in ssh connection to bind a port local in your machine and this port tunnel back to our remote box to send our..."
categories: ["blog", "Linux", "tech"]
---

the most famous method is using D parameter in ssh connection to bind a port local in your machine and this port tunnel back to our remote box
to send our traffic to this server

example

```bash
ssh -D 1337 root@remotebox
```

then you can configure your application and browser to use your local IP 127.0.0.1 with the port 1337 to send traffic to the remote server

this is the traditional tunnelling way

let's make a bigger scenario

let's assume that we have access to the box with 2 interfaces
first interface with public IP and the second one with internal private LAN

the public IP 41.x.x.x
the private LAN IP 192.168.0.10

inside the private LAN machine with IP 192.168.0.20 and running ssh service and we want to connect to this machine
its impossible to connect to it from outside without tunnelling

let's do some tunnel magic

from our box to the remote box we will do ssh
OUR BOX ==SSH==> 41.x.x.x
inside the remote box, we will tunnel back to our machine

```bash
[root@REMOTE~]# ssh -f -N -R 1337:192.168.0.20:22 n1x@OURBOX
```

this will open port 1337 in the OUR BOX this port redirect to 192.168.0.20 machine in port 22

REMOTE BOX ==SSH+LOCAL FORWARD==>OURBOX

```bash
[n1x@OURBOX ~]$ ssh root@127.0.0.1 -p 1337
```

this ssh connection will lead u to the 192.168.0.20:22

sometimes you may need to skip ssh host verification as you connect to your local machine via this ssh option parameters UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no

```bash
[n1x@OURBOX ~]$ ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no root@127.0.0.1 -p 1337
```

also, this method could be used to bind to your internal ip to send ssh server back to better administration with vim also it possible to forward X via this tunnelling method

 

example scenario

our client don't have public IP and writing commands in TeamViewer is an unusable thing

so we ask our client to connect back to our machine

```bash
[root@client-6 ~]# ssh -f -N -R 9932:127.0.0.1:22 n1x@OURBOX
```

after client log in inside our machine we can connect to our client ssh via

```bash
[n1x@ourbox ~]$ ssh root@127.0.0.1 -p 9932
```

 

Happy Tunnelling
