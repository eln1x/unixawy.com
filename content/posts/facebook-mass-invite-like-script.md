---
title: "Facebook Mass Invite to Like  script"
date: 2016-07-21T12:46:33+00:00
url: "/facebook-mass-invite-like-script/"
draft: false
description: "today I wrote a script to help in sending an invitation to like your page this happens when you promote a post for your audience and they interact with your..."
categories: ["blog", "tech", "Web"]
image: "/uploads/2016/07/Screen-Shot-2016-07-21-at-1.30.18-PM.png"
---

today I wrote  a script to help in sending an invitation to like your page

this happens when you promote a post for your audience and they interact with your post but they forget to like your page

so this script will help you to mass invite them in once

![Screen Shot 2016-07-21 at 1.30.18 PM](/uploads/2016/07/Screen-Shot-2016-07-21-at-1.30.18-PM.png)

1 - click on the likes for the post

2- open your browser console

paste this code

```javascript
function submitMore(){
	var seemore = document.getElementsByTagName('a');
	var z = 0;
	for (var i = 0 ;i < seemore.length;i++){
		if (seemore[i].innerHTML == 'See More'){
			seemore[i].click();
		}
	}
}

function  CountSeeMore(){
	var seemore = document.getElementsByTagName('a');
	var z = 0;
	for (var i = 0 ;i < seemore.length;i++){
		if (seemore[i].innerHTML == 'See More'){
			z  +=1;
		}
	}
	return z;
}

function timeout() {
    setTimeout(function () {
    	var count = CountSeeMore();
    	if( count != 0 ) {
    		submitMore();
    		console.log("scraping..");
		var links = document.getElementsByTagName('a');
		for (var i = 0 ; i < links.length ; i++){
			if(links[i].innerHTML == "Invite"){
				links[i].click()
				console.log("invitations sent")
			}
		}
    	}
        timeout();
    }, 1000);
}

mass_invite = timeout()
```

 

hit enter

and result should be like this

![Screen Shot 2016-07-21 at 1.23.20 PM](/uploads/2016/07/Screen-Shot-2016-07-21-at-1.23.20-PM.png)

as you can see I sent around 200 invitation in once :D

enjoy
