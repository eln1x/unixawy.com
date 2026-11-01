---
title: "Encrypting and Decrypting Files with GnuPG (GPG)"
date: 2014-11-24T15:20:24+00:00
url: "/files-encrypt-with-gpg/"
draft: false
description: "A quick practical guide to symmetric and asymmetric file encryption using GnuPG (GPG) for secure transmission and storage in Linux."
categories: ["Linux", "Security", "Cryptography"]
tags: ["linux", "gpg", "gnupg", "encryption", "security", "privacy"]
---

**GnuPG (GPG)** is a complete implementation of the OpenPGP standard (RFC 4880). It allows you to encrypt data either symmetrically (using a shared passphrase) or asymmetrically (using public/private key pairs).

When you need to protect sensitive documents (such as financial records, credentials, or backups) before sending them over email or untrusted channels, symmetric GPG encryption provides strong, zero-infrastructure security.

---

### Symmetric Encryption with a Passphrase

To encrypt a file symmetrically using a password:

```bash
gpg --symmetric --cipher-algo AES256 orders.xls
```
*(Shortcut: `gpg -c orders.xls`)*

GPG prompts you twice to enter a strong passphrase. It produces an encrypted binary output file:
`orders.xls.gpg`

> **Security Tip:** Always specify `--cipher-algo AES256` to override legacy default ciphers (such as CAST5) with modern, robust AES encryption.

---

### Decrypting the File

The recipient can decrypt the file by running GPG without arguments:

```bash
gpg -d orders.xls.gpg > orders.xls
# Or simply:
gpg orders.xls.gpg
```

Upon providing the correct passphrase, GPG decrypts and verifies the ciphertext, restoring the original plaintext document.

---

### ASCII-Armored Encryption (Text-Safe)

If you need to send encrypted content over text-only channels (chat, email bodies, paste sites) without handling binary files, use the `-a` / `--armor` flag:

```bash
gpg --symmetric --armor --cipher-algo AES256 orders.xls
```

This generates an ASCII-armored file (`orders.xls.asc`) containing a text block:

```text
-----BEGIN PGP MESSAGE-----
Version: GnuPG v2

jA0EBwMC...
...
-----END PGP MESSAGE-----
```
