---
title: "Building an Audio & Desktop Cryptocurrency Price Alert in Python"
date: 2014-12-04T18:29:01+00:00
url: "/bitcoin-price-tracker-speech/"
draft: false
description: "How to build a real-time cryptocurrency price tracker in Python that triggers audio speech alerts via espeak and desktop notifications via notify-send when market thresholds are crossed."
categories: ["blog", "Python", "Linux"]
---

Monitoring volatile market movements often requires immediate notifications without constantly watching browser tabs or mobile trading apps.

By combining public REST APIs with native Linux desktop notification tools (`notify-send`) and speech synthesis engines (`espeak`), we can build a lightweight background tracker that speaks out when price targets are reached.

---

## Prerequisites

On Debian/Ubuntu systems, install `espeak` and `libnotify-bin`:

```bash
sudo apt-get install -y espeak libnotify-bin
```

---

## Python Price Alert Script

The script queries a public ticker API, evaluates target price thresholds, and delivers desktop notifications alongside synthesized voice alerts:

```python
#!/usr/bin/env python3
"""
Cryptocurrency Price Monitor with Speech and Desktop Alerts
Author: Ahmad Mahfouz (_N1X_)
"""

import sys
import time
import datetime
import subprocess
import requests

API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"

def trigger_alert(current_price):
    """Dispatches audio and GUI alerts on Linux desktops."""
    message = f"Bitcoin target reached: ${current_price:,.2f}"
    print(f"\n[!] ALERT: {message}")

    # Desktop notification
    subprocess.run(["notify-send", "Crypto Alert", message])

    # Text-to-speech audio announcement
    subprocess.run(["espeak", f"Bitcoin price is now {int(current_price)} dollars"])

def monitor(target_price, poll_interval=15):
    print(f"[*] Monitoring Bitcoin price. Target threshold: ${target_price:,.2f}")
    
    while True:
        try:
            response = requests.get(API_URL, timeout=10)
            data = response.json()
            current_price = float(data["bitcoin"]["usd"])
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            print(f"[{timestamp}] Current: ${current_price:,.2f} | Target: ${target_price:,.2f}")

            if current_price >= target_price:
                trigger_alert(current_price)
                break

        except requests.exceptions.RequestException as e:
            print(f"[!] Network error: {e}")
            subprocess.run(["espeak", "Connection warning"])

        time.sleep(poll_interval)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python crypto_tracker.py <target_price_usd>")
        sys.exit(1)

    try:
        target = float(sys.argv[1])
        monitor(target)
    except ValueError:
        print("Error: Target price must be a valid number.")
        sys.exit(1)
```
