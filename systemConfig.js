const fs = require("fs");
const path = require("path");


// Scheduler config path (relative)
const schedulerConfigPath = path.join(process.cwd(), "config", "system.json");

// UI fallback config
const basePath = process.pkg ? path.dirname(process.execPath) : __dirname;
const fallbackConfigPath = path.join(basePath, "system.json");

function loadConfig() {
  // 1. Try scheduler config
  try {
    if (fs.existsSync(schedulerConfigPath)) {
      const raw = fs.readFileSync(schedulerConfigPath, "utf8");
      console.log("Loaded system.json from Config folder");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to load system.json from Config folder:", err);
  }

  // 2. Try fallback system.js
  try {
    console.log("Loaded fallback system.js from UI");
    const raw = fs.readFileSync(fallbackConfigPath, "utf8"); 
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load fallback system.js:", err);
  }

  // 3. Final fallback
  console.error("No config found. Using hardcoded defaults.");
  return {
    CONSOLE_LOGGING: "On",
    API_HOST: "0.0.0.0",
    API_PORT: 8000,
    UI_HOST: "Azan.local",
    UI_PORT: 8080,
    BONJOUR: "On"
  };
}

module.exports = loadConfig();
