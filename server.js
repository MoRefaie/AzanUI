const path = require("path");
const express = require("express");
const bonjour = require("bonjour")();
const fs = require("fs");

const app = express();
const port = process.env.PORT || 8080;

// Serve static files from the dist directory
const staticPath = path.join(__dirname, "dist");
app.use(express.static(staticPath));

// SPA fallback: always serve index.html for unknown routes
app.get("*", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

// Bonjour advertisement
bonjour.publish({ name: "AzanUI", type: "http", port: port, host: "Azan.local" });

// Logging
const logStream = fs.createWriteStream(path.join(process.cwd(), "server.log"), { flags: "a" });
// Redirect console.log and console.error to log file
console.log = function (...args) {
  logStream.write(`[LOG] ${new Date().toISOString()} ${args.join(" ")}\n`);
  process.stdout.write(args.join(" ") + "\n");
};
console.error = function (...args) {
  logStream.write(`[ERROR] ${new Date().toISOString()} ${args.join(" ")}\n`);
  process.stderr.write(args.join(" ") + "\n");
};

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://Azan.local:${PORT}`);
});