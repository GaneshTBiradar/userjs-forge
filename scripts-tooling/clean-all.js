import { existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const scriptsDir = resolve(__dirname, "../scripts");

console.log("🧹 Cleaning all UserScripts...\n");

try {
  const scripts = readdirSync(scriptsDir).filter((name) => {
    const path = join(scriptsDir, name);
    return statSync(path).isDirectory();
  });

  let cleanedCount = 0;

  scripts.forEach((scriptName) => {
    const distPath = join(scriptsDir, scriptName, "dist");

    if (existsSync(distPath)) {
      console.log(`🗑️  Cleaning ${scriptName}/dist`);
      rmSync(distPath, { recursive: true, force: true });
      cleanedCount++;
    }
  });

  console.log("");
  if (cleanedCount === 0) {
    console.log("✨ Nothing to clean (all scripts are already clean)");
  } else {
    console.log(`✅ Cleaned ${cleanedCount} script(s)`);
  }
} catch (error) {
  console.error("❌ Clean error:", error.message);
  process.exit(1);
}
