---
name: designing-apis
description: Guides REST and GraphQL API design, endpoint patterns, request/response schemas, and API best practices.
license: MIT
compatibility: opencode
metadata:
  category: design
  audience: developers
---

# Designing APIs

Principles and patterns for designing clean, consistent, and maintainable APIs.

## When to Use This Skill

- Designing new API endpoints
- Reviewing API contracts
- Planning API versioning strategies
- Defining request/response schemas

## REST API Design Principles

### Resource-Oriented Design

```
GOOD:
GET    /users           -> List users
GET    /users/123       -> Get user 123
POST   /users           -> Create user
PUT    /users/123       -> Update user 123
DELETE /users/123       -> Delete user 123

BAD:
POST   /getUsers
POST   /createUser
```

## Quick Reference

```
RESOURCE DESIGN:
  /resources           -> Collection
  /resources/{id}      -> Item
  /resources/{id}/sub  -> Nested

HTTP METHODS:
  GET -> Read (safe, idempotent)
  POST -> Create (not idempotent)
  PUT -> Replace (idempotent)
  PATCH -> Update (idempotent)
  DELETE -> Remove (idempotent)

STATUS CODES:
  200 OK, 201 Created, 204 No Content
  400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found
  500 Internal Server Error
```
