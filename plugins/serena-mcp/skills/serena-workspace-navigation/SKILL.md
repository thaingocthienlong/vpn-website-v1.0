---
name: serena-workspace-navigation
description: Use Serena MCP first for symbol search, file discovery, and code navigation before falling back to shell inspection. Trigger for repo exploration, symbol lookup, call-path tracing, and workspace mapping tasks.
---

# Serena Workspace Navigation

Use this skill when the task is primarily about understanding code that already exists.

## Workflow

1. Start with Serena MCP for symbol search, file discovery, and code navigation.
2. Prefer Serena findings over manual `rg` when both can answer the question cleanly.
3. Fall back to shell inspection only when Serena is unavailable, times out, or cannot express the query well.
4. If Serena is unavailable, say so briefly and continue with local inspection rather than blocking.

## Good Fits

- Find where a symbol, type, component, or helper is defined.
- Trace which files participate in a feature or route.
- Inspect call paths before making code changes.
- Build a quick map of a subsystem before debugging or refactoring.

## Examples

- "Use Serena to find all route handlers that call this service."
- "Map the files involved in authentication with Serena first."
- "Find the component that renders this section before we edit it."
