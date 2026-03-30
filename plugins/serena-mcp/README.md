# Serena MCP Plugin

This repo-local plugin packages Serena as a local MCP server for Codex and adds a small skill that nudges repo inspection through Serena before shell fallbacks.

## Files

- `.codex-plugin/plugin.json`: plugin manifest and UI metadata
- `.mcp.json`: Serena MCP server definition
- `skills/serena-workspace-navigation/SKILL.md`: helper skill for code navigation tasks
- `.agents/plugins/marketplace.json`: repo-local marketplace entry for installation ordering

## Serena Command

The plugin uses the same Serena launch command already configured in `C:\Users\Vien Phuong Nam\.codex\config.toml`:

- `C:\Users\Vien Phuong Nam\AppData\Roaming\Python\Python314\Scripts\uvx.exe`
- `--from git+https://github.com/oraios/serena`
- `serena start-mcp-server --context codex --project-from-cwd --open-web-dashboard false`

## Notes

- This plugin is repo-local and lives under `plugins/serena-mcp`.
- The MCP server starts relative to the current working directory because it uses `--project-from-cwd`.
- If you want to publish this beyond the current workspace, review the manifest metadata and replace the generic local-workspace fields.
