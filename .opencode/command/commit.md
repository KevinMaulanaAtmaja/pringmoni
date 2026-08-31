---
description: Create git commit with auto-generated conventional commit message
agent: build
---
# Git Commit Command

Create a well-structured git commit by analyzing staged changes and generating a conventional commit message.

## Phase 1: Gather Context

Run these commands in parallel:
1. `git status` - See all staged and unstaged changes
2. `git diff --cached` - View the actual staged changes
3. `git log --oneline -5` - Review recent commit style

## Phase 2: Analyze Changes

Determine change type (conventional commits):
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `docs`: Documentation only
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Phase 3: Generate Commit Message

Format: `type(scope): description`

Rules:
- Use imperative mood ("Add feature" not "Added feature")
- Keep first line under 72 characters
- Focus on the purpose and impact

## Phase 4: Execute Commit

1. Stage additional files if needed
2. Execute the commit
3. Run `git status` to verify success

## Safety Checks

- NEVER commit files with secrets (.env, credentials)
- WARN if committing lock files or large binaries
