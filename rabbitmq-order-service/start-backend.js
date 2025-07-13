const { spawn } = require("child_process");
const path = require("path");

// Start the backend server
const backend = spawn("node", [path.join(__dirname, "src", "app-demo.js")], {
  stdio: "inherit",
  cwd: __dirname,
});

backend.on("error", (err) => {
  console.error("Failed to start backend:", err);
});

backend.on("close", (code) => {
  console.log(`Backend process exited with code ${code}`);
});

// Handle process termination
process.on("SIGINT", () => {
  backend.kill();
  process.exit();
});

process.on("SIGTERM", () => {
  backend.kill();
  process.exit();
});
