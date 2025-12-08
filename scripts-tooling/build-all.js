import { execSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const scriptsDir = resolve(__dirname, "../scripts");

console.log("🔨 Building all UserScripts...\n");

try {
  const scripts = readdirSync(scriptsDir).filter((name) => {
    const path = join(scriptsDir, name);
    return statSync(path).isDirectory();
  });

  if (scripts.length === 0) {
    console.log("No scripts found to build.");
    process.exit(0);
  }

  let successCount = 0;
  let failCount = 0;
  const results = [];

  scripts.forEach((scriptName) => {
    const packageJsonPath = join(scriptsDir, scriptName, "package.json");

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      const version = packageJson.version || "0.0.0";

      console.log(`📦 Building ${scriptName}@${version}...`);

      execSync(`pnpm run build --filter=${scriptName}`, {
        stdio: "inherit",
        cwd: resolve(__dirname, ".."),
      });

      successCount++;
      results.push({ name: scriptName, version, status: "success" });
      console.log(`   ✅ Built successfully\n`);
    } catch (error) {
      failCount++;
      results.push({
        name: scriptName,
        status: "failed",
        error: error.message,
      });
      console.log(`   ❌ Build failed\n`);
    }
  });

  console.log("\n📊 Build Summary:");
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📦 Total: ${scripts.length}\n`);

  if (failCount > 0) {
    console.log("❌ Some builds failed:");
    results
      .filter((r) => r.status === "failed")
      .forEach((r) => {
        console.log(`   - ${r.name}`);
      });
    process.exit(1);
  } else {
    console.log("✅ All builds completed successfully!");
  }
} catch (error) {
  console.error("❌ Build error:", error.message);
  process.exit(1);
}
