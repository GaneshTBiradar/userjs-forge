import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const args = process.argv.slice(2);
const scriptName = args[0];
const scriptUrl = args[1] || "https://example.com/*";
const scriptDescription = args[2] || `UserScript for ${scriptName}`;

if (!scriptName) {
  console.error("Usage: node scripts-tooling/create-script.js <script-name> [url] [description]");
  console.error("\nExample:");
  console.error(
    '  node scripts-tooling/create-script.js github-tools "https://github.com/*" "GitHub enhancement tools"',
  );
  process.exit(1);
}

// Validate script name
if (!/^[a-z][a-z0-9-]*$/.test(scriptName)) {
  console.error(
    "Error: Script name must start with a letter and contain only lowercase letters, numbers, and hyphens",
  );
  process.exit(1);
}

const scriptDir = resolve(__dirname, `../scripts/${scriptName}`);

try {
  // Create directories
  mkdirSync(join(scriptDir, "src/features"), { recursive: true });
  mkdirSync(join(scriptDir, "src/ui"), { recursive: true });

  // ========================================
  // package.json
  // ========================================
  const packageJson = {
    name: scriptName,
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
      clean: "rm -rf dist",
      lint: "pnpm biome lint .",
      "type-check": "tsc --noEmit",
    },
    dependencies: {
      "@userjs-forge/shared": "workspace:*",
    },
    devDependencies: {
      "@types/tampermonkey": "5.0.5",
      typescript: "5.9.3",
      vite: "7.2.6",
      "vite-plugin-monkey": "7.1.5",
    },
  };

  writeFileSync(join(scriptDir, "package.json"), `${JSON.stringify(packageJson, null, 2)}\n`);

  // ========================================
  // tsconfig.json
  // ========================================
  const tsconfig = {
    extends: "../../tsconfig.base.json",
    compilerOptions: {
      outDir: "./dist",
      rootDir: "./src",
      noEmit: true,
    },
    include: ["src/**/*"],
    references: [{ path: "../../packages/shared" }],
  };

  writeFileSync(join(scriptDir, "tsconfig.json"), `${JSON.stringify(tsconfig, null, 2)}\n`);

  // ========================================
  // vite.config.ts
  // ========================================
  const domain = new URL(scriptUrl).hostname.replace("www.", "");
  const viteConfig = `import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: '${scriptName
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")}',
        namespace: 'http://tampermonkey.net/',
        version: '1.0.0',
        description: '${scriptDescription}',
        author: '@dotnetdvl',
        match: ['${scriptUrl}'],
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=${domain}',
        grant: 'none',
      },
      build: {
        metaFileName: true,
        fileName: '${scriptName}.user.js',
      },
    }),
  ],
  build: {
    minify: false,
    target: 'es2022',
  },
});
`;

  writeFileSync(join(scriptDir, "vite.config.ts"), viteConfig);

  // ========================================
  // src/config.ts
  // ========================================
  const configTs = `import type { LoggerConfig } from '@userjs-forge/shared';

export const CONFIG = {
  // Feature flags
  features: {
    exampleFeature: true,
  },

  // Timing configuration
  timing: {
    initDelay: 1000,
    checkInterval: 500,
  },

  // Selectors
  selectors: {
    // Add your selectors here
  },

  // Logging configuration
  logging: {
    level: 'INFO',
    prefix: '[${scriptName}]',
    timestampFormat: 'ISO',
  } satisfies LoggerConfig,
} as const;

export type Config = typeof CONFIG;
`;

  writeFileSync(join(scriptDir, "src/config.ts"), configTs);

  // ========================================
  // src/main.ts
  // ========================================
  const mainTs = `import { Logger, DOMUtils } from '@userjs-forge/shared';
import { CONFIG } from './config';

const logger = new Logger(CONFIG.logging);

class ${scriptName
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")}Script {
  async initialize(): Promise<void> {
    logger.info('Initializing script', { version: '1.0.0' });

    try {
      await this.waitForPage();
      await this.setupFeatures();
      
      logger.info('Script initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize script', error);
    }
  }

  private async waitForPage(): Promise<void> {
    // Wait for page to be ready
    await new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve(undefined);
      } else {
        window.addEventListener('load', () => resolve(undefined));
      }
    });

    // Add additional waits if needed
    await new Promise((resolve) => setTimeout(resolve, CONFIG.timing.initDelay));
  }

  private async setupFeatures(): Promise<void> {
    logger.debug('Setting up features');

    // Add your features here
    if (CONFIG.features.exampleFeature) {
      this.setupExampleFeature();
    }
  }

  private setupExampleFeature(): void {
    logger.debug('Setting up example feature');
    
    // Example: Add a button to the page
    const button = DOMUtils.createElement('button', {
      textContent: 'Example Button',
      class: 'userscript-button',
    });

    DOMUtils.addStyles(button, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '10px 20px',
      backgroundColor: '#4caf50',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      zIndex: '10000',
    });

    button.addEventListener('click', () => {
      logger.info('Button clicked');
      alert('Hello from ${scriptName}!');
    });

    document.body.appendChild(button);
  }
}

// Entry point
const script = new ${scriptName
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("")}Script();
script.initialize();
`;

  writeFileSync(join(scriptDir, "src/main.ts"), mainTs);

  // ========================================
  // README.md
  // ========================================
  const readme = `# ${scriptName}

${scriptDescription}

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) extension
2. Click on the \`.user.js\` file from the latest release
3. Tampermonkey will prompt you to install the script
4. Visit ${scriptUrl}

## Features

- Example feature (add your features here)

## Development

\`\`\`bash
# Development with hot reload
pnpm run dev --filter=${scriptName}

# Build production version
pnpm run build --filter=${scriptName}

# Lint code
pnpm run lint --filter=${scriptName}

# Type check
pnpm run type-check --filter=${scriptName}
\`\`\`

## Configuration

Edit \`src/config.ts\` to customize behavior:

\`\`\`typescript
export const CONFIG = {
  features: {
    exampleFeature: true, // Enable/disable features
  },
  timing: {
    initDelay: 1000, // Delay before initialization
  },
  logging: {
    level: 'INFO', // DEBUG | INFO | WARN | ERROR | NONE
  },
};
\`\`\`

## Project Structure

\`\`\`
${scriptName}/
├── src/
│   ├── main.ts           # Entry point
│   ├── config.ts         # Configuration
│   ├── features/         # Feature modules
│   └── ui/               # UI components
├── package.json
├── vite.config.ts
└── README.md
\`\`\`

## License

MIT
`;

  writeFileSync(join(scriptDir, "README.md"), readme);

  // ========================================
  // .gitignore
  // ========================================
  const gitignore = `dist/
node_modules/
*.user.js
*.meta.js
`;

  writeFileSync(join(scriptDir, ".gitignore"), gitignore);

  console.log(`✅ Successfully created script: ${scriptName}`);
  console.log("");
  console.log("📁 Created files:");
  console.log("   ├── package.json");
  console.log("   ├── tsconfig.json");
  console.log("   ├── vite.config.ts");
  console.log("   ├── README.md");
  console.log("   ├── .gitignore");
  console.log("   └── src/");
  console.log("       ├── main.ts");
  console.log("       ├── config.ts");
  console.log("       ├── features/");
  console.log("       └── ui/");
  console.log("");
  console.log("🚀 Next steps:");
  console.log(`   1. cd scripts/${scriptName}`);
  console.log("   2. pnpm install");
  console.log("   3. pnpm run dev");
  console.log("");
  console.log("💡 Tips:");
  console.log("   - Edit src/config.ts to configure your script");
  console.log("   - Add features in src/features/");
  console.log("   - Build UI components in src/ui/");
  console.log('   - Run "pnpm run dev" for hot reload during development');
} catch (error) {
  console.error("❌ Error creating script:", error.message);
  process.exit(1);
}
