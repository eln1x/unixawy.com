---
title: "Django Architecture Cheat Sheet: ORM, Signals, Sessions, and Auth"
date: 2014-12-04T18:47:46+00:00
url: "/django-notes/"
draft: false
description: "A practical developer reference guide for Django: complex ORM querysets, raw SQL execution, signal dispatching, session management, and custom authentication backends."
categories: ["blog", "Python", "Web"]
---

A quick-reference architectural guide covering essential patterns in Django web applications: querysets, signals, raw database queries, session handling, and authentication.

---

## 1. Django ORM Query Patterns

```python
# Query basic datasets
Article.objects.all()
Article.objects.all().count()
Article.objects.filter(is_published=True).exists()

# Slicing (LIMIT and OFFSET)
Article.objects.filter(is_published=True)[:5]

# Specific field projections
Article.objects.filter(is_published=True).values('title', 'created_at')[:5]

# Ordering
Article.objects.filter(is_published=True).order_by('-created_at')

# Field lookups and date filtering
from datetime import datetime
Article.objects.filter(created_at__gte=datetime(2025, 1, 1))
Article.objects.filter(created_at__year=2025).order_by('id')

# Inspect underlying compiled SQL
query = Article.objects.filter(is_published=True)
print(str(query.query))
```

---

## 2. Raw SQL and Database Connections

When complex reporting queries or performance bottlenecks require bypassing the ORM:

### Raw QuerySet Mapping

```python
for article in Article.objects.raw("SELECT id, title FROM myapp_article WHERE is_published = %s", [True]):
    print(article.id, article.title)
```

### Direct Database Cursor Execution

```python
from django.db import connection

def fetch_custom_report():
    with connection.cursor() as cursor:
        cursor.execute("SELECT category, COUNT(*) FROM myapp_article GROUP BY category")
        rows = cursor.fetchall()
    return rows
```

---

## 3. Signal Handlers and Dispatchers

Signals allow decoupled components to react to events across models and HTTP requests.

### Built-in Model Signals (`post_save`)

In `signals.py`:

```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from myapp.models import Article

@receiver(post_save, sender=Article)
def notify_subscribers_on_publish(sender, instance, created, **kwargs):
    if created and instance.is_published:
        print(f"[+] New article published: {instance.title}")
```

Register the signals module in your app's `apps.py`:

```python
from django.apps import AppConfig

class MyAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'myapp'

    def ready(self):
        import myapp.signals
```

### Custom Application Signals

```python
from django.dispatch import Signal

# Define a custom signal
payment_verified = Signal()

# Dispatch the signal in a view or service
payment_verified.send(sender=Order, order_id=1042, amount=99.00)

# Connect a listener handler
@receiver(payment_verified)
def handle_payment_completed(sender, **kwargs):
    print(f"Receipt issued for order {kwargs.get('order_id')}")
```

---

## 4. Session Management

Manage user session state across HTTP transactions:

```python
def user_dashboard(request):
    # Set session variable
    request.session['has_visited_dashboard'] = True
    
    # Retrieve session variable with fallback
    theme_preference = request.session.get('theme', 'dark')
    
    # Check session existence
    if 'auth_token' in request.session:
        # Perform authenticated tasks
        pass
```

---

## 5. Custom Authentication Backend

Extend Django's standard authentication mechanisms to support email-based authentication, LDAP, or corporate single sign-on (SSO):

```python
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

UserModel = get_user_model()

class EmailAuthBackend(ModelBackend):
    """
    Authenticate users using an email address instead of a username.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        email = kwargs.get('email', username)
        if email is None:
            return None
        try:
            user = UserModel.objects.get(email=email)
        except UserModel.DoesNotExist:
            # Run default password hasher to mitigate timing attacks
            UserModel().set_password(password)
            return None
        
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
```

Register the backend in `settings.py`:

```python
AUTHENTICATION_BACKENDS = [
    'myapp.backends.EmailAuthBackend',
    'django.contrib.auth.backends.ModelBackend',
]
```
