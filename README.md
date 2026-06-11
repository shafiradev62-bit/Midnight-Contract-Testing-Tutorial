# Midnight Compact Contract Testing Framework

A production-ready testing framework and tutorial for Midnight Network Compact contracts. This repository provides a comprehensive implementation of unit testing, local simulation, and automated CI/CD pipelines for Compact contract development.

This submission is for the Midnight Network bounty: [Tutorial: Testing Compact Contracts: Unit Tests, Assertions, and Local Simulation](https://github.com/midnightntwrk/contributor-hub/issues/312)

## Key Features

- Local Contract Simulation: High-fidelity simulation of Compact contract state transitions
- Comprehensive Test Suite: Extensive unit testing with Vitest, covering edge cases and failure modes
- GitHub Actions CI: Automated testing and type checking on every commit and pull request
- Type-Safe: Full TypeScript implementation for type safety and better IDE support
- Test Isolation: Fresh state initialization for each test execution
- State Immutability: Deep cloning to prevent accidental state mutations

## Prerequisites

- Node.js >= 18.0.0
- npm or Yarn package manager
- Basic TypeScript knowledge

## Quick Start

```bash
# Clone the repository
git clone https://github.com/shafiradev62-bit/Midnight-Contract-Testing-Tutorial.git
cd Midnight-Contract-Testing-Tutorial

# Install dependencies
npm install

# Execute test suite
npm test

# Run tests in watch mode for development
npm run dev

# Generate test coverage report
npm run test:coverage

# Build the project
npm run build
```

## Repository Structure

```
midnight-contract-testing-tutorial/
├── .github/
│   └── workflows/
│       └── ci.yml          # CI/CD Pipeline Configuration
├── src/
│   └── contract-simulator.ts  # Contract Simulator Implementation
├── tests/
│   └── contract-simulator.test.ts  # Test Suite with 24 Comprehensive Tests
├── TUTORIAL_DRAFT.md       # Complete Tutorial Documentation
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── LICENSE
└── README.md
```

## Tutorial Documentation

The step-by-step tutorial can be found in [TUTORIAL_DRAFT.md](./TUTORIAL_DRAFT.md), covering:

1. Project initialization and tooling installation
2. Building the contract simulator
3. Writing unit tests and testing edge cases
4. Setting up GitHub Actions for automated testing
5. Best practices for contract testing

## Submission Information

- **Code Repository**: https://github.com/shafiradev62-bit/Midnight-Contract-Testing-Tutorial
- **Tutorial**: [TUTORIAL_DRAFT.md](./TUTORIAL_DRAFT.md)
- **Issue Reference**: https://github.com/midnightntwrk/contributor-hub/issues/312
