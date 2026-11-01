---
title: "Forwarding Client Real IPs from Nginx Reverse Proxy to Apache"
date: 2014-11-30T22:08:16+00:00
url: "/nginx-forward-visitor-real-ip-to-apache/"
draft: false
description: "How to configure Nginx reverse proxy headers (X-Real-IP, X-Forwarded-For) and Apache modules (mod_remoteip / mod_rpaf) to restore original client IP addresses in backend access logs."
categories: ["blog", "Firewall", "Linux", "Web"]
---

A common high-performance web architecture deploys **Nginx** on the public frontend (port 80/443) to handle TLS termination, static asset caching, and request routing, reverse-proxying dynamic requests to an **Apache** backend (e.g., listening on port 8080 or localhost).

However, without explicit header forwarding, Apache logs will show all incoming requests originating from `127.0.0.1` (the reverse proxy IP) rather than the client's actual public IP. This disrupts geolocation, fraud detection, rate-limiting, and security audit trails.

---

## 1. Nginx Reverse Proxy Configuration

Configure Nginx to append the original client IP address and proxy metadata into standard HTTP request headers:

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        
        # Forward client connection headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Reload Nginx to apply changes:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 2. Apache Backend Configuration

On the Apache backend, we must instruct the web server to trust the upstream proxy headers and rewrite the logged client IP.

### Modern Apache (HTTPD 2.4+): `mod_remoteip`

In modern Apache installations, the standard built-in module is `mod_remoteip`.

1. Enable the module:

```bash
sudo a2enmod remoteip
```

2. Configure trusted proxy IPs in `/etc/apache2/conf-available/remoteip.conf`:

```apache
<IfModule remoteip_module>
    RemoteIPHeader X-Forwarded-For
    RemoteIPTrustedProxy 127.0.0.1 ::1
</IfModule>
```

3. Enable the configuration and update Apache's `LogFormat` directives in `apache2.conf` to use `%a` (client IP) instead of `%h`:

```apache
LogFormat "%v:%p %a %l %u %t \"%r\" %>s %O \"%{Referer}i\" \"%{User-Agent}i\"" vhost_combined
LogFormat "%a %l %u %t \"%r\" %>s %O \"%{Referer}i\" \"%{User-Agent}i\"" combined
```

```bash
sudo a2enconf remoteip
sudo systemctl restart apache2
```

---

### Legacy Apache: `mod_rpaf`

On older distributions (Apache 2.2 / Debian Wheezy / Ubuntu 12.04), `mod_rpaf` was commonly used:

```bash
sudo apt-get install libapache2-mod-rpaf
```

Configuration in `/etc/apache2/mods-available/rpaf.conf`:

```apache
<IfModule rpaf_module>
    RPAFenable On
    RPAFsethostname On
    RPAFproxy_ips 127.0.0.1
    RPAFheader X-Real-IP
</IfModule>
```

Restart Apache to verify that your access logs now reflect authentic client source addresses.
