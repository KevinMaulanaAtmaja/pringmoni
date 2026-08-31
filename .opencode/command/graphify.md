---
description: Build/update the project knowledge graph with Graphify and use it to answer codebase questions
agent: orchestrator
---
# Graphify Command

Build or refresh the knowledge graph for this codebase, then use it to answer codebase questions without re-reading raw files.

## Step 1: Build / Update Graph

Run the appropriate command from the project root:

- **First time or full rebuild** (code-only, offline, no API key):
  ```
  graphify extract . --code-only
  graphify cluster-only .
  ```
- **Quick refresh after code changes** (AST-only, no API cost):
  ```
  graphify update .
  ```

If the graph needs semantic extraction of docs/PDFs but `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` is not set, stick with `--code-only`.

## Step 2: Answer Codebase Questions via Graph

When answering questions about how the code fits together, prefer the graph over grepping:

- `graphify query "<question>"` - scoped subgraph for a plain-language question
- `graphify path "<A>" "<B>"` - shortest path / relationship between two things
- `graphify explain "<concept>"` - focused explanation of one node and its neighbors
- `graphify-out/GRAPH_REPORT.md` - broad architecture overview (god nodes, communities)

## Step 3: Keep It Fresh

- After modifying code, run `graphify update .` (no API cost).
- Git hooks (post-commit / post-checkout) rebuild the graph automatically.
- After `git pull` / `git merge`, run `graphify update .`.
