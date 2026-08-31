---
description: Generate documentation (API docs, READMEs, guides)
agent: docs-writer
subtask: true
---
# Documentation Generation Command

Generate comprehensive documentation using the docs-writer subagent.

## Documentation Target

$ARGUMENTS

## Documentation Types

### API Documentation
- Function signatures, parameters, return types
- Example requests/responses
- Error codes and handling

### README
- Project description, installation, quick start
- Configuration, API reference

### Guides
- Step-by-step learning materials
- Prerequisites, working examples

## Quality Checks

1. **Accuracy**: Verify code examples
2. **Completeness**: All public APIs documented
3. **Consistency**: Terminology and formatting uniform
4. **Freshness**: No references to deprecated features

## Output Format

```
Documentation Generated
=======================
Type: [API / README / Guide]
Target: [file or feature]

[Generated documentation content]

Suggestions:
```
