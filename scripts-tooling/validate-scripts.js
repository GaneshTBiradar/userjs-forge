import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const scriptsDir = resolve(__dirname, "../scripts");

console.log("🔍 Validating UserScripts...\n");

const requiredFiles = [
  "package.json",
  "tsconfig.json",
  "vite.config.ts",
  "src/main.ts",
  "src/config.ts",
];

let hasErrors = false;

try {
  const scripts = readdirSync(scriptsDir).filter((name) => {
    const path = join(scriptsDir, name);
    return statSync(path).isDirectory();
  });

  scripts.forEach((scriptName) => {
    console.log(`📦 ${scriptName}`);

    const scriptPath = join(scriptsDir, scriptName);
    let scriptHasErrors = false;

    // Check required files
    requiredFiles.forEach((file) => {
      const filePath = join(scriptPath, file);
      if (!existsSync(filePath)) {
        console.log(`   ❌ Missing: ${file}`);
        scriptHasErrors = true;
        hasErrors = true;
      }
    });

    // Validate package.json
    const packageJsonPath = join(scriptPath, "package.json");
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

        if (!packageJson.name) {
          console.log('   ❌ package.json: missing "name" field');
          scriptHasErrors = true;
          hasErrors = true;
        }

        if (!packageJson.version) {
          console.log('   ❌ package.json: missing "version" field');
          scriptHasErrors = true;
          hasErrors = true;
        } else if (!/^\d+\.\d+\.\d+$/.test(packageJson.version)) {
          console.log(`   ❌ package.json: invalid version format "${packageJson.version}"`);
          scriptHasErrors = true;
          hasErrors = true;
        }

        if (!packageJson.dependencies?.["@userjs-forge/shared"]) {
          console.log("   ⚠️  package.json: missing @userjs-forge/shared dependency");
        }
      } catch (_error) {
        console.log("   ❌ package.json: invalid JSON");
        scriptHasErrors = true;
        hasErrors = true;
      }
    }

    // Validate vite.config.ts
    const viteConfigPath = join(scriptPath, "vite.config.ts");
    if (existsSync(viteConfigPath)) {
      const viteConfig = readFileSync(viteConfigPath, "utf-8");

      if (!viteConfig.includes("vite-plugin-monkey")) {
        console.log("   ❌ vite.config.ts: missing vite-plugin-monkey");
        scriptHasErrors = true;
        hasErrors = true;
      }

      if (!viteConfig.includes("entry:")) {
        console.log("   ❌ vite.config.ts: missing entry point");
        scriptHasErrors = true;
        hasErrors = true;
      }
    }

    if (!scriptHasErrors) {
      console.log("   ✅ All checks passed");
    }

    console.log("");
  });

  if (hasErrors) {
    console.log("❌ Validation failed! Please fix the errors above.\n");
    process.exit(1);
  } else {
    console.log("✅ All scripts validated successfully!\n");
  }
} catch (error) {
  console.error("❌ Error validating scripts:", error.message);
  process.exit(1);
}
