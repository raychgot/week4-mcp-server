# Dev Notes MCP Server (Week 4)

## What it does
This MCP server allows Claude Code to save notes, list saved notes, and read specific notes stored locally.

## Customizations
- Automatically adds a timestamp to each saved note
- Automatically prefixes saved note filenames with "week4-"

## Installation
1. Run npm install
2. Add the server using:
   claude mcp add --transport stdio dev-notes-server -- node /absolute/path/to/index.js

## Example Usage
- Save a note using save_note
- List notes using list_notes
- Read a note using read_note
