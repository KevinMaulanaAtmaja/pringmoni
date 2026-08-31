---
description: Multi-phase verification of implementation with adversarial review
agent: build
---
# Verify Changes Command

Comprehensive verification using progressive quality gates.

## Philosophy

Run cheap checks first, expensive checks later. Stop on first failure.

## Verification Target

$ARGUMENTS

## Phase 1: Gather Context
1. `git diff HEAD~1` - Understand what changed
2. `git status` - See current state

## Phase 2: Fast Checks (Fail-Fast Gate)
1. **Lint**: `npm run lint`
2. **Type Check**: TypeScript check
3. **Build**: `npm run build`

## Phase 3: Deep Checks
1. **Tests**: `npm run test`
2. **Security**: Vulnerability scan

## Phase 4: Adversarial Review
- Logic Reviewer
- Consistency Checker
- Test Coverage Analyzer

## Output Format

```
Verification Report
===================
Fast Checks:
  [ ] Lint: [PASS/FAIL]
  [ ] Type Check: [PASS/FAIL]
  [ ] Build: [PASS/FAIL]

Deep Checks:
  [ ] Tests: [passed/failed]
  [ ] Security: [clean/issues]

Overall Status: [READY TO MERGE / NEEDS WORK]
```
