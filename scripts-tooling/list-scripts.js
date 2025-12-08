import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const scriptsDir = resolve(__dirname, "../scripts");

console.log("📜 Available UserScripts:\n");

try {
  const scripts = readdirSync(scriptsDir).filter((name) => {
    const path = join(scriptsDir, name);
    return statSync(path).isDirectory();
  });

  if (scripts.length === 0) {
    console.log("   No scripts found. Create one with:");
    console.log("   pnpm run new:script <script-name>");
    process.exit(0);
  }

  scripts.forEach((scriptName, index) => {
    const packageJsonPath = join(scriptsDir, scriptName, "package.json");

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      const version = packageJson.version || "0.0.0";

      console.log(`${index + 1}. ${scriptName}`);
      console.log(`   Version: ${version}`);
      console.log(`   Path: scripts/${scriptName}`);
      console.log("");
    } catch (_error) {
      console.log(`${index + 1}. ${scriptName} (invalid package.json)`);
      console.log("");
    }
  });

  console.log("💡 Quick commands:");
  console.log("   pnpm run dev --filter=<script-name>    # Start development");
  console.log("   pnpm run build --filter=<script-name>  # Build production");
  console.log("   pnpm run bump <script-name> patch      # Bump version");
} catch (error) {
  console.error("❌ Error listing scripts:", error.message);
  process.exit(1);
}
