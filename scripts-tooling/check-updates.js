import { execSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const scriptsDir = resolve(__dirname, "../scripts");

console.log("🔍 Checking for dependency updates...\n");

try {
  const scripts = readdirSync(scriptsDir).filter((name) => {
    const path = join(scriptsDir, name);
    return statSync(path).isDirectory();
  });

  scripts.forEach((scriptName) => {
    console.log(`📦 ${scriptName}`);

    try {
      const output = execSync("pnpm outdated --format json", {
        cwd: join(scriptsDir, scriptName),
        encoding: "utf-8",
      });

      if (output.trim()) {
        const outdated = JSON.parse(output);
        const packages = Object.keys(outdated);

        if (packages.length > 0) {
          packages.forEach((pkg) => {
            const info = outdated[pkg];
            console.log(`   📦 ${pkg}: ${info.current} → ${info.latest}`);
          });
        } else {
          console.log("   ✅ All dependencies up to date");
        }
      } else {
        console.log("   ✅ All dependencies up to date");
      }
    } catch (error) {
      // pnpm outdated exits with code 1 if there are updates
      if (error.stdout) {
        console.log(error.stdout.toString());
      } else {
        console.log("   ✅ All dependencies up to date");
      }
    }

    console.log("");
  });

  console.log("💡 To update dependencies:");
  console.log("   pnpm update -r              # Update all scripts");
  console.log("   pnpm update --filter=<name> # Update specific script");
} catch (error) {
  console.error("❌ Error checking updates:", error.message);
  process.exit(1);
}
