---
name: optimizing-performance
description: Guides performance optimization, profiling techniques, and bottleneck identification.
license: MIT
compatibility: opencode
metadata:
  category: quality
  audience: developers
---

# Optimizing Performance

Strategies for identifying, analyzing, and resolving performance bottlenecks.

## When to Use This Skill

- Application is running slowly
- High resource consumption
- Database queries are slow
- API response times are high
- Need to scale for more users

## Common Bottleneck Patterns

### N+1 Query Problem
Use eager loading or batch fetching.

### Unbounded Operations
Add pagination, limits, streaming.

### Synchronous Blocking
Use parallel execution with Promise.all().

## Quick Reference

```
PROFILING: Measure -> Identify -> Hypothesize -> Fix -> Measure
COMMON: N+1 queries, Unbounded data, Blocking I/O
DATABASE: Index frequently queried columns, use EXPLAIN
TARGETS: p50 < 100ms, p95 < 500ms, p99 < 1s
```
