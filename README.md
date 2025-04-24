# Turbo Design System Monorepo

A modern, scalable monorepo setup for building design systems and web applications with best practices for code quality, testing, and development workflows.

## 🚀 Features

- **Turborepo**: Efficient build system for JavaScript/TypeScript monorepos
- **Next.js**: React framework for production-ready web applications
- **Design System**: Customizable UI components built with shadcn/ui
- **Code Quality**:
  - Biome for fast, consistent code formatting and linting
  - TypeScript for static type checking
- **Git Workflow**:
  - Husky for Git hooks
  - Commitlint with conventional commit format
  - Commitizen for structured commit messages
- **Testing**: Shared testing utilities
- **SEO**: Reusable SEO components and utilities
- **Storybook**: UI component explorer and documentation

## 📦 Project Structure

```
├── apps/
│   ├── web/            # Next.js web application
│   └── storybook/      # Storybook for UI component development
├── packages/
│   ├── design-system/  # Shared UI components and styles
│   ├── seo/            # SEO utilities and components
│   ├── testing/        # Testing utilities and configurations
│   └── typescript-config/ # Shared TypeScript configurations
```

## 🛠️ Setup & Development

### Prerequisites

- Node.js v22+
- pnpm v10.9.0+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd <repository-directory>

# Install dependencies
pnpm install
```

### Development Commands

```bash
# Start development servers for all applications
pnpm dev

# Start only web application
pnpm dev:web

# Start only Storybook
pnpm dev:storybook

# Build all applications and packages
pnpm build

# Code formatting
pnpm format

# Linting
pnpm lint

# Type checking
pnpm check
```

## 🧰 Tooling

### Biome

[Biome](https://biomejs.dev/) is used for fast code formatting and linting. Configuration is in `biome.json`.

```bash
# Format code
pnpm format

# Lint code
pnpm lint

# Type check
pnpm check
```

### Commit Workflow

This project uses [commitlint](https://commitlint.js.org/) with [conventional commits](https://www.conventionalcommits.org/) for structured, semantic commit messages.

```bash
# Use the interactive commit tool
pnpm commit
```

### Husky Git Hooks

- `pre-commit`: Runs biome for linting and formatting
- `commit-msg`: Validates commit messages using commitlint

## 📚 Packages

### Design System

A collection of reusable UI components built with shadcn/ui.

### TypeScript Configuration

Shared TypeScript configurations for different project types:
- Base configuration
- React library configuration
- React application configuration
- Next.js configuration

### SEO

Utilities for managing metadata and structured data for better search engine optimization.

### Testing

Shared testing utilities and configurations.

## 📄 License

MIT
