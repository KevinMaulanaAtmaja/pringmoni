---
name: designing-tests
description: Guides test strategy, TDD/BDD approaches, test coverage planning, and testing best practices.
license: MIT
compatibility: opencode
metadata:
  category: quality
  audience: developers
---

# Designing Tests

Strategies and patterns for designing effective, maintainable test suites.

## When to Use This Skill

- Planning test coverage for new features
- Choosing between testing approaches (TDD, BDD)
- Designing integration or E2E tests
- Improving existing test suites

## The Testing Pyramid

```
Unit Tests (70-80%) -> Integration Tests (15-20%) -> E2E Tests (5-10%)
```

## TDD Cycle

```
RED (Write failing test) -> GREEN (Make it pass) -> REFACTOR (Clean up)
```

## Test Design Patterns

### Arrange-Act-Assert (AAA)
```typescript
test('should calculate total', () => {
  // Arrange
  const cart = new Cart();
  // Act
  const total = cart.calculateTotal();
  // Assert
  expect(total).toBe(100);
});
```

## Quick Reference

```
PYRAMID: Unit (70%) -> Integration (20%) -> E2E (10%)
TDD: Red -> Green -> Refactor
PATTERNS: AAA, Builder, Page Object
NAMING: test_[what]_[condition]_[expected]
```
