---
title: "password policy with pam_cracklib"
date: 2015-08-03T18:33:37+00:00
url: "/password-policy-with-pam_cracklib/"
draft: false
description: "cracklib pam module is a method to check the password against dictionary list and gives you availability to check the strength of the password and set rules to..."
categories: ["blog", "Linux", "Security", "tech"]
---

cracklib pam module is a method to check the password against dictionary list and gives you availability to check the strength of the password and set rules to identify the poor passwords

 

here is the most important parameters for this module

1. minlen minimal password length
2. dcredit maximum number of digits
3. ucredit maximum uppercase letters
4. lcredit maximum lower case letters
5. ocredit maximum other letters not similar to the old one
6. maxrepeat limit repeated letters
7. reject_username check if the username inside the password to avoid this week accounts bob/bob or bob/bob123
8. enforce_for_root this is the most important one, why? , because if you didn't apply it users will just notice the warning and whatever password will be applied with the parameter will force the user to use our policy ;)
9. dicpath set crack lib dictionary to specific passwords database base I recommend (rockyyou) database coz it contains many leaked passwords and used by many attackers to brute-force the system example dicpath=/var/wordlist/rockyyou.txt

 

time to deploy our password policy

we want to apply this for new password also we can force the users to update their passwords once they do log in via this command

```bash
for user in $(grep "/bin/bash" /etc/passwd|cut -d ":" -f1);do chage -d 0  $user;done
```

this command has a high impact  it will find all users with a bash shell and  force them to update the password even the root  u can exclude the root by piping the output from grep and use grep -v root

example result

```
ssh n1x@cbox
n1x@cbox's password:
You are required to change your password immediately (root enforced)
Last login: Mon Aug  3 19:55:51 2015 from 192.168.72.1
WARNING: Your password has expired.
You must change your password now and login again!
Changing password for user n1x.
Changing password for n1x.
(current) UNIX password:
New password:
Retype new password:
passwd: all authentication tokens updated successfully.
Connection to cbox closed.
```

we will use the passwd module inside /etc/pam.d/passwd

to add our new policy

```
#%PAM-1.0
auth       include      system-auth
account    include      system-auth
password   substack     system-auth
-password   optional    pam_gnome_keyring.so
pssword  required pam_cracklib.so dcredit=1 ucredit=1 ocredit=1 lcredit=1 minlen=8 enforce_for_root
```

 

here is the output of different failed password change

BAD PASSWORD: is too similar to the old one
BAD PASSWORD: it is based on a dictionary word
BAD PASSWORD: it is based on a (reversed) dictionary word
BAD PASSWORD: it is too short
