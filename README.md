# Nepal-US Hackathon 2026

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> A collaborative hackathon project between Nepal and the United States, built on **Microsoft Dynamics 365 Business Central** (AL language).

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Team](#team)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [Contact & Support](#contact--support)

---

## Project Overview

This project was created for the Nepal-US Hackathon 2026. It leverages Microsoft Dynamics 365 Business Central (AL language) to deliver a solution that bridges business process needs across both countries.

**Goals:**
- Solve a real-world business problem relevant to Nepal-US commerce or collaboration
- Build a maintainable, well-documented Business Central extension
- Demonstrate cross-cultural team collaboration

---

## Team

| Name | Role | Contact |
|------|------|---------|
| _(Add team member)_ | _(Role)_ | _(GitHub handle)_ |
| _(Add team member)_ | _(Role)_ | _(GitHub handle)_ |

---

## Getting Started

### Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/)
- [AL Language Extension for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-dynamics-smb.al)
- Access to a **Business Central** sandbox environment (online or on-premises)
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/SamirWagle/Nepal-US-Hackathon-2026.git
   cd Nepal-US-Hackathon-2026
   ```

2. **Open in VS Code**
   ```bash
   code .
   ```

3. **Configure your Business Central connection**
   - Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
   - Run **AL: Go!** or update `.vscode/launch.json` with your sandbox server details

4. **Download symbols**
   - Run **AL: Download Symbols** from the Command Palette

5. **Publish the extension**
   - Press `F5` to publish and run in your connected sandbox

---

## Project Structure

```
Nepal-US-Hackathon-2026/
├── .vscode/               # VS Code workspace settings & launch config (local, not committed)
├── src/                   # AL source files
│   ├── pages/             # Page extensions and new pages
│   ├── tables/            # Table extensions and new tables
│   ├── codeunits/         # Business logic codeunits
│   ├── reports/           # Reports
│   └── ...
├── test/                  # AL test codeunits
├── Translations/          # XLIFF translation files
├── app.json               # Extension manifest
├── .gitignore
├── LICENSE
└── README.md
```

> **Note:** Adjust the structure above as the project evolves.

---

## Development Workflow

We follow a **feature branch workflow**:

1. **Pick a task** from the [Issues](../../issues) board
2. **Create a branch** from `main`:
   ```bash
   git checkout main && git pull
   git checkout -b feature/<short-description>
   ```
3. **Develop & test** locally against your BC sandbox
4. **Commit** with a descriptive message:
   ```bash
   git commit -m "feat: add invoice approval workflow"
   ```
5. **Push** and **open a Pull Request** against `main`
6. Request a review from at least one teammate
7. Merge after approval and CI checks pass

### Commit Message Convention

| Prefix | Purpose |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `refactor:` | Code restructuring (no behavior change) |
| `test:` | Adding or updating tests |
| `chore:` | Build, config, or tooling changes |

---

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting issues or pull requests.

---

## Roadmap

- [ ] Project scaffolding & AL extension setup
- [ ] Core business logic implementation
- [ ] UI/UX pages and reports
- [ ] Unit tests
- [ ] Demo preparation
- [ ] Hackathon submission

---

## Contact & Support

- Open an [Issue](../../issues/new/choose) for bugs, feature requests, or questions
- Tag `@SamirWagle` for urgent matters
