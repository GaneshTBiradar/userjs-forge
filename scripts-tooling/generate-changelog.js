import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const args = process.argv.slice(2);
const scriptName = args[0];

if (!scriptName) {
  console.error("Usage: node scripts-tooling/generate-changelog.js <script-name>");
  process.exit(1);
}

try {
  console.log(`📝 Generating changelog for ${scriptName}...\n`);

  // Get git tags for this script
  const tags = execSync(`git tag --list "${scriptName}@*" --sort=-version:refname`, {
    encoding: "utf-8",
  })
    .trim()
    .split("\n")
    .filter(Boolean);

  if (tags.length === 0) {
    console.log("No tags found. Create a release first.");
    process.exit(0);
  }

  let changelog = `# Changelog - ${scriptName}\n\n`;
  changelog += `All notable changes to this script will be documented in this file.\n\n`;

  for (let i = 0; i < tags.length; i++) {
    const currentTag = tags[i];
    const previousTag = tags[i + 1];
    const version = currentTag.replace(`${scriptName}@`, "");

    changelog += `## ${version}\n\n`;

    // Get commits between tags
    const gitLogCmd = previousTag
      ? `git log ${previousTag}..${currentTag} --pretty=format:"- %s (%h)" -- scripts/${scriptName}`
      : `git log ${currentTag} --pretty=format:"- %s (%h)" -- scripts/${scriptName}`;

    const commits = execSync(gitLogCmd, { encoding: "utf-8" }).trim();

    if (commits) {
      changelog += `${commits}\n\n`;
    } else {
      changelog += "- Initial release\n\n";
    }
  }

  const changelogPath = resolve(__dirname, `../scripts/${scriptName}/CHANGELOG.md`);
  writeFileSync(changelogPath, changelog);

  console.log(`✅ Changelog generated: scripts/${scriptName}/CHANGELOG.md`);
} catch (error) {
  console.error("❌ Error generating changelog:", error.message);
  process.exit(1);
}
