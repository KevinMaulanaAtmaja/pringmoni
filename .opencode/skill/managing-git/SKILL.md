---
name: managing-git
description: Guides git workflows, branching strategies, commit conventions, and version control best practices.
license: MIT
compatibility: opencode
metadata:
  category: workflow
  audience: developers
---

# Managing Git

Best practices for version control, branching strategies, and collaborative development.

## When to Use This Skill

- Setting up branching strategies
- Writing commit messages
- Handling merges and conflicts
- Managing releases

## Commit Message Conventions

### Conventional Commits

```
<type>(<scope>): <subject>
```

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(auth): add OAuth2 login` |
| `fix` | Bug fix | `fix(api): handle null response` |
| `docs` | Documentation | `docs(readme): update setup` |
| `refactor` | Code restructuring | `refactor(db): simplify query` |
| `test` | Adding tests | `test(user): add registration tests` |
| `chore` | Maintenance | `chore(deps): update lodash` |

## Quick Reference

```
BRANCHES:
  main -> Production
  develop -> Integration
  feature/* -> New work
  fix/* -> Bug fixes

COMMITS:
  feat(scope): add feature
  fix(scope): fix bug
  docs(scope): update docs
  refactor(scope): restructure code

VERSIONING: MAJOR.MINOR.PATCH
```
