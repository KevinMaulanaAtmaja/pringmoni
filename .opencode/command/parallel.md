---
description: Demonstrate parallel execution by launching multiple agents simultaneously
agent: build
---
# Parallel Execution Command

Launch multiple independent subagents in a single message for maximum efficiency.

## Core Principle

> ALL Task calls MUST be in a SINGLE assistant message for true parallelism.

## Your Mission

$ARGUMENTS

## Parallelization Patterns

### Pattern A: Multi-Perspective Review
- Security reviewer + Code quality reviewer + Test coverage reviewer

### Pattern B: Directory Parallelization
- Subagent 1: Analyze src/app/
- Subagent 2: Analyze src/lib/
- Subagent 3: Analyze prisma/

### Pattern C: Full Verification Suite
- Type Checker + Linter + Test Runner + Security Scanner

## Performance Impact

| Approach | 4 Tasks @ 30s each | Total Time |
|----------|-------------------|------------|
| Sequential | 30s + 30s + 30s + 30s | ~120s |
| Parallel | All 4 run simultaneously | ~30s |

## When NOT to Parallelize

- Tasks with dependencies
- Tasks modifying the same files
- Sequential workflows (commit -> push -> PR)
