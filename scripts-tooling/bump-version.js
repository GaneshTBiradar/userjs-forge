import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const args = process.argv.slice(2);
const scriptName = args[0];
const newVersion = args[1];

if (!scriptName) {
  console.error("Usage: node scripts-tooling/bump-version.js <script-name> <version|bump-type>");
  console.error("");
  console.error("Examples:");
  console.error("  node scripts-tooling/bump-version.js perplexity-bot 2.1.0");
  console.error("  node scripts-tooling/bump-version.js perplexity-bot patch");
  console.error("  node scripts-tooling/bump-version.js perplexity-bot minor");
  console.error("  node scripts-tooling/bump-version.js perplexity-bot major");
  process.exit(1);
}

const scriptDir = resolve(__dirname, `../scripts/${scriptName}`);
const packageJsonPath = resolve(scriptDir, "package.json");
const viteConfigPath = resolve(scriptDir, "vite.config.ts");

if (!existsSync(packageJsonPath)) {
  console.error(`❌ Script not found: ${scriptName}`);
  console.error(`   Path: ${packageJsonPath}`);
  process.exit(1);
}

try {
  // Read current version
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  const currentVersion = packageJson.version;

  // Calculate new version
  let targetVersion = newVersion;

  if (!targetVersion || ["major", "minor", "patch"].includes(targetVersion)) {
    const [major, minor, patch] = currentVersion.split(".").map(Number);

    switch (targetVersion || "patch") {
      case "major":
        targetVersion = `${major + 1}.0.0`;
        break;
      case "minor":
        targetVersion = `${major}.${minor + 1}.0`;
        break;
      case "patch":
        targetVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }
  }

  // Validate version format
  if (!/^\d+\.\d+\.\d+$/.test(targetVersion)) {
    console.error("❌ Invalid version format. Expected: X.Y.Z (e.g., 1.2.3)");
    process.exit(1);
  }

  console.log(`📦 Bumping ${scriptName}: ${currentVersion} → ${targetVersion}`);

  // Update package.json
  packageJson.version = targetVersion;
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  console.log(`   ✅ Updated package.json`);

  // Update vite.config.ts
  if (existsSync(viteConfigPath)) {
    let viteConfig = readFileSync(viteConfigPath, "utf-8");
    viteConfig = viteConfig.replace(/version:\s*['"][\d.]+['"]/, `version: '${targetVersion}'`);
    writeFileSync(viteConfigPath, viteConfig);
    console.log(`   ✅ Updated vite.config.ts`);
  }

  console.log("");
  console.log("✅ Version bumped successfully!");
  console.log("");
  console.log("🚀 Next steps:");
  console.log(`   git add scripts/${scriptName}`);
  console.log(`   git commit -m "chore(${scriptName}): bump version to ${targetVersion}"`);
  console.log(`   git tag ${scriptName}@v${targetVersion}`);
  console.log(`   git push --follow-tags`);
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
