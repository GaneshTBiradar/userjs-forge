# Useful Commands for the Monorepo

## Development

```bash
# Run all scripts in dev mode
pnpm run dev

# Run a specific script
pnpm run dev --filter=example-bot

# Run multiple scripts
pnpm run dev --filter=example-bot --filter=example2-bot
```

## Build

```bash
# Build everything
pnpm run build

# Build only shared packages
pnpm run build --filter=@userjs-forge/shared

# Build all scripts
pnpm run build --filter=./scripts/*

# Build a specific script
pnpm run build --filter=example-bot
```

## Creating a New Script

```bash
# Generate a new script from the template
pnpm run new:script github-tools

# Then move into the directory and start development
cd scripts/github-tools
pnpm run dev
```

## Version Management

```bash
# Bump a script version
pnpm run bump example-bot 2.1.0

# Create a git tag
git tag example-bot@v2.1.0
git push --tags
```

## Linting and Type Checking

```bash
# Check the entire repo
pnpm run lint
pnpm run type-check

# Autofix issues
pnpm run lint --fix

# Lint a specific script
pnpm run lint --filter=example-bot
```

## Cleaning

```bash
# Remove build artifacts
pnpm run clean

# Fully clean everything (including node_modules)
rm -rf node_modules packages/*/node_modules scripts/*/node_modules
pnpm install
```

## Working with Dependencies

```bash
# Add a dependency to a specific package
pnpm add lodash --filter=example-bot

# Add a dev dependency
pnpm add -D vitest --filter=@userjs-forge/shared

# Update all dependencies
pnpm update -r

# Check outdated dependencies
pnpm outdated -r
```

## CI/CD

```bash
# Run the CI pipeline locally
pnpm run lint && pnpm run type-check && pnpm run build

# Create a release
git tag v1.0.0
git push --tags
# GitHub Actions will automatically generate a release
```

## Turborepo Cache

```bash
# Clear Turbo cache
rm -rf .turbo

# Force rebuild without cache
pnpm run build --force

# Preview what will be cached
turbo run build --dry-run
```

## Dependency Analysis

```bash
# Visualize dependency graph
turbo run build --graph

# Show which packages are affected by changes
turbo run build --dry-run --filter=[main]
```
