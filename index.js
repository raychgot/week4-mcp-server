import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import os from "os";

// Expand home directory path
const DEV_NOTES_DIR = path.join(os.homedir(), "dev-notes/");

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Converts a title into a slugified filename
 * Example: "Project Ideas" → "project-ideas"
 */
function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove multiple hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Ensures the dev-notes directory exists, creates it if needed
 */
function ensureNotesDirectory() {
  if (!fs.existsSync(DEV_NOTES_DIR)) {
    fs.mkdirSync(DEV_NOTES_DIR, { recursive: true });
  }
}

/**
 * Gets the full path to a note file based on its title
 */
function getNoteFilePath(title) {
  const filename = "week4-" + slugify(title) + ".md";
  return path.join(DEV_NOTES_DIR, filename);
}

// ============================================================================
// MCP SERVER SETUP
// ============================================================================

// Create the MCP server instance
const server = new Server(
  {
    name: "dev-notes-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ============================================================================
// TOOL DEFINITIONS & HANDLERS
// ============================================================================

/**
 * Handle tool listing
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "save_note",
        description: "Save a development note",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The title of the note (will be slugified to create filename)",
            },
            content: {
              type: "string",
              description: "The markdown content of the note",
            },
          },
          required: ["title", "content"],
        },
      },
      {
        name: "list_notes",
        description: "List all saved notes with their metadata",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "read_note",
        description: "Read the content of a specific note",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The title of the note to read",
            },
          },
          required: ["title"],
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const args = request.params.arguments;

  // ========================================================================
  // Handler: save_note
  // ========================================================================
  if (toolName === "save_note") {
    const { title, content } = args;

    if (!title || !content) {
      return {
        content: [
          {
            type: "text",
            text: "Error: Both title and content are required",
          },
        ],
        isError: true,
      };
    }

    try {
      // Ensure directory exists
      ensureNotesDirectory();

      // Add timestamp at the top of the content
      const timestamp = new Date().toLocaleString();
      const contentWithTimestamp = `*Created/Updated: ${timestamp}*\n\n${content}`;

      // Get file path and save the note
      const filePath = getNoteFilePath(title);
      fs.writeFileSync(filePath, contentWithTimestamp, "utf-8");

      return {
        content: [
          {
            type: "text",
            text: `Note saved successfully: week4-${slugify(title)}.md`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error saving note: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  // ========================================================================
  // Handler: list_notes
  // ========================================================================
  if (toolName === "list_notes") {
    try {
      ensureNotesDirectory();

      // Read all files in the directory
      const files = fs.readdirSync(DEV_NOTES_DIR);
      const markdownFiles = files.filter((file) => file.endsWith(".md"));

      if (markdownFiles.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No notes found in ~/dev-notes/",
            },
          ],
        };
      }

      // Get metadata for each file
      const notesList = markdownFiles
        .map((file) => {
          const filePath = path.join(DEV_NOTES_DIR, file);
          const stats = fs.statSync(filePath);
          const title = file.replace(/\.md$/, "");

          return {
            filename: file,
            title: title,
            lastModified: stats.mtime.toISOString(),
            size: stats.size,
          };
        })
        .sort((a, b) => b.lastModified.localeCompare(a.lastModified)); // Sort by date, newest first

      // Format the response
      const listText = notesList
        .map(
          (note) =>
            `- **${note.title}** (${note.filename})\n  Last modified: ${new Date(note.lastModified).toLocaleString()}`
        )
        .join("\n");

      return {
        content: [
          {
            type: "text",
            text: `Found ${notesList.length} note(s):\n\n${listText}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error listing notes: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  // ========================================================================
  // Handler: read_note
  // ========================================================================
  if (toolName === "read_note") {
    const { title } = args;

    if (!title) {
      return {
        content: [
          {
            type: "text",
            text: "Error: Title is required",
          },
        ],
        isError: true,
      };
    }

    try {
      const filePath = getNoteFilePath(title);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return {
          content: [
            {
              type: "text",
              text: `Note not found: week4-${slugify(title)}.md`,
            },
          ],
          isError: true,
        };
      }

      // Read and return the file content
      const content = fs.readFileSync(filePath, "utf-8");

      return {
        content: [
          {
            type: "text",
            text: `# ${title}\n\n${content}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error reading note: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  // If we get here, unknown tool was called
  return {
    content: [
      {
        type: "text",
        text: `Unknown tool: ${toolName}`,
      },
    ],
    isError: true,
  };
});

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================
/**
 * Initializes the server with stdio transport
 * This allows Claude Code to communicate with the server via standard input/output
 */
async function main() {
  // Create transport for stdio communication
  const transport = new StdioServerTransport();

  // Connect the server to the transport
  await server.connect(transport);

  // Log startup message to stderr (so it doesn't interfere with stdio protocol)
  console.error("Dev Notes MCP Server started and listening for requests...");
}

// Start the server
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
