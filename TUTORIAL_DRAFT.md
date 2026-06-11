# Testing Midnight Compact Contracts: A Comprehensive Guide

## Abstract

This guide outlines a complete methodology for testing Midnight Compact contracts. We cover setting up a local development environment, building a contract simulator, writing comprehensive unit tests, and implementing an automated CI/CD pipeline using GitHub Actions. The approach balances speed of development with robustness, ensuring that contract logic is thoroughly validated before deployment.

## 1. Introduction

Testing smart contracts is a critical component of blockchain development. Given the immutable nature of deployed contracts, identifying and fixing issues before deployment is essential to prevent financial losses and security vulnerabilities. This guide provides a step-by-step approach to building a testing framework for Midnight Compact contracts.

## 2. Prerequisites

Before proceeding, ensure the following tools are installed and configured:

- Node.js (version 18 or higher)
- npm or Yarn package manager
- A code editor (e.g., VS Code) with TypeScript support
- Basic familiarity with TypeScript and smart contract concepts

## 3. Project Setup

### 3.1 Initialize Project

Create a new directory and initialize an npm project:

```bash
mkdir midnight-contract-testing
cd midnight-contract-testing
npm init -y
```

### 3.2 Install Dependencies

Install the necessary development dependencies:

```bash
npm install -D typescript vitest ts-node @types/node @vitest/coverage-v8
```

### 3.3 Configure TypeScript

Create a `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 3.4 Configure Vitest

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts"]
    }
  }
});
```

### 3.5 Update package.json Scripts

Modify `package.json` to include the following scripts:

```json
{
  "scripts": {
    "dev": "vitest",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  }
}
```

## 4. Building the Contract Simulator

The contract simulator is a key component of this testing framework. It replicates the behavior of a Compact contract in a local environment, allowing for fast and deterministic testing.

### 4.1 Deep Clone Utility

Implement a deep cloning function to ensure state immutability:

```typescript
function deepClone<T>(obj: T): T {
  if (typeof structuredClone !== 'undefined') {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}
```

### 4.2 Contract Simulator Class

Create `src/contract-simulator.ts`:

```typescript
export interface LedgerState {
  [key: string]: any;
}

export interface Transaction {
  from: string;
  to: string;
  value: number;
  data?: any;
  timestamp: number;
}

export class ContractSimulator {
  #state: LedgerState;
  #transactionHistory: Transaction[];
  #contractCode: any;

  constructor(contractCode: any, initialState: LedgerState = {}) {
    this.#contractCode = contractCode;
    this.#state = deepClone(initialState);
    this.#transactionHistory = [];
  }

  getState(): LedgerState {
    return deepClone(this.#state);
  }

  setState(newState: Partial<LedgerState>): void {
    this.#state = {
      ...deepClone(this.#state),
      ...deepClone(newState)
    };
  }

  callMethod(methodName: string, args: any[] = [], caller: string = '0x000000000000000000000000000000000000dEaD'): any {
    if (typeof methodName !== 'string' || methodName.trim() === '') {
      throw new Error('Invalid method name');
    }
    if (!Array.isArray(args)) {
      throw new Error('Args must be an array');
    }
    if (typeof caller !== 'string' || caller.trim() === '') {
      throw new Error('Invalid caller address');
    }

    const tx: Transaction = {
      from: caller,
      to: 'contract',
      value: 0,
      data: { methodName, args: deepClone(args) },
      timestamp: Date.now()
    };
    this.#transactionHistory.push(deepClone(tx));

    switch (methodName) {
      case 'transfer':
        return this.#handleTransfer(args, caller);
      case 'mint':
        return this.#handleMint(args, caller);
      case 'balanceOf':
        return this.#handleBalanceOf(args);
      default:
        throw new Error(`Method '${methodName}' not implemented`);
    }
  }

  #handleTransfer(args: any[], caller: string): { success: boolean; error?: string } {
    const [to, amount] = args;

    if (typeof to !== 'string' || to.trim() === '') {
      return { success: false, error: 'Invalid recipient address' };
    }
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return { success: false, error: 'Invalid amount' };
    }

    const currentState = deepClone(this.#state);
    if (!currentState.balances) {
      currentState.balances = {};
    }

    const balances = currentState.balances;
    const senderBalance = balances[caller] || 0;

    if (senderBalance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    balances[caller] = senderBalance - amount;
    balances[to] = (balances[to] || 0) + amount;
    this.#state = currentState;

    return { success: true };
  }

  #handleMint(args: any[], caller: string): { success: boolean; error?: string } {
    const [to, amount] = args;

    if (typeof to !== 'string' || to.trim() === '') {
      return { success: false, error: 'Invalid recipient address' };
    }
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return { success: false, error: 'Invalid amount' };
    }

    const currentState = deepClone(this.#state);
    if (!currentState.balances) {
      currentState.balances = {};
    }

    const balances = currentState.balances;
    balances[to] = (balances[to] || 0) + amount;
    this.#state = currentState;

    return { success: true };
  }

  #handleBalanceOf(args: any[]): number {
    const [address] = args;
    if (typeof address !== 'string') {
      return 0;
    }
    const balances = this.#state.balances || {};
    return balances[address] || 0;
  }

  getTransactionHistory(): Transaction[] {
    return deepClone(this.#transactionHistory);
  }

  reset(initialState: LedgerState = {}): void {
    this.#state = deepClone(initialState);
    this.#transactionHistory = [];
  }
}

function deepClone<T>(obj: T): T {
  if (typeof structuredClone !== 'undefined') {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}
```

## 5. Writing Unit Tests

Create comprehensive unit tests in `tests/contract-simulator.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ContractSimulator } from '../src/contract-simulator';

const ALICE = '0x742d35Cc6634C0532925a3b81127179012922666';
const BOB = '0x60aE616a21558eCa24704686051973696e2427a9';
const CHARLIE = '0x429d198297323c970196e25a9008350c6357a104';
const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD';

describe('Contract Simulator', () => {
  let simulator: ContractSimulator;

  beforeEach(() => {
    simulator = new ContractSimulator({});
  });

  describe('State Management', () => {
    it('initializes with empty state', () => {
      expect(simulator.getState()).toEqual({});
    });

    it('supports state updates and retrievals', () => {
      simulator.setState({ owner: ALICE });
      expect(simulator.getState().owner).toEqual(ALICE);
    });

    it('resets to initial state correctly', () => {
      simulator.setState({ owner: ALICE, totalSupply: 1000 });
      simulator.reset();
      expect(simulator.getState()).toEqual({});
    });

    it('returns copies of state to prevent mutation', () => {
      const state = simulator.getState();
      state.mutated = 'should not affect internal state';
      expect(simulator.getState()).toEqual({});
    });
  });

  describe('Token Operations', () => {
    describe('Minting', () => {
      it('mints tokens to specified address', () => {
        const result = simulator.callMethod('mint', [ALICE, 100], ALICE);
        expect(result.success).toBe(true);
        expect(simulator.callMethod('balanceOf', [ALICE])).toBe(100);
      });

      it('rejects invalid mint amounts', () => {
        expect(simulator.callMethod('mint', [ALICE, -100], ALICE).success).toBe(false);
        expect(simulator.callMethod('mint', [ALICE, 0], ALICE).success).toBe(false);
        expect(simulator.callMethod('mint', [ALICE, Infinity], ALICE).success).toBe(false);
      });
    });

    describe('Transfers', () => {
      beforeEach(() => {
        simulator.callMethod('mint', [ALICE, 200], ALICE);
      });

      it('transfers tokens between addresses', () => {
        const result = simulator.callMethod('transfer', [BOB, 100], ALICE);
        expect(result.success).toBe(true);
        expect(simulator.callMethod('balanceOf', [ALICE])).toBe(100);
        expect(simulator.callMethod('balanceOf', [BOB])).toBe(100);
      });

      it('fails when sender has insufficient balance', () => {
        const result = simulator.callMethod('transfer', [BOB, 250], ALICE);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Insufficient balance');
      });
    });
  });
});
```

## 6. CI/CD Pipeline Configuration

Set up GitHub Actions for automated testing in `.github/workflows/ci.yml`:

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Run tests
        run: npm test

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build library
        run: npm run build
```

## 7. Best Practices

- **Test Isolation**: Always reset state between tests to prevent cross-test contamination
- **Edge Case Coverage**: Test invalid inputs, boundary values, and failure modes
- **Immutability**: Use deep cloning to prevent accidental state mutations
- **CI/CD**: Automate testing to ensure regressions are caught early
- **Documentation**: Maintain clear documentation of the testing framework and test cases

## 8. Conclusion

This guide has provided a complete framework for testing Midnight Compact contracts. By implementing the simulator, comprehensive tests, and automated CI/CD pipeline, developers can significantly improve the reliability and security of their contracts. The methodologies outlined here can be extended to cover more complex contract logic and integration testing with local Midnight devnets.
