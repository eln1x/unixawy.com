---
title: "Django Notes"
date: 2014-12-04T18:47:46+00:00
url: "/django-notes/"
draft: false
description: "ORM Notes Print query Custom Query Raw deep SQL Signals model saved signal Custom Signal Sessions add it to installed apps and middleware apps set session flat..."
categories: ["blog", "Python"]
---

ORM Notes

```
objects.all()
objects.all().count()
objects.filter(published=True).count()
objects.filter(published=True).exists()
objects.filter(published=True)[:2]
objects.filter(published=True).values('title','created')[:2]
objects.filter(published=True).order_by('created')
objects.filter(published=True).order_by('-created')

objects.filter(published=True, created__gt=datetime(2011,05,01))
objects.filter(published=True, created__lt=datetime(2011,05,01))
objects.filter(published=True, created__lt=datetime(2011,05,01)).count()
objects.filter(published=True, created__lt=datetime(2011,05,01)).order_by('id')
objects.filter(published=True, created__year=2011.order_by('id')
objects.filter(published=True, created__month=5, created__year=2011.order_by('id')
```

Print query

```
str(objects.filter(published=True, created__year=2011.order_by('id').query()))
```

Custom Query

```
objects.extra(select={'now':NOW()}).values('now')
objects.exta(select={'count':'SELECT COUNT(*) FROM table_name }).values('count')

objects.extra(where=['id=%s']),params=['3'])
Note = params prevent from sql injections 
```

Raw

```
objects.raw('SELECT * from table_name')[0].id
```

deep SQL

```
from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT * FROM tablename)
print cursor.fetchone()
print cursor.fetchall()
```

Signals

```bash
1 = post_save
2 = request_finshed
finshed single """
handlers.py
def request_finshed(sender,**kwargs):
  print "finshed",kwargs

{
form app import handelrs  #import the handlers file
models.py
from django.core.signals import request_finshed
request_finshed.connect(handlers,request_finshed)  ## connect to handler
}
```

model saved signal

```
handlers.py

def model_saved(sender,**kwargs):
  print "Saved", kwargs

models.py
from django.core.signals import post_save

post_save.connect(handler,model_saved , sender=Model)
```

 

Custom Signal

 

```
signals.py
from django.dispatcher import signal

signal_name = signal(providing_args['argname'])

import custom signal in the views.py

from appname import signals

signals.signalname.send(sender=ContactForm ,email=email)

import it in the model

from appname.signal import signalname

signalname.connect(handlers,signalname)
```

Sessions

add it to installed apps and middleware apps

set session

```
requst.session['session_vairable_name'] = True

check_session_exisit = request.session.get('session_vairable_name',False)
```

 

flat pages

 

```
settings.py  make sure it installed app and middle ware
then syncdb :) 
add pages from admin panel

create template inside templates/flatpages/default.html

{{ block content }}
  {{ flatpage.content }}
{{ endblock }}

by default u get free route 

setup custom route for flatpages with name to reuse it in the template

url(r'^about/$' ,'django.contrib.flatpages.views.flatpage' , kwargs('url': '/about/') , name="about_page")
```

in admin panel set the template path in advanced options

User Authentication
settings file

get sure of
installed app

auth
session
middleware
context processor

```
LOGIN_REDIRECT_URL = '/profile/'
LOGIN_URL = '/login/'
```

URLs for login

```
from django.contrib.auth.views import login,logout

url(r'profile/$','profile', name='homepage_profile')

url(r'login/$', login ,kwargs {'template_name': 'homepage/login.html', name='homepage_login'})
url(r'login/$', logout ', kwargs {'next_page': '/'}, name='homepage_login'})
```

protect action in views

```bash
from django.contrib.auth.decorates import login_required

@login_required

*template

{{ user }} # prints username

{ % if user.is_authenticated % }
```

 

UserProfile

create app called accounts

```
create app called accounts
  creat init file inside the app with auth module
  creat backends.py 
  from django.contrib.auth.backends import ModelBackend
  creat class inherit from modelbackend
  
  class MyModelBackend(ModelBackend)
      def authinticate(self,username None ,password None,)
```
