---
title: "Automating Social Media Post Reactions and Page Invites with JavaScript"
date: 2016-07-21T12:46:33+00:00
url: "/facebook-mass-invite-like-script/"
draft: false
description: "A lightweight client-side JavaScript snippet to automate inviting post engagers to follow brand pages via the browser developer console."
categories: ["blog", "tech", "Web"]
image: "/uploads/2016/07/Screen-Shot-2016-07-21-at-1.30.18-PM.png"
---

When marketing campaigns or organic posts achieve high engagement, many users interact with the content (likes, reactions) without following or liking the parent page.

Facebook provides a manual interface to invite users who reacted to a post to like the page. However, manually clicking hundreds of individual invite buttons is tedious.

![Opening post reactions modal](/uploads/2016/07/Screen-Shot-2016-07-21-at-1.30.18-PM.png)
*Figure 1: Modal window listing users who reacted to the post.*

---

## Browser Console Automation Script

By executing a lightweight script in the browser's Developer Tools Console, we can automate scrolling through pagination (`See More`) and dispatching invite clicks with controlled delays to respect client-side rate limits.

### Instructions

1. Open Facebook and click on the reactions count of your post to open the modal dialog.
2. Press `F12` (or `Ctrl + Shift + I` / `Cmd + Option + I`) to open Developer Tools and navigate to the **Console** tab.
3. Paste and run the following script:

```javascript
/**
 * Automated Post Engager Inviter
 * Author: Ahmad Mahfouz (_N1X_)
 */

function scrollAndInvite() {
    let inviteButtons = [];
    let seeMoreButtons = [];

    // Identify clickable buttons inside the active dialog
    const elements = document.querySelectorAll('div[role="dialog"] a, div[role="dialog"] div[role="button"]');

    elements.forEach(el => {
        const text = el.innerText.trim();
        if (text === 'Invite' || text === 'دعوة') {
            inviteButtons.push(el);
        } else if (text === 'See More' || text === 'عرض المزيد') {
            seeMoreButtons.push(el);
        }
    });

    // Expand pagination if available
    if (seeMoreButtons.length > 0) {
        console.log('[*] Expanding reaction list...');
        seeMoreButtons.forEach(btn => btn.click());
    }

    // Dispatch invites with randomized delay to avoid rate limiting
    let index = 0;
    function dispatchInvite() {
        if (index < inviteButtons.length) {
            inviteButtons[index].click();
            console.log(`[+] Sent invite ${index + 1} of ${inviteButtons.length}`);
            index++;
            setTimeout(dispatchInvite, 800 + Math.random() * 500);
        } else {
            console.log('[*] Batch complete. Checking for additional engagers...');
            setTimeout(scrollAndInvite, 2000);
        }
    }

    if (inviteButtons.length > 0) {
        dispatchInvite();
    } else {
        console.log('[+] All visible engagers have been invited.');
    }
}

// Start automation
scrollAndInvite();
```

---

## Execution Results

The script will iteratively expand the list of reaction profiles and trigger invite requests in sequence:

![Invited followers confirmation](/uploads/2016/07/Screen-Shot-2016-07-21-at-1.23.20-PM.png)
*Figure 2: Successfully dispatching batch invitations directly within the browser.*

> [!TIP]
> Include a delay of 800–1500 milliseconds between clicks to prevent automated spam detection mechanisms from temporarily throttling your profile actions.
