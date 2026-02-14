const path = require("path");
const express = require("express");
const fs = require("fs");

// ---------------------------------------------------------
// 1. LOGGING OVERRIDE (must be FIRST so all logs are captured)
// ---------------------------------------------------------

const logFolder = path.join(process.cwd(), "logs");
const logFile = path.join(logFolder, "web.log");

// Ensure logs folder exists
if (!fs.existsSync(logFolder)) {
  fs.mkdirSync(logFolder, { recursive: true });
}

// Rotate log file if it exists and is >= 1MB
if (fs.existsSync(logFile)) {
  const stats = fs.statSync(logFile);
  if (stats.size >= 1 * 1024 * 1024) { // 1MB
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:.]/g, "")
      .replace("T", "_")
      .slice(0, 15);
    const rotatedLogFile = path.join(logFolder, `web_${timestamp}.log`);
    fs.renameSync(logFile, rotatedLogFile);
  }
}

const logStream = fs.createWriteStream(logFile, { flags: "a" });

console.log = function (...args) {
  logStream.write(`[LOG] ${new Date().toISOString()} ${args.join(" ")}\n`);
  process.stdout.write(args.join(" ") + "\n");
};

console.error = function (...args) {
  logStream.write(`[ERROR] ${new Date().toISOString()} ${args.join(" ")}\n`);
  process.stderr.write(args.join(" ") + "\n");
};

// ---------------------------------------------------------
// 2. LOAD CONFIG (after logging override so errors go to web.log)
// ---------------------------------------------------------

const config = require("./systemConfig");

// Extract config values
const UI_PORT = parseInt(config.UI_PORT, 10) || 8080;
const ENABLE_BONJOUR = config.BONJOUR === "On";

// Scheduler URL (if you need it later)
const SCHEDULER_URL = `http://${config.API_HOST}:${config.API_PORT}`;

// ---------------------------------------------------------
// 3. EXPRESS SETUP
// ---------------------------------------------------------

const app = express();

// Serve static files from the dist directory
const staticPath = path.join(__dirname, "dist");
app.use(express.static(staticPath));

// SPA fallback
app.get("/", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

// ---------------------------------------------------------
// 4. BONJOUR (after config + logging)
// ---------------------------------------------------------

if (ENABLE_BONJOUR) {
  try {
    const bonjour = require("bonjour")();
    bonjour.publish({
      name: "AzanUI",
      type: "http",
      port: UI_PORT,
      host: config.UI_HOST || "Azan.local"
    });
    console.log("Bonjour service published as Azan.local");
  } catch (err) {
    console.error("Bonjour failed:", err);
  }
}

// ---------------------------------------------------------
// 5. START SERVER
// ---------------------------------------------------------

app.listen(UI_PORT, "0.0.0.0", () => {
  console.log(`Server running at http://${config.UI_HOST}:${UI_PORT}`);
});
