# Dev Notes MCP Server (Week 4)

## What it does
This MCP server allows Claude Code to save development notes, list saved notes, and read specific notes stored locally on the machine. The server provides simple note-management tools that demonstrate how MCP servers extend AI coding tools with custom capabilities through local file operations.

## Customizations
- Automatically adds the current date and time at the top of every saved note
- Automatically prefixes saved note filenames with "week4-" so they are clearly identified as Week 4 assignment notes

## Installation
1. Run npm install
2. Add the server using:
   claude mcp add --transport stdio dev-notes-server -- node /absolute/path/to/index.js

## Example Usage
- Save a note using save_note
- List notes using list_notes
- Read a note using read_note
