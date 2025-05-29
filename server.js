const path = require("path");
const express = require("express");
const bonjour = require("bonjour")();
const fs = require("fs");

const app = express();
const port = process.env.PORT || 8080;

// Serve static files from the dist directory inside the pkg snapshot
const staticPath = path.join(__dirname, "dist");
app.use(express.static(staticPath));

// SPA fallback: always serve index.html for unknown routes
app.get("/", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

// Bonjour advertisement
bonjour.publish({ name: "AzanUI", type: "http", port: port, host: "Azan.local" });

// Logging
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
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "").replace("T", "_").slice(0, 15);
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

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://Azan.local:${port}`);
});