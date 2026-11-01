---
title: "Heap Memory"
date: 2020-05-22T04:27:54+00:00
url: "/dynamic-memory/"
draft: false
description: "Heap Memory, it starts from lower address and increases to higher address malloc malloc(size) allocate memory, return a pointer realloc(pointer, size) resize..."
categories: ["blog", "exploit-dev", "Linux"]
---

Heap Memory, it starts from lower address and increases to higher address

**malloc**

- malloc(size) allocate memory, return a pointer
- realloc(pointer, size) resize currently allocated memory for bigger or lower by relocating, return a pointer
- free() remove allocated memory
- calloc() like malloc but create a memory with zeros, better for security to prevent memory leaks!

**dlmalloc()**

intrudeced in GCC 2.3.x to improve speed in allocaiton it utilize malloc() realloc(), free(),
it have some utility like unlink() and frontlink()

mmap system call allocates memory
brk - sbrk change size of the allocated memory

allocation write the size of the block before it and 4 bytes

there are pointer points to the first byte in the heap
`chunk`

`-------------------------`

`|prev_size|size|user-data|`

`-------------------------`

`free chunk - doubly linked list`

`----------------------------------------------------------`

`|size|*forward|*backword|fd_nextsize|bk_nextsize|...|size|`

`----------------------------------------------------------`
the chunk gets padded with 8-byte to store the size of the chunk at the end of the chunk and the lowest 3-bit is zero, the trick the LSB 0-BIT is the previous chunk is in use indicator (prev_inuse),
if 1 mean the previous chunk is in use if 0 means the previous chunk is not in use

freed memory how to know the previous size of the chunk? if prev_inuse off
`--------------------------------------------------------- |prev_size|size|*fd|*bk|fd_nextsize|bk_nextsize|...|size| ---------------------------------------------------------`

free() uses PREV_INUSE (pointer -4 byte) to determine if this previous chunk free or in use if free then it calls unlink to coalesce the 2 chunks together then forntlink() reinsert the new chunk in new doubly linked list

**Bins**
when chunked is free it goes to lists aka Bins, smaller than < 512 kept in Small bins (8-bit) each, larger than > 512 Kept in larger bins

|Fast |echo chunk is 0x80-128, 0x20-32|Singly Linked|
larger than 128Kb handled by mmap

**mmap/sbrk/brk**

there is a break address between stack and heap brk/sbrk used to increase the heap size by pushing the break address also the chunks will be contiguous to the last chunk,\
mmap() used for heavy lifting by OS and the newly allocated chunk maybe uncontiguous, also mmap is thread friendly

**ptmalloc tcmalloc jemalloc**

ptmalloc() based on dlmalloc supports multithreading published in glibc 2.3.x

Tcmalloc Google version high performance checks for memory leaks

jemalloc BSD replaced phkmalloc, used by Firefox and Facebook
