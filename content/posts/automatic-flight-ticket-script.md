---
title: "Automated Flight Ticket Booking and Availability Monitoring with Splinter"
date: 2014-12-04T18:37:19+00:00
url: "/automatic-flight-ticket-script/"
draft: false
description: "How to use Python and the Splinter browser automation library to continuously monitor airline reservation systems and automate ticket booking forms."
categories: ["blog", "Python", "Web", "Automation"]
---

During peak holiday seasons, securing airline seats on heavily booked routes often requires repeatedly checking booking engines for cancellations.

Using browser automation frameworks like **Splinter** (an abstraction layer built on top of Selenium WebDriver), we can automate the search loop, detect flight inventory releases, fill passenger details, and hold reservations automatically.

---

## What is Splinter?

[Splinter](https://splinter.readthedocs.io/) provides a pythonic API for browser automation. It allows developers to:
- Navigate web portals and wait for elements.
- Select radio buttons, dropdowns, and checkboxes.
- Fill form fields and submit via JavaScript execution.
- Inspect rendered DOM structures and handle session timeouts.

---

## Automated Booking Workflow

The script continuously queries available flight options for specific routes and travel dates. If the airline portal reports "no flights available" or sessions expire, it automatically restarts the search until seats open up, then populates passenger credentials:

```python
#!/usr/bin/env python3
"""
Automated Flight Search and Booking Assistant
Author: Ahmad Mahfouz (_N1X_)
"""

import time
import sys
from splinter import Browser

def check_flight_availability():
    # Launch browser automation instance (e.g., Firefox or Chrome)
    with Browser('chrome') as browser:
        url = 'https://www.example-airline.com/booking'
        browser.visit(url)

        # 1. Configure Search Criteria
        browser.find_by_name('TRIP_TYPE')[2].click()  # One-way journey
        browser.fill('ORIGIN_AIRPORT', 'DMM')         # Dammam
        browser.fill('DEST_AIRPORT', 'RUH')           # Riyadh
        browser.select('DEPARTURE_DAY', '15')
        browser.select('DEPARTURE_MONTH', '122026')
        browser.select('CABIN_CLASS', 'Economy')
        browser.select('NUM_ADULTS', '1')

        # Submit availability search
        browser.find_by_id("submitFlightSearch").click()

        # 2. Polling and Retry Loop
        unavailable_text = "Flights are not available for the date / time specified"
        session_timeout_text = "Your session has timed out"

        if browser.is_text_present(unavailable_text) or browser.is_text_present(session_timeout_text):
            print("[-] No seats currently available. Retrying...")
            time.sleep(10)
            return False

        # 3. Select First Available Flight
        print("[+] Flight found! Selecting fare...")
        browser.find_by_css(".flight-select-radio").first.click()
        browser.execute_script("document.getElementById('passengerForm').submit();")

        # 4. Populate Passenger Information
        browser.select('TITLE_1', 'MR')
        browser.fill('FIRST_NAME_1', 'John')
        browser.fill('LAST_NAME_1', 'Doe')
        browser.select('NATIONALITY_1', 'SA')

        browser.fill('CONTACT_PHONE', '+966500000000')
        browser.fill('CONTACT_EMAIL', 'user@example.com')

        # Accept terms and proceed to payment
        browser.check('TERMS_CONDITIONS')
        browser.execute_script("document.getElementById('checkoutForm').submit();")

        # 5. Extract Booking Reference
        if "recordLocator" in browser.html:
            booking_ref = browser.find_by_id("bookingReference").text
            print(f"[+] Reservation Confirmed! PNR: {booking_ref}")
            return True

    return False

def main():
    max_retries = 100
    attempt = 1
    
    while attempt <= max_retries:
        print(f"[*] Search attempt #{attempt}...")
        success = check_flight_availability()
        if success:
            print("[+] Booking process completed successfully.")
            break
        attempt += 1
        time.sleep(5)

if __name__ == "__main__":
    main()
```
