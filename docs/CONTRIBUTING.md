# Contributing to Real-Time Visitor Tracker

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

### Expected Behavior

- ✅ Be respectful and inclusive
- ✅ Accept constructive criticism gracefully
- ✅ Focus on what's best for the community
- ✅ Show empathy towards others

### Unacceptable Behavior

- ❌ Harassment or discriminatory language
- ❌ Personal attacks or trolling
- ❌ Publishing others' private information
- ❌ Unethical or unprofessional conduct

## Getting Started

### Prerequisites

- Node.js v18+ installed
- Git installed
- Code editor (VS Code recommended)
- Basic knowledge of TypeScript/JavaScript
- Understanding of React and Express.js

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/real-time-visitor-tracker.git
cd real-time-visitor-tracker
```

3. Add upstream remote:

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/real-time-visitor-tracker.git
```

### Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming conventions:**

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

## Development Workflow

### 1. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Keep commits focused and atomic

### 2. Test Your Changes

```bash
# Start backend
cd backend
npm run dev

# Start frontend (in another terminal)
cd frontend
npm run dev

# Test in browser
open http://localhost:3000
```

### 3. Verify Everything Works

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] No console errors in browser
- [ ] SSE connection establishes successfully
- [ ] Visitor counting works correctly
- [ ] Multiple tabs behavior is correct
- [ ] Disconnection updates properly

### 4. Update Documentation

If your changes affect:

- **API**: Update `docs/api/API.md`
- **Setup**: Update `docs/INSTALLATION.md`
- **Usage**: Update `docs/GETTING_STARTED.md`
- **Architecture**: Update `docs/architecture/ARCHITECTURE.md`

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

See [Commit Guidelines](#commit-guidelines) for format.

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Open a Pull Request

Go to GitHub and click "New Pull Request"

## Coding Standards

### TypeScript/JavaScript

#### Style Guide

**Naming Conventions:**

```typescript
// Variables and functions: camelCase
const userName = "John";
function getUserData() {}

// Classes: PascalCase
class UserManager {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_CONNECTIONS = 1000;

// Private variables: _prefix
const _privateData = {};
```

**Code Formatting:**

```typescript
// Use 2 spaces for indentation
function example() {
  if (condition) {
    doSomething();
  }
}

// Always use const/let, never var
const immutable = 1;
let mutable = 2;

// Prefer arrow functions for callbacks
array.map((item) => item.value);

// Use template literals
const message = `Hello ${name}`;
```

**TypeScript Specific:**

```typescript
// Always specify types for function parameters
function greet(name: string): string {
  return `Hello ${name}`;
}

// Use interfaces for object shapes
interface User {
  id: string;
  name: string;
}

// Use type for unions
type Status = "connected" | "disconnected" | "reconnecting";
```

### React Components

```tsx
// Use functional components with hooks
export default function MyComponent() {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Side effects here
    return () => {
      // Cleanup
    };
  }, [dependencies]);

  return <div className="container">{/* JSX here */}</div>;
}

// Props interface above component
interface Props {
  title: string;
  onAction: () => void;
}
```

### Backend Code

```javascript
// Use Express best practices
app.get("/route", (req, res) => {
  try {
    // Handle request
    res.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Middleware should be composable
const middleware = (req, res, next) => {
  // Do something
  next();
};

// Use async/await over callbacks
async function fetchData() {
  const data = await getData();
  return data;
}
```

### File Organization

```
backend/
  ├── server.js           # Main server file
  ├── routes/             # Route handlers (if split)
  ├── middleware/         # Custom middleware
  └── utils/              # Utility functions

frontend/
  ├── app/
  │   ├── components/     # Reusable components
  │   ├── hooks/          # Custom hooks
  │   ├── utils/          # Utility functions
  │   └── types/          # TypeScript types
```

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
feat(backend): add rate limiting to SSE endpoint

Implement express-rate-limit middleware to prevent abuse
of the /events endpoint. Limits to 100 requests per 15 minutes.

Closes #123

---

fix(frontend): resolve memory leak in EventSource

EventSource was not being properly closed on component unmount,
causing memory leaks when navigating away from the page.

---

docs(api): update API documentation with new fields

Added documentation for serverUptime and memoryUsage fields
in the SSE response payload.

---

refactor(backend): extract session logic into separate module

Moved session ID generation and cookie management into
utils/session.js for better code organization.
```

### Commit Message Rules

- ✅ Use present tense ("add feature" not "added feature")
- ✅ Use imperative mood ("move cursor to..." not "moves cursor to...")
- ✅ Limit first line to 72 characters
- ✅ Reference issues and pull requests when relevant
- ✅ Explain _what_ and _why_, not _how_

## Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Commit messages follow the convention
- [ ] No console.log statements left in code
- [ ] Code has been reviewed by yourself first

### PR Title Format

```
<type>: <description>
```

Examples:

```
feat: Add WebSocket alternative implementation
fix: Resolve SSE connection timeout issue
docs: Add deployment guide
```

### PR Description Template

```markdown
## Description

Brief description of what this PR does.

## Motivation and Context

Why is this change needed? What problem does it solve?

## Type of Change

- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## How Has This Been Tested?

Describe the tests you ran and how to reproduce them.

## Screenshots (if applicable)

Add screenshots showing the changes.

## Checklist

- [ ] My code follows the code style of this project
- [ ] I have updated the documentation accordingly
- [ ] I have added tests to cover my changes
- [ ] All new and existing tests passed
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged

### After Your PR is Merged

1. Delete your branch (if no longer needed)
2. Pull the latest changes from upstream:

```bash
git checkout main
git pull upstream main
git push origin main
```

## Testing

### Manual Testing

1. **Functional Testing**

   - Test all features work as expected
   - Test edge cases
   - Test error scenarios

2. **Browser Testing**

   - Test in multiple browsers (Chrome, Firefox, Safari)
   - Test on mobile devices
   - Test in incognito/private mode

3. **Connection Testing**
   - Test single connection
   - Test multiple tabs
   - Test disconnect/reconnect
   - Test server restart scenario

### Automated Testing (TODO)

**Unit Tests:**

```bash
npm test
```

**Integration Tests:**

```bash
npm run test:integration
```

**E2E Tests:**

```bash
npm run test:e2e
```

## Documentation

### When to Update Docs

Update documentation when you:

- Add new features
- Change existing behavior
- Fix bugs that were confusing
- Add configuration options
- Change API endpoints

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Keep formatting consistent
- Check spelling and grammar

### Documentation Structure

```
docs/
├── GETTING_STARTED.md      # Quick start guide
├── INSTALLATION.md         # Detailed installation
├── TROUBLESHOOTING.md      # Common issues
├── FAQ.md                  # Frequently asked questions
├── CONTRIBUTING.md         # This file
├── api/
│   └── API.md              # API reference
├── architecture/
│   └── ARCHITECTURE.md     # System design
└── examples/
    └── EXAMPLES.md         # Usage examples
```

## Areas for Contribution

### High Priority

- [ ] Add automated tests (unit, integration, e2e)
- [ ] Implement Redis for persistent storage
- [ ] Add rate limiting
- [ ] Add authentication system
- [ ] Create deployment guides
- [ ] Add monitoring/logging

### Medium Priority

- [ ] Add filtering options (by time, location, etc.)
- [ ] Create admin dashboard
- [ ] Add historical data analytics
- [ ] Implement WebSocket alternative
- [ ] Add Docker support
- [ ] Create CI/CD pipeline

### Low Priority

- [ ] Add more visualization options
- [ ] Create mobile app
- [ ] Add notification system
- [ ] Implement A/B testing
- [ ] Add export functionality

### Documentation Improvements

- [ ] Add video tutorials
- [ ] Create interactive examples
- [ ] Add more diagrams
- [ ] Translate to other languages
- [ ] Improve API documentation

## Code Review Guidelines

### For Reviewers

- Be constructive and respectful
- Explain reasoning behind suggestions
- Distinguish between required and optional changes
- Recognize good solutions
- Respond within 48 hours when possible

### For Contributors

- Don't take criticism personally
- Ask for clarification if feedback is unclear
- Be patient with the review process
- Make requested changes promptly
- Thank reviewers for their time

## Getting Help

### Resources

- 📖 [Documentation](GETTING_STARTED.md)
- 🐛 [Troubleshooting Guide](TROUBLESHOOTING.md)
- ❓ [FAQ](FAQ.md)
- 🏗️ [Architecture Docs](architecture/ARCHITECTURE.md)

### Communication

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Features**: Open a GitHub Issue with [Feature Request] tag
- **Security**: Email security@example.com (private disclosure)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing! 🎉**

Your time and effort help make this project better for everyone.
