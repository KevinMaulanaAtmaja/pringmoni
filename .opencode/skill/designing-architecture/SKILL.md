---
name: designing-architecture
description: Guides software architecture decisions, design patterns, and system design principles.
license: MIT
compatibility: opencode
metadata:
  category: design
  audience: developers
---

# Designing Architecture

Principles and patterns for designing maintainable, scalable, and robust software systems.

## When to Use This Skill

- Designing new systems or features
- Choosing between architectural patterns
- Making technology decisions
- Reviewing system design

## Core Architecture Principles

### SOLID Principles

| Principle | Summary |
|-----------|---------|
| **S**ingle Responsibility | One reason to change |
| **O**pen/Closed | Open for extension, closed for modification |
| **L**iskov Substitution | Subtypes replaceable for base types |
| **I**nterface Segregation | Small, focused interfaces |
| **D**ependency Inversion | Depend on abstractions |

## Quick Reference

```
SOLID: Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion

PATTERNS:
  Layered     -> Simple, clear separation
  Hexagonal   -> Testable, adaptable
  Microservices -> Scalable, independent
  Event-Driven  -> Decoupled, async

DDD: Entity, Value Object, Aggregate, Repository, Domain Event
```
