---
title: "Linux Heap Memory Architecture: Chunks, Bins, and Allocators"
date: 2020-05-22T04:27:54+00:00
url: "/dynamic-memory/"
draft: false
description: "A deep dive into Linux dynamic memory management: malloc internals, ptmalloc chunk headers, free chunk structures, bins, and allocation syscalls (brk/sbrk vs mmap)."
categories: ["exploit-dev", "Linux", "Security"]
tags: ["heap", "glibc", "malloc", "ptmalloc", "memory-management", "reverse-engineering", "exploit-dev"]
---

Unlike stack memory which grows downward from high addresses and is automatically managed via function call frames, **Heap memory** grows upward from lower addresses and is managed explicitly at runtime via dynamic allocation.

Understanding heap layout and allocator metadata is fundamental to analyzing heap exploitation primitives (such as use-after-free, heap overflows, fastbin dupes, and unlink exploitation).

---

### Core Allocation Primitives

- **`malloc(size)`**: Requests `size` bytes from the heap and returns a generic pointer. The returned memory is uninitialized.
- **`calloc(num, size)`**: Allocates memory for an array and initializes all bytes to zero (mitigates information disclosure bugs).
- **`realloc(ptr, size)`**: Resizes an existing heap block, either expanding in-place or allocating a new region, copying existing data, and freeing the old chunk.
- **`free(ptr)`**: Releases the allocated chunk back to the heap manager.

---

### Kernel Interface: `brk`/`sbrk` vs. `mmap`

The userspace memory allocator (e.g., Glibc's `ptmalloc`) interacts with the Linux kernel using two primary system calls:

1. **`brk` / `sbrk`**:
   Adjusts the process "program break" pointer to expand or contract the contiguous heap segment. Used for smaller dynamic allocations.
2. **`mmap`**:
   Maps an anonymous private page directly into the process address space. Allocations exceeding `MMAP_THRESHOLD` (typically 128 KB) bypass the contiguous heap segment entirely and receive a dedicated `mmap` allocation.

---

### ptmalloc Chunk Internal Architecture

In Glibc's `ptmalloc` (derived from Doug Lea's `dlmalloc`), dynamic memory is organized into **chunks**.

#### 1. Allocated Chunk Layout
When memory is in active use by the application:

```text
+-----------------------+-----------------------+
|      prev_size        |         size | A | M | P
+-----------------------+-----------------------+
|                   User Data ...               |
|                                               |
+-----------------------------------------------+
```

- **`prev_size`**: If the immediately preceding contiguous chunk is free, this field holds its size (used during coalescing).
- **`size`**: Total chunk size (aligned to 8 bytes on 32-bit systems, 16 bytes on 64-bit systems).
- **Flag Bits (Lowest 3 bits of `size`)**:
  - `P` (`PREV_INUSE`, `0x1`): Set to `1` if the previous chunk is allocated; `0` if free.
  - `M` (`IS_MMAPPED`, `0x2`): Set if allocated via `mmap`.
  - `A` (`NON_MAIN_ARENA`, `0x4`): Set if chunk originates from a secondary thread arena.

#### 2. Free Chunk Layout
When a chunk is freed, its user data area is repurposed to link it into allocation lists (**bins**):

```text
+-----------------------+-----------------------+
|      prev_size        |         size | A | M | P
+-----------------------+-----------------------+
|        *fd (Forward Pointer)                  |
+-----------------------------------------------+
|        *bk (Backward Pointer)                 |
+-----------------------------------------------+
|        fd_nextsize / bk_nextsize (Large bins) |
+-----------------------------------------------+
|                   ...                         |
+-----------------------------------------------+
|      size (duplicate at footer)               |
+-----------------------------------------------+
```

- **`fd` / `bk`**: Doubly linked list pointers pointing to neighbor free chunks in the bin.

---

### Bins and Free Lists

When `free()` is called, chunks are placed into specialized bins categorized by size to optimize re-allocation speed:

1. **Fastbins**: Singly linked LIFO lists for small allocations (< 80 bytes). Chunks in fastbins do not have their `PREV_INUSE` bit cleared to avoid immediate coalescing overhead.
2. **Unsorted Bin**: Temporary transit queue where chunks first arrive upon being freed, facilitating fast reuse.
3. **Small Bins**: Fixed-size doubly linked lists (< 512 bytes on 32-bit, < 1024 bytes on 64-bit).
4. **Large Bins**: Variable-size doubly linked sorted lists for larger allocations.
5. **Tcache (Thread Local Caching)**: Per-thread singly linked lists introduced in modern Glibc to eliminate lock contention in multithreaded applications.

---

### Comparative Modern Allocators

- **ptmalloc3**: Default in standard Glibc. Uses thread arenas to minimize multi-threaded lock contention.
- **tcmalloc (Google)**: Thread-Caching Malloc designed for extreme high-concurrency workloads and built-in heap profiling.
- **jemalloc (FreeBSD / Meta)**: Focuses on predictable fragmentation avoidance; default in FreeBSD and used heavily by Firefox and Redis.
