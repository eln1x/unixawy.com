---
title: "NGINX forward visitor real ip to apache"
date: 2014-11-30T22:08:16+00:00
url: "/nginx-forward-visitor-real-ip-to-apache/"
draft: false
description: "let's assume u have NGINX on port 80 apache on port 8080 in nginx config sever config virtualhost config so your apache logs say traffic comes from IP..."
categories: ["blog", "Firewall", "Linux", "Web"]
---

let's assume u have

NGINX on port 80

apache on port 8080

 

in nginx config -> sever config -> virtualhost config

```
location / {
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $remote_addr;
proxy_set_header Host $host;
proxy_pass http://127.0.0.1:8080;

}
```

 

so your apache logs say traffic   comes from IP 127.0.0.1

mod_rpaf - reverse proxy add forward

packages needed  apache development

 

apt-get install libapache2-mod-rpaf

mod_rpaf config

```
<IfModule rpaf_module>
    RPAFenable On
    RPAFsethostname On
    RPAFproxy_ips 127.0.0.1
</IfModule>
```

or install it from source

https://github.com/gnif/mod_rpaf
