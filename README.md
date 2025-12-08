# UserScripts Forge

A modern monorepo for managing multiple UserScript projects with shared utilities, unified tooling, and an optimized developer experience.  
Built with **pnpm workspaces**, **Turborepo**, **Vite**, and **TypeScript**.

## Repository Structure

```
├── packages/
│   └── shared/             # Shared utilities (Logger, DOM helpers, File utils, etc.)
├── scripts/
│   ├── perplexity-bot/     # Enhancements and automation for Perplexity AI
│   ├── chatgpt-enhancer/   # UX improvements and helper tools for ChatGPT
│   └── github-tools/       # Productivity tools for GitHub
└── scripts-tooling/        # Internal tooling for script management, builds, and release flow
```

## Quick Start

```bash
# Install all workspace dependencies
pnpm install

# Build shared workspace packages
pnpm run build --filter=@userjs-forge/shared

# Start development for a specific script
pnpm run dev --filter=perplexity-bot
```

## Creating a New Script

```bash
pnpm run new:script my-script-name
cd scripts/my-script-name
pnpm run dev
```

This generates a new script package with:
- Preconfigured Vite setup  
- vite-plugin-monkey metadata handling  
- TypeScript entrypoint  
- Workspace-ready package structure  

## Technology Stack

- **pnpm** — fast workspace-native package manager  
- **Turborepo** — task orchestration and remote caching  
- **Vite** — lightning-fast dev server and optimized builds  
- **TypeScript** — type-safe development across the monorepo  
- **vite-plugin-monkey** — automatic UserScript metadata and build pipeline  

## Additional Documentation

See **[COMMANDS.md](./COMMANDS.md)** for the full command list and workflow documentation.
