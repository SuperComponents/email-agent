# Contributing to OpenSupport Landing Page

Thank you for contributing to the OpenSupport Landing Page! This document outlines the development workflow and code quality standards.

## Development Workflow

### Prerequisites

- [Bun](https://bun.sh/) (JavaScript runtime and package manager)
- Node.js 18+ (if needed for certain tools)

### Getting Started

1. Clone the repository
2. Install dependencies: `bun install`
3. Start development server: `bun run dev`

### Code Quality Tools

This project uses automated code quality tools to maintain consistent, accessible, and high-quality code:

- **ESLint**: JavaScript/TypeScript linting with accessibility rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for automated checks
- **lint-staged**: Run linters only on staged files

### Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `bun run lint` - Run ESLint on all files
- `bun run lint:fix` - Run ESLint and automatically fix issues
- `bun run format` - Format all files with Prettier
- `bun run format:check` - Check if files are properly formatted

### Pre-commit Hooks

The project uses Husky to automatically run code quality checks before each commit:

1. **ESLint**: Checks for code quality issues and accessibility violations
2. **Prettier**: Ensures consistent code formatting

If any checks fail, the commit will be blocked. Fix the issues and try committing again.

### Manual Quality Checks

Before submitting a pull request, run:

```bash
bun run lint:fix
bun run format
bun run build
```

### Accessibility Standards

This project follows WCAG 2.1 AA accessibility guidelines. The ESLint configuration includes `jsx-a11y` rules to catch common accessibility issues:

- Use semantic HTML elements
- Include alt text for images
- Ensure proper heading hierarchy
- Add ARIA labels where needed
- Maintain sufficient color contrast

### Code Style Guidelines

- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Use Tailwind CSS for styling
- Keep components small and focused
- Write descriptive variable and function names
- Use meaningful commit messages

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following the code quality standards
3. Ensure all automated checks pass
4. Test your changes thoroughly
5. Submit a pull request with a clear description

### Troubleshooting

**Pre-commit hook failing?**
- Run `bun run lint:fix` to automatically fix linting issues
- Run `bun run format` to fix formatting issues
- Check the console output for specific errors

**ESLint errors?**
- Most issues can be auto-fixed with `bun run lint:fix`
- For accessibility issues, review the `jsx-a11y` rule documentation
- Ensure all interactive elements have proper keyboard support

**Build failures?**
- Check TypeScript errors with `bun run build`
- Ensure all imports are correct
- Verify all dependencies are installed

## Getting Help

If you encounter issues or have questions about the development workflow, please:

1. Check this documentation
2. Review existing issues on GitHub
3. Create a new issue with detailed information

Thank you for helping make OpenSupport more accessible and maintainable!
