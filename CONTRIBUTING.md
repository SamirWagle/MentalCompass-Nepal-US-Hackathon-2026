# Contributing to Nepal-US Hackathon 2026

Thank you for your interest in contributing! This guide explains how to work effectively as part of this team.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Reporting Issues](#reporting-issues)
- [Submitting Changes](#submitting-changes)
- [Coding Guidelines](#coding-guidelines)
- [Review Process](#review-process)

---

## Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md). We are committed to a welcoming, respectful, and collaborative environment.

---

## Getting Started

See the [README](./README.md) for environment setup instructions before you start contributing.

---

## Reporting Issues

1. Check [existing issues](../../issues) to avoid duplicates.
2. Use the appropriate **issue template** (Bug Report, Feature Request, or Task).
3. Provide as much detail as possible so the team can triage quickly.

---

## Submitting Changes

### Branch Naming

Use the following conventions:

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<description>` | `feature/invoice-approval` |
| Bug fix | `fix/<description>` | `fix/posting-date-error` |
| Documentation | `docs/<description>` | `docs/update-readme` |
| Refactor | `refactor/<description>` | `refactor/customer-codeunit` |

### Pull Request Process

1. **Fork / branch** from `main`.
2. Implement your change with clear, focused commits.
3. Ensure the extension compiles and your changes are tested in a BC sandbox.
4. Open a Pull Request using the provided template.
5. Link the relevant issue(s).
6. Request review from at least one team member.
7. Address all review comments before merging.
8. A maintainer will merge once approved.

### Commit Messages

Follow the convention:

```
<type>: <short summary>

[optional body with more details]
[optional footer: Closes #issue-number]
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

---

## Coding Guidelines

### AL Language

- Follow [Microsoft AL Coding Guidelines](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-al-code-style)
- Use **PascalCase** for object names, procedure names, and variables
- Add **XML documentation comments** to all public procedures
- Avoid hardcoded strings — use labels or translation files
- Keep codeunits focused on a single responsibility
- Write unit tests for all new business logic

### General

- Keep PRs small and focused — one feature or fix per PR
- Remove debug/temporary code before submitting
- Update `README.md` if you add new setup steps or change the project structure

---

## Review Process

- Reviews are expected within **24–48 hours** on weekdays
- Reviewers should provide constructive, specific feedback
- Authors should respond to all comments before requesting re-review
- Minor style nits can be fixed as follow-up commits to keep the review focused

---

Thank you for helping make this project a success! 🇳🇵 🤝 🇺🇸
