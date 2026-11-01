---
title: "Files Encrypt with GPG"
date: 2014-11-24T15:20:24+00:00
url: "/files-encrypt-with-gpg/"
draft: false
description: "GPG = Gnu Privacy Guard To secure file from unauthorised access with the password in Linux/Unix is very simple method :) lets assume we have a secure file with..."
categories: ["Bash", "blog", "Firewall", "Linux", "Security"]
---

GPG = Gnu Privacy Guard

To secure file from unauthorised access with the password in Linux/Unix is very simple method :)

lets assume we have a secure file with some financials stuff called orders.xls

and we want to email it to our partners  and we  want to get sure just he is the only one will be able to read it

first we will encrypt the file with password

gpg -c orders.xls

```
gpg -c orders.xls 
Enter passphrase: *******
Repeat passphrase: ******
```

it will create a file orders.xls.gpg   this file that will be sent to our partners

notice the gig extension in the end of the file

this file will be only decrypted if  our partners enter the correct password

decrypt the file with password

```
gpg orders.xls.gpg
gpg: CAST5 encrypted data
Enter passphrase: ******
gpg: CAST5 encrypted data
gpg: encrypted with 1 passphrase
gpg: WARNING: message was not integrity protected

it will create the clean orders.xls file :)
```
