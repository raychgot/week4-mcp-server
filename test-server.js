import { spawn } from "child_process";
import path from "path";

// Start the server as a child process
const server = spawn("node", ["index.js"], {
  cwd: path.dirname(new URL(import.meta.url).pathname),
  stdio: ["pipe", "pipe", "pipe"],
});

let messageId = 0;
const requests = [];

// Helper to send a JSON-RPC request
function sendRequest(method, params) {
  const id = ++messageId;
  const request = {
    jsonrpc: "2.0",
    id,
    method,
    params,
  };

  requests.push(request);
  console.log(`\n📤 Sending: ${method}`);
  console.log(JSON.stringify(request, null, 2));
  server.stdin.write(JSON.stringify(request) + "\n");
}

// Handle server responses
let buffer = "";
server.stdout.on("data", (data) => {
  buffer += data.toString();

  // Try to parse complete JSON objects
  while (buffer.includes("\n")) {
    const newlineIndex = buffer.indexOf("\n");
    const line = buffer.substring(0, newlineIndex).trim();
    buffer = buffer.substring(newlineIndex + 1);

    if (line) {
      try {
        const response = JSON.parse(line);
        console.log(`\n📥 Response (ID: ${response.id}):`);
        console.log(JSON.stringify(response, null, 2));
      } catch (e) {
        console.log(`\n⚠️  Could not parse: ${line}`);
      }
    }
  }
});

// Handle server errors
server.stderr.on("data", (data) => {
  console.log(`\n🔴 Server: ${data.toString()}`);
});

// Give server time to start, then send test requests
setTimeout(() => {
  console.log("🚀 Starting tests...\n");

  // Test 1: Save a note
  sendRequest("tools/call", {
    name: "save_note",
    arguments: {
      title: "Test Note",
      content: "# My Test Note\n\nThis is a test note created by the test script.",
    },
  });

  // Test 2: Save another note
  setTimeout(() => {
    sendRequest("tools/call", {
      name: "save_note",
      arguments: {
        title: "API Design Ideas",
        content: "## REST vs GraphQL\n\nBoth have trade-offs...",
      },
    });
  }, 500);

  // Test 3: List notes
  setTimeout(() => {
    sendRequest("tools/call", {
      name: "list_notes",
      arguments: {},
    });
  }, 1000);

  // Test 4: Read a note
  setTimeout(() => {
    sendRequest("tools/call", {
      name: "read_note",
      arguments: {
        title: "Test Note",
      },
    });
  }, 1500);

  // Test 5: Try to read non-existent note
  setTimeout(() => {
    sendRequest("tools/call", {
      name: "read_note",
      arguments: {
        title: "Does Not Exist",
      },
    });
  }, 2000);

  // Test 6: Try invalid tool
  setTimeout(() => {
    sendRequest("tools/call", {
      name: "invalid_tool",
      arguments: {},
    });
  }, 2500);

  // Stop server after tests
  setTimeout(() => {
    console.log("\n\n✅ Tests completed!");
    server.kill();
    process.exit(0);
  }, 3000);
}, 1000);
