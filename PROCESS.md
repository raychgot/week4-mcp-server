# PROCESS

## What I Built
For this assignment, I built a customized MCP notes server based on the tutorial example. The server exposes three tools: save_note, list_notes, and read_note. These tools allow Claude Code to store notes locally on my machine, retrieve a list of saved notes, and read the contents of a specific note. I modified the original design by adding two customizations: automatically inserting a timestamp at the top of each saved note and automatically prefixing filenames with “week4-”. These changes improved organization and demonstrated my ability to extend the base functionality beyond the tutorial.

## How Claude Code Helped
Claude Code helped me refine tool logic and test functionality. For example, I prompted it to “Modify the save_note tool so that the current date and time are automatically added at the top of the note content.” I also asked it to adjust the filename structure to automatically prefix notes. Additionally, I used structured prompts like “Use the save_note tool…” to verify that each tool was functioning correctly.

## Debugging Journey
During testing, I encountered issues where my customizations did not appear to work. I realized the MCP server needed to be restarted for code changes to take effect. After restarting Claude Code, the updated functionality worked correctly. I also verified saved files directly in the notes folder to confirm behavior.

## How MCP Works
MCP (Model Context Protocol) allows AI systems like Claude to connect to local tools through a server running on my machine. The server exposes tools, and Claude communicates with it via stdio to execute file operations securely.

## What I’d Do Differently
If I were to redo this project, I would plan my customizations earlier and test incrementally after each change to avoid confusion when troubleshooting.
