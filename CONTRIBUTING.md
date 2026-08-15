# Contributing to Chesster

Thank you for your interest in contributing to Chesster! We welcome contributions from developers of all skill levels to help make decentralized chess on Stellar even better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Development Environment Setup](#development-environment-setup)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Pull Requests](#pull-requests)
- [Code Quality & Testing](#code-quality--testing)
  - [Smart Contracts](#smart-contracts)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Commit Message Conventions](#commit-message-conventions)
- [License](#license)

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## Getting Started

### Prerequisites

Ensure you have the following installed locally:
- [Node.js](https://nodejs.org/) (v20+)
- [Rust & Cargo](https://www.rust-lang.org/)
- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup)
- [Freighter Wallet](https://www.freighter.app/)

### Development Environment Setup

1. **Fork & Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Chesster.git
   cd Chesster
   ```

2. **Setup Smart Contracts**:
   ```bash
   cd contracts/soroban
   cargo test
   ```

3. **Setup Backend**:
   ```bash
   cd ../../backend
   cp .env.example .env
   npm install
   npm test
   ```

4. **Setup Frontend**:
   ```bash
   cd ../frontend
   cp .env.example .env
   npm install
   npm run lint
   npm run build
   ```

---

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing GitHub issues. If you find a new bug:
1. Open a new issue using the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md).
2. Include a clear, descriptive title and detailed reproduction steps.
3. Provide system details (OS, browser, wallet version, Node version).

### Suggesting Features

Feature requests are tracked as GitHub issues:
1. Open a new issue using the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md).
2. Explain why this feature would be useful to users or maintainers.

### Pull Requests

1. Create a topic branch from `master` (e.g., `feat/add-timer-modes` or `fix/escrow-refund-bug`).
2. Make modular, clean commits with clear messages.
3. Verify that all test suites and linter checks pass locally.
4. Push your branch and open a Pull Request targeting `master`.
5. Fill out the [Pull Request template](.github/PULL_REQUEST_TEMPLATE.md).

---

## Code Quality & Testing

### Smart Contracts
- Unit tests: `cd contracts/soroban && cargo test`
- Formatting check: `cargo fmt --all -- --check`
- Linter: `cargo clippy --all-targets --all-features -- -D warnings`

### Backend
- Unit tests: `cd backend && npm test`

### Frontend
- Code linting: `cd frontend && npm run lint`
- Type checking & build: `cd frontend && npm run build`

---

## Commit Message Conventions

We follow Conventional Commits:
- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation updates
- `style:` Formatting changes with no code impact
- `refactor:` Code restructuring without changing behavior
- `test:` Adding or updating tests
- `chore:` Maintenance tasks, dependency updates, build configuration

Example: `feat(escrow): add support for multi-token wagering`

---

## License

By contributing to Chesster, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).
