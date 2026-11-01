---
title: "Building Lightweight Terminal Progress Bars in Pure Python"
date: 2014-12-04T19:04:28+00:00
url: "/python-progress-bar/"
draft: false
description: "How to build a lightweight, dependency-free command-line progress bar in Python using carriage returns and standard output buffers."
categories: ["blog", "Python"]
---

When developing CLI utilities, long-running batch jobs, or automation scripts, providing real-time visual feedback improves user experience. While libraries like `tqdm` or `rich` are excellent, standalone scripts or restricted production environments often benefit from a pure standard-library implementation without external dependencies.

---

## Minimal Standard-Library Progress Bar

By leveraging the carriage return character (`\r`), the terminal cursor returns to the start of the current line rather than advancing to a new line. Pairing this with `sys.stdout.flush()` forces immediate buffer rendering:

```python
import sys
import time

def progress_bar(iteration, total, prefix="Progress:", suffix="Complete", length=30):
    """
    Renders an inline terminal progress bar.
    """
    percent = f"{100 * (iteration / float(total)):.1f}"
    filled_len = int(length * iteration // total)
    bar = "=" * filled_len + "-" * (length - filled_len)
    
    # \r resets cursor to beginning of line
    sys.stdout.write(f"\r{prefix} [{bar}] {percent}% {suffix}")
    sys.stdout.flush()
    
    # Print a newline once completed
    if iteration == total:
        sys.stdout.write("\n")
```

---

## Example Usage

Simulate a task processing 50 discrete units:

```python
import time

total_tasks = 50
print("Starting processing batch...")

for i in range(1, total_tasks + 1):
    time.sleep(0.05)  # Simulate payload work
    progress_bar(i, total_tasks, prefix="Processing", suffix="Done", length=40)

print("Batch processing complete.")
```

Output:

```text
Processing [========================================] 100.0% Done
Batch processing complete.
```
