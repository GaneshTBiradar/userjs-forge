import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const args = process.argv.slice(2);
const scriptName = args[0];
const releaseType = args[1] || "patch"; // major | minor | patch

if (!scriptName) {
  console.error("Usage: node scripts-tooling/release.js <script-name> [release-type]");
  console.error("");
  console.error("Release types:");
  console.error("  major - Breaking changes (1.0.0 -> 2.0.0)");
  console.error("  minor - New features (1.0.0 -> 1.1.0)");
  console.error("  patch - Bug fixes (1.0.0 -> 1.0.1)");
  console.error("");
  console.error("Example:");
  console.error("  node scripts-tooling/release.js perplexity-bot minor");
  process.exit(1);
}

const scriptDir = resolve(__dirname, `../scripts/${scriptName}`);
const packageJsonPath = join(scriptDir, "package.json");

try {
  console.log(`🚀 Releasing ${scriptName} (${releaseType})...\n`);

  // 1. Bump version
  console.log("📝 Bumping version...");
  execSync(`node scripts-tooling/bump-version.js ${scriptName} ${releaseType}`, {
    stdio: "inherit",
  });

  // Get new version
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  const newVersion = packageJson.version;

  // 2. Build
  console.log("\n🔨 Building...");
  execSync(`pnpm run build --filter=${scriptName}`, {
    stdio: "inherit",
  });

  // 3. Run tests if available
  const hasTests = packageJson.scripts?.test;
  if (hasTests) {
    console.log("\n🧪 Running tests...");
    execSync(`pnpm run test --filter=${scriptName}`, {
      stdio: "inherit",
    });
  }

  // 4. Git operations
  console.log("\n📦 Creating git tag...");
  execSync(`git add scripts/${scriptName}`, { stdio: "inherit" });
  execSync(`git commit -m "chore(${scriptName}): release v${newVersion}"`, {
    stdio: "inherit",
  });
  execSync(`git tag ${scriptName}@v${newVersion}`, { stdio: "inherit" });

  console.log("\n✅ Release prepared successfully!");
  console.log("");
  console.log("🚀 To publish:");
  console.log("   git push --follow-tags");
  console.log("");
  console.log("📋 Release info:");
  console.log(`   Script: ${scriptName}`);
  console.log(`   Version: v${newVersion}`);
  console.log(`   Tag: ${scriptName}@v${newVersion}`);
} catch (error) {
  console.error("\n❌ Release failed:", error.message);
  process.exit(1);
}
