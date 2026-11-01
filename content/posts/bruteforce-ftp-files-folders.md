---
title: "Dictionary Enumeration of Blind FTP Directories and Files in Python"
date: 2014-12-06T18:15:48+00:00
url: "/bruteforce-ftp-files-folders/"
draft: false
description: "How to perform dictionary-based directory and file discovery against FTP servers when directory listing permissions (LIST / NLST) are disabled."
categories: ["blog", "Python", "Security"]
---

During penetration testing assessments, FTP services (such as vsftpd or ProFTPD) are sometimes configured to disable directory listings (`LIST` or `NLST` commands return `550 Access is denied`). While users cannot browse the file hierarchy interactively, read and traversal permissions may still allow direct path navigation (`CWD`) and file retrieval (`RETR`).

In such "blind" scenarios, dictionary-based brute forcing reveals hidden folders and downloadable assets.

---

## 1. Directory Fuzzing via `CWD`

This Python script tests candidate directory names against the FTP server using the `CWD` (Change Working Directory) command. If the directory exists and permissions permit traversal, the server returns a positive status code rather than `error_perm` (550).

```python
#!/usr/bin/env python3
import ftplib
import sys

def brute_directories(host, wordlist_file, user="anonymous", password="guest@example.com"):
    try:
        ftp = ftplib.FTP(host, timeout=10)
        ftp.login(user, password)
        print(f"[*] Authenticated to {host} as {user}")
    except Exception as e:
        print(f"[-] Authentication failed: {e}")
        return

    with open(wordlist_file, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            directory = line.strip()
            if not directory:
                continue
            try:
                ftp.cwd(directory)
                print(f"[+] Discovered valid directory: /{directory}")
                ftp.cwd("/")  # Return to root for next test
            except ftplib.error_perm:
                continue
            except Exception as e:
                print(f"[!] Error testing {directory}: {e}")

    ftp.quit()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python ftp_dir_brute.py <host> <wordlist.txt>")
        sys.exit(1)
    brute_directories(sys.argv[1], sys.argv[2])
```

---

## 2. File Enumeration and Download via `RETR`

When probing for sensitive backups, configuration dumps, or logs, we can attempt retrieval directly using the `RETR` command:

```python
#!/usr/bin/env python3
import ftplib
import os
import sys

def brute_files(host, wordlist_file, output_dir="./downloaded", user="anonymous", password="guest@example.com"):
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        ftp = ftplib.FTP(host, timeout=10)
        ftp.login(user, password)
    except Exception as e:
        print(f"[-] Connection failed: {e}")
        return

    with open(wordlist_file, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            filename = line.strip()
            if not filename:
                continue
            local_path = os.path.join(output_dir, filename)
            try:
                with open(local_path, "wb") as f_out:
                    ftp.retrbinary(f"RETR {filename}", f_out.write)
                print(f"[+] Downloaded: {filename}")
            except ftplib.error_perm:
                if os.path.exists(local_path):
                    os.remove(local_path)
                continue

    ftp.quit()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python ftp_file_brute.py <host> <wordlist.txt>")
        sys.exit(1)
    brute_files(sys.argv[1], sys.argv[2])
```

> [!TIP]
> Run file retrieval checks inside a designated temporary directory to prevent overwriting existing local files during automated transfers.
