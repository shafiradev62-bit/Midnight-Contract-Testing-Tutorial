# Midnight Contract Testing Tutorial

A comprehensive tutorial and working code repository for testing Midnight Compact contracts, including unit tests, assertions, local simulation, and GitHub Actions CI.

This repository is a submission for the Midnight Network bounty: [Tutorial: Testing Compact Contracts: Unit Tests, Assertions, and Local Simulation](https://github.com/midnightntwrk/contributor-hub/issues/312)

## Features

- **Contract Simulator**: Local simulation of Compact contract logic for fast testing
- **Comprehensive Test Suite**: Unit tests with Vitest for circuit calls and ledger state verification
- **GitHub Actions CI**: Automated testing pipeline for every commit and PR
- **TypeScript Support**: Full TypeScript integration for type-safe development
- **Test Isolation**: Fresh contract state for every test

## Prerequisites

- Node.js 18+
- npm or yarn

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/shafiradev62-bit/Midnight-Contract-Testing-Tutorial.git
cd Midnight-Contract-Testing-Tutorial

# 2. Install dependencies
npm install

# 3. Run the test suite
npm test

# 4. Run tests in watch mode (development)
npm run dev

# 5. Check test coverage
npm run test:coverage

# 6. Build the project
npm run build
```

## Repository Structure

```
midnight-contract-testing-tutorial/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI configuration
├── src/
│   └── contract-simulator.ts  # Contract simulator implementation
├── tests/
│   └── contract-simulator.test.ts  # Test suite
├── TUTORIAL_DRAFT.md       # Full tutorial draft
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Tutorial

The full step-by-step tutorial is available in [TUTORIAL_DRAFT.md](./TUTORIAL_DRAFT.md), covering:

1. Project setup and tooling installation
2. Building a contract simulator
3. Writing unit tests with Vitest
4. Testing edge cases
5. Setting up GitHub Actions CI

## Bounty Submission

- **Code Repository**: https://github.com/shafiradev62-bit/Midnight-Contract-Testing-Tutorial
- **Tutorial**: [TUTORIAL_DRAFT.md](./TUTORIAL_DRAFT.md)
- **Issue Reference**: https://github.com/midnightntwrk/contributor-hub/issues/312

## License

MIT
