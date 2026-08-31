---
name: parallel-execution
description: CRITICAL skill for executing multiple Task tool calls in a SINGLE message for true parallelism.
license: MIT
compatibility: opencode
metadata:
  category: workflow
  audience: agents
---

# Parallel Execution

**CRITICAL**: This skill teaches how to execute multiple tasks simultaneously.

## The Fundamental Rule

> **ALL Task calls MUST be in a SINGLE assistant message for true parallelism.**

If Task calls are in separate messages, they run SEQUENTIALLY.

## Parallelization Patterns

### Task-Based
One subagent per independent task.

### Directory-Based
One subagent per directory.

### Perspective-Based
One subagent per viewpoint.

### Adversarial
Multiple competing reviewers.

## Performance Impact

| # Parallel | Sequential | Parallel | Speedup |
|-----------|-----------|----------|---------|
| 2 | 60s | 30s | 2x |
| 3 | 90s | 30s | 3x |
| 5 | 150s | 30s | 5x |

## Quick Reference

```
RULE: ALL Task calls in SINGLE message = PARALLEL
CHECKLIST:
  Tasks independent? No shared files? No dependencies? All in ONE message?
```
