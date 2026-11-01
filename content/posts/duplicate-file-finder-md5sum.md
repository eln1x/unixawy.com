---
title: "Duplicate File Finder via Cryptographic Hashes in Python"
date: 2014-12-04T18:59:01+00:00
url: "/duplicate-file-finder-md5sum/"
draft: false
description: "A Python script to recursively scan directories, identify duplicate files using cryptographic hash comparisons, and interactively prune redundant data."
categories: ["blog", "Python", "Security"]
---

Redundant and duplicated files consume valuable disk capacity and complicate backup management. Because identical files often have different names or modification timestamps, simple filename comparisons are insufficient.

By computing cryptographic checksums (MD5 or SHA-256) for each file's binary content, we can reliably group and identify duplicate files across extensive filesystem trees.

---

## Python Duplicate File Scanner

This script traverses the target directory recursively, calculates chunked cryptographic checksums to minimize memory usage, and prompts interactively to safely delete redundant copies.

```python
#!/usr/bin/env python3
"""
Duplicate File Finder
Author: Ahmad Mahfouz (_N1X_)
Description: Detects duplicate files across a directory tree using cryptographic hashing.
"""

import os
import sys
import hashlib
from collections import defaultdict

CHUNK_SIZE = 65536  # 64 KB read buffer

def compute_hash(filepath, algorithm="sha256"):
    """Computes the hash of a file efficiently in chunked streams."""
    hasher = hashlib.new(algorithm)
    try:
        with open(filepath, "rb") as f:
            while chunk := f.read(CHUNK_SIZE):
                hasher.update(chunk)
        return hasher.hexdigest()
    except (PermissionError, OSError) as e:
        print(f"[!] Warning: Cannot read {filepath}: {e}")
        return None

def find_duplicates(target_dir):
    """Scans target_dir and groups identical files by hash."""
    hashes = defaultdict(list)
    total_scanned = 0

    print(f"[*] Starting scan on: {os.path.abspath(target_dir)}")
    for root, _, files in os.walk(target_dir):
        for filename in files:
            filepath = os.path.join(root, filename)
            # Skip symlinks to avoid duplicate loops
            if os.path.islink(filepath):
                continue

            file_hash = compute_hash(filepath)
            if file_hash:
                hashes[file_hash].append(filepath)
                total_scanned += 1
                if total_scanned % 100 == 0:
                    print(f"\r[*] Processed {total_scanned} files...", end="", flush=True)

    print(f"\r[*] Completed scan. Total files analyzed: {total_scanned}\n")
    return {h: paths for h, paths in hashes.items() if len(paths) > 1}

def review_and_clean(duplicates):
    """Prompts the user interactively to inspect and remove duplicates."""
    if not duplicates:
        print("[+] No duplicate files detected.")
        return

    print(f"[+] Found {len(duplicates)} sets of duplicate files:\n")
    for file_hash, paths in duplicates.items():
        print(f"Checksum: {file_hash}")
        for idx, path in enumerate(paths, 1):
            size_kb = os.path.getsize(path) / 1024
            print(f"  [{idx}] {path} ({size_kb:.2f} KB)")

        confirm = input("Enter file numbers to delete separated by commas (or press Enter to skip): ").strip()
        if confirm:
            choices = [int(c.strip()) for c in confirm.split(",") if c.strip().isdigit()]
            for choice in choices:
                if 1 <= choice <= len(paths):
                    target_to_remove = paths[choice - 1]
                    try:
                        os.remove(target_to_remove)
                        print(f"  [-] Removed: {target_to_remove}")
                    except OSError as e:
                        print(f"  [!] Failed to remove {target_to_remove}: {e}")
        print("-" * 50)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python find_duplicates.py <directory_path>")
        sys.exit(1)

    target_directory = sys.argv[1]
    if not os.path.isdir(target_directory):
        print(f"Error: Directory '{target_directory}' does not exist.")
        sys.exit(1)

    dup_map = find_duplicates(target_directory)
    review_and_clean(dup_map)
```
