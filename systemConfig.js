const fs = require("fs");
const path = require("path");

// 1. External config (same as your scheduler)
const externalConfigPath = path.join(process.cwd(), "config", "system.json");

// 2. Embedded config (inside pkg virtual filesystem)
const embeddedConfigPath = path.join(__dirname, "system.json");

function loadConfig() {
  // Try external config first
  if (fs.existsSync(externalConfigPath)) {
    try {
      console.log("Loaded system.json from Config folder");
      return JSON.parse(fs.readFileSync(externalConfigPath, "utf8"));
    } catch (err) {
      console.error("Failed to load external system.json:", err);
    }
  } else {
    console.warn("No external system.json found in Config folder");
  }

  // Try embedded config (pkg asset)
  try {
    console.log("Loaded embedded system.json from pkg assets");
    return JSON.parse(fs.readFileSync(embeddedConfigPath, "utf8"));
  } catch (err) {
    console.error("Failed to load embedded system.json:", err);
  }

  // Final fallback
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
