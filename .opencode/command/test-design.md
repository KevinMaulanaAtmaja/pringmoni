---
description: Design test coverage strategy with test-architect guidance
agent: test-architect
subtask: true
---
# Test Design Command

Plan comprehensive test coverage strategy for new or existing code.

## Target

$ARGUMENTS

## Test Pyramid

```
         /\
        /  \  E2E Tests (Few)
       /----\
      /      \
     /--------\
    /          \ Integration Tests (Some)
   /            \
  /              \
 /----------------\
/    Unit Tests    \
/    (Many)         \
/--------------------\
```

## Test Case Template

```
Feature: [Feature Name]
Scenario: [Scenario Description]
  Given: [Initial State]
  When: [Action Taken]
  Then: [Expected Outcome]
```

## Output Format

```
Test Coverage Strategy
======================
Target: [Feature/Module]
Test Distribution: Unit/Integration/E2E counts

Detailed Test Cases:
Implementation Priority:
Estimated Coverage:
Mocking Requirements:
```
