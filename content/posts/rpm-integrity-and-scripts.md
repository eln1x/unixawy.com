---
title: "RPM integrity and scripts"
date: 2015-06-30T02:54:40+00:00
url: "/rpm-integrity-and-scripts/"
draft: false
description: "Yum repository comes with gpg and md5 support to verify the validity of the package You can list installed gpg keys in your system via It will show the unique..."
categories: ["blog", "Linux", "Security"]
---

Yum repository comes with gpg  and md5 support to verify the validity of the package

You can list installed gpg keys in your system via

```
rpm -qa  gpg-pubkey
```

It will show the unique id for the installed keys in your  system

gpg-pubkey-e8562897-459f07a4
gpg-pubkey-217521f6-45e8a532

To list all information related to a key
rpm -qi pgp-key-unique-id

```
Name        : gpg-pubkey                   Relocations: (not relocatable)
Version     : 6b8d79e6                          Vendor: (none)
Release     : 3f49313d                      Build Date: Wed Jan 16 03:03:02 2013
Install Date: Wed Jan 16 03:03:02 2013         Build Host: localhost
Group       : Public Keys                   Source RPM: (none)
Size        : 0                                License: pubkey
Signature   : (none)
Summary     : gpg(Dag Wieers (Dag Apt Repository v1.0) <dag@wieers.com>)
Description :
-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: rpm-4.4.2.3 (NSS-3)

mQGiBD9JMT0RBAC9Q2B0AloUMTxaK73sD0cOu1MMdD8yuDagbMlDtUYA1aGeJVO6
TV02JLGr67OBY+UkYuC1c3PUwmb3+jakZd5bW1L8E2L705wS0129xQOZPz6J+alF
5rTzVkiefg8ch1yEcMayK20NdyOmhDGXQXNQS8OJFLTIC6bJs+7MZL83/wCg3cG3
3q7MWHm3IpJb+6QKpB9YH58D/2WjPDK+7YIky/JbFBT4JPgTSBy611+bLqHA6PXq
39tzY6un8KDznAMNtm+NAsr6FEG8PHe406+tbgd7tBkecz3HPX8nR5v0JtDT+gzN
8fM3kAiAzjCHUAFWVAMAZLr5TXuoq4lGTTxvZbwTjZfyjCm7gIieCu8+qnPWh6hm
30NgA/0ZyEHG6I4rOWqPks4vZuD+wlp5XL8moBXEKfEVOMh2MCNDRGnvVHu1P3eD
oHOooVMt9sWrGcgxpYuupPNL4Uf6B6smiLlH6D4tEg+qCxC17zABI5572XJTJ170
JklZJrPGtnkPrrKMamnN9MU4RjGmjh9JZPa7rKjZHyWP/z/CBrQ1RGFnIFdpZWVy
cyAoRGFnIEFwdCBSZXBvc2l0b3J5IHYxLjApIDxkYWdAd2llZXJzLmNvbT6IWQQT
EQIAGQUCP0kxPQQLBwMCAxUCAwMWAgECHgECF4AACgkQog5SFGuNeeYvDQCeKHST
hIq/WzFBXtJOnQkJGSqAoHoAnRtsJVWYmzYKHqzkRx1qAzL18Sd0iEYEEBECAAYF
Aj9JMWAACgkQoj2iXPqnmevnOACfRQaageMcESHVE1+RSuP3txPUvoEAoJAtOHon
g+3SzVNSZLn/g7/Ljfw+uQENBD9JMT8QBACj1QzRptL6hbpWl5DdQ2T+3ekEjJGt
llCwt4Mwt/yOHDhzLe8SzUNyYxTXUL4TPfFvVW9/j8WOkNGvffbs7g84k7a5h/+l
IJTTlP9V9NruDt1dlrBe+mWF6eCY55OFHjb6nOIkcJwKxRd3nGlWnLsz0ce9Hjrg
6lMrn0lPsMV6swADBQP9H42sss6mlqnJEFA97Fl3V9s+7UVJoAIA5uSVXxEOwVoh
Vq7uECQRvWzif6tzOY+vHkUxOBRvD6oIU6tlmuG3WByKyA1d0MTqMr3eWieSYf/L
n5VA9NuD7NwjFA1kLkoDwfSbsF51LppTMkUggzwgvwE46MB6yyuqAVI1kReAWw+I
RgQYEQIABgUCP0kxPwAKCRCiDlIUa4155oktAKDAzm9QYbDpk6SrQhkSFy016BjE
BACeJU1hpElFnUZCL4yKj4EuLnlo8kc=
=mqUt-----END PGP PUBLIC KEY BLOCK-----
```

 

It will show version, vendor  and much more useful for debugging
To verify a package against the  installed keys

U can use parameter  **k** with rpm

Example

```
rpm -K /root/pptp-release-current.noarch.rpm
/root/pptp-release-current.noarch.rpm: (sha1) dsa sha1 md5 gpg OK
```

 

U will notice **ok** if passed pgp and md5 check

To. Verify which key used to validate this package h can use

```bash
rpm -vvK /root/pptp-release-current.noarch.rpm
D: Expected size:        20068 = lead(96)+sigs(344)+pad(0)+data(19628)
D:   Actual size:        20068
D: opening  db environment /var/lib/rpm/Packages joinenv
D: opening  db index       /var/lib/rpm/Packages rdonly mode=0x0
D: locked   db index       /var/lib/rpm/Packages
D: opening  db index       /var/lib/rpm/Pubkeys rdonly mode=0x0
D:  read h#    1392 Header sanity check: OK
D: ========== DSA pubkey id 0fc9d765 862acc42 (h#1392)
/root/pptp-release-current.noarch.rpm:
    Header V3 DSA signature: OK, key ID 862acc42
    Header SHA1 digest: OK (bbd96d51e0c238cc7da23b5d14e63831b71a9f61)
    MD5 digest: OK (b25710e9b1164bfe2646e7b7520e7c30)
    V3 DSA signature: OK, key ID 862acc42
D: closed   db index       /var/lib/rpm/Pubkeys
D: closed   db index       /var/lib/rpm/Packages
D: closed   db environment /var/lib/rpm/Packages
D: May free Score board((nil))
```

 

It will show the public key id

Package developer  can add  some scripts to package metadata that run as root

To list scripts inside the rpm package

```
rpm -q --scripts openvpn
preinstall scriptlet (using /bin/sh):
getent group openvpn &>/dev/null || groupadd -r openvpn
getent passwd openvpn &>/dev/null || \
    /usr/sbin/useradd -r -g openvpn -s /sbin/nologin -c OpenVPN \
        -d /etc/openvpn openvpn
postinstall scriptlet (using /bin/sh):
/sbin/chkconfig --add openvpn
preuninstall scriptlet (using /bin/sh):
if [ "$1" = 0 ]; then
    /sbin/service openvpn stop
    /sbin/chkconfig --del openvpn
fi
postuninstall scriptlet (using /bin/sh):
if [ "$1" -ge 1 ]; then
    /sbin/service openvpn condrestart >/dev/null 2>&1
fi
```

please notice the

preinstall,postinstall,preuninstall,postuninstall

before and after install

and before and after uninstall

to make rpm transaction with skipping scripts  you should use no script parameter to yum

```
rpm --noscripts (install/uninstall) package.rpm
rpm --notriggers (install/uninstall) package.rpm
```

happy consoles
