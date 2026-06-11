# How to Test Midnight Compact Contracts Like a Pro

## Introduction

The first Compact contract I wrote on Midnight was much simpler in my head than it was in reality.

At first, everything seemed fine. The contract compiled, the logic looked correct, and the output matched what I expected. But after adding a few more features, I started noticing something familiar: every small change created a new opportunity to break something else.

I found myself repeatedly running the same checks manually.

Did minting still work?

Did transfers still update balances correctly?

Did edge cases still behave as expected?

After doing this for a few days, it became obvious that I needed a better approach.

That's when I started building a local testing setup.

Instead of deploying or relying on a full environment every time I wanted to verify contract logic, I created a simple simulator in TypeScript that behaved similarly to a Compact contract. Then I added automated tests with Vitest and connected everything to GitHub Actions so tests would run automatically whenever I pushed code.

The setup turned out to be much simpler than I expected, and it immediately improved my development workflow.

In this guide, I'll show you exactly how I built it, what mistakes I made along the way, and how you can create your own testing pipeline for Compact contracts.

By the end, you'll have a local simulator, automated tests, and a CI workflow that helps catch problems before they ever reach production.

---

## Prerequisites

Before we start, make sure you have a few things installed.

You'll need:

* Node.js 18 or newer
* npm
* A code editor (I use VS Code)
* Basic JavaScript or TypeScript knowledge

You don't need to be an expert in testing frameworks or blockchain development to follow along. If you've written a few JavaScript functions before, you'll be fine.

I also recommend spending a little time with Midnight's documentation if you're completely new to Compact contracts. Understanding how contract state works will make the testing examples much easier to understand.

To verify your Node installation, run:

```bash
node --version
npm --version
```

You should see something similar to:

```bash
v20.11.0
10.2.4
```

Once that's ready, we can start building our project.

---

## Setting Up Our Project

I like starting with a clean structure because it makes everything easier later.

Create a new project folder:

```bash
mkdir midnight-testing
cd midnight-testing
```

Initialize the project:

```bash
npm init -y
```

Now install the tools we'll need:

```bash
npm install -D typescript vitest ts-node @types/node
```

After installation, update your `package.json` scripts:

```json
{
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Next, create a TypeScript configuration file.

```bash
npx tsc --init
```

Replace the generated content with:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "strict": true,
    "types": ["vitest/globals", "node"],
    "outDir": "./dist"
  },
  "include": ["src", "tests"]
}
```

One mistake I made the first time was forgetting to add `"vitest/globals"`.

The tests actually worked, but my editor showed errors everywhere because TypeScript couldn't recognize functions like `describe()`, `it()`, and `expect()`.

Adding the Vitest types fixed everything immediately.

Now create a Vitest configuration file called `vitest.config.ts`.

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node"
  }
});
```

Finally, create the folder structure:

```text
midnight-testing/
├── src/
├── tests/
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

With the project ready, we can move on to the part that actually makes testing easy.

---

## Building Our Contract Simulator

When I first started experimenting with testing, I made a classic mistake.

I tried to recreate every possible feature of a real contract.

Permissions.

Events.

Transaction history.

Complex validation.

The simulator became so complicated that debugging it was harder than debugging the contract itself.

Eventually I realized something important:

The simulator only needs enough functionality to test the logic you're writing.

For this example, we'll build a simple token contract simulator.

Create a file called:

```text
src/contract-simulator.ts
```

And add the following code:

```ts
export class ContractSimulator {
  private balances: Map<string, number>;

  constructor() {
    this.balances = new Map();
  }

  balanceOf(address: string): number {
    return this.balances.get(address) || 0;
  }

  mint(address: string, amount: number): void {
    const currentBalance = this.balanceOf(address);

    this.balances.set(
      address,
      currentBalance + amount
    );
  }

  transfer(
    from: string,
    to: string,
    amount: number
  ): boolean {
    const senderBalance =
      this.balanceOf(from);

    if (senderBalance < amount) {
      return false;
    }

    this.balances.set(
      from,
      senderBalance - amount
    );

    const receiverBalance =
      this.balanceOf(to);

    this.balances.set(
      to,
      receiverBalance + amount
    );

    return true;
  }
}
```

Let's break down what's happening.

The contract state is represented by a JavaScript `Map`.

```ts
private balances: Map<string, number>;
```

This allows us to store balances for different users.

The `mint()` function increases a user's balance.

```ts
simulator.mint("alice", 100);
```

After calling that function, Alice owns 100 tokens.

The `transfer()` function performs a simple balance check before moving tokens between accounts.

```ts
simulator.transfer(
  "alice",
  "bob",
  50
);
```

If Alice has enough tokens, the transfer succeeds.

If she doesn't, the function returns `false`.

It's intentionally simple, but that's exactly what we want.

A lightweight simulator gives us fast feedback during development.

---

## Writing Our First Tests

Now comes my favorite part.

Let's actually verify that the simulator behaves correctly.

Create a new file:

```text
tests/contract-simulator.test.ts
```

Add the following code:

```ts
import {
  describe,
  expect,
  it,
  beforeEach
} from "vitest";

import { ContractSimulator }
from "../src/contract-simulator";

describe("Contract Simulator", () => {
  let simulator: ContractSimulator;

  beforeEach(() => {
    simulator = new ContractSimulator();
  });

  it("starts with zero balance", () => {
    expect(
      simulator.balanceOf("alice")
    ).toBe(0);
  });

  it("mints tokens correctly", () => {
    simulator.mint("alice", 100);

    expect(
      simulator.balanceOf("alice")
    ).toBe(100);
  });

  it("transfers tokens correctly", () => {
    simulator.mint("alice", 100);

    const success =
      simulator.transfer(
        "alice",
        "bob",
        50
      );

    expect(success).toBe(true);

    expect(
      simulator.balanceOf("alice")
    ).toBe(50);

    expect(
      simulator.balanceOf("bob")
    ).toBe(50);
  });

  it("rejects invalid transfers", () => {
    simulator.mint("alice", 20);

    const success =
      simulator.transfer(
        "alice",
        "bob",
        100
      );

    expect(success).toBe(false);

    expect(
      simulator.balanceOf("alice")
    ).toBe(20);
  });
});
```

One lesson I learned very quickly is that tests should never share state.

Before I added the `beforeEach()` block, I kept getting strange failures that seemed random.

They weren't random.

One test was accidentally affecting another.

Creating a fresh simulator before every test solved the problem completely.

Run the tests:

```bash
npm run test
```

If everything is configured correctly, you'll see output similar to:

```bash
✓ starts with zero balance
✓ mints tokens correctly
✓ transfers tokens correctly
✓ rejects invalid transfers
```

Seeing all green checkmarks is surprisingly satisfying.

---

## Testing Edge Cases

Basic functionality is important, but edge cases are where bugs usually hide.

For example, what happens if someone tries to transfer more tokens than they own?

We already covered that.

But what about multiple transfers?

Let's add another test:

```ts
it("handles multiple transfers", () => {
  simulator.mint("alice", 500);

  simulator.transfer(
    "alice",
    "bob",
    100
  );

  simulator.transfer(
    "alice",
    "charlie",
    150
  );

  expect(
    simulator.balanceOf("alice")
  ).toBe(250);

  expect(
    simulator.balanceOf("bob")
  ).toBe(100);

  expect(
    simulator.balanceOf("charlie")
  ).toBe(150);
});
```

This type of test catches issues that don't always appear during manual testing.

As your Compact contracts become more sophisticated, you'll want to add tests for:

* Permission checks
* Invalid inputs
* State transitions
* Contract upgrades
* Error handling

The more critical the logic, the more valuable these tests become.

---

## Setting Up GitHub Actions CI

Running tests locally is useful.

Running them automatically is even better.

There have been multiple occasions where I was convinced everything worked perfectly, only for CI to tell me otherwise a few minutes later.

Create a workflow file:

```text
.github/workflows/ci.yml
```

Add this configuration:

```yaml
name: Midnight Contract Tests

on:
  push:
    branches:
      - main

  pull_request:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm ci

      - name: Run Tests
        run: npm run test
```

The workflow is simple.

Whenever code is pushed or a pull request is opened, GitHub automatically:

1. Downloads the repository
2. Installs Node.js
3. Installs dependencies
4. Runs the test suite

One small detail that's worth mentioning:

Use `npm ci` instead of `npm install`.

I learned that lesson after several frustrating CI failures caused by dependency mismatches.

`npm ci` guarantees consistent installations based on your lock file.

Since switching to it, my CI builds have been much more reliable.

---

## What's Next?

At this point, you already have a solid testing foundation.

You can write contract logic locally, verify it using automated tests, and rely on GitHub Actions to catch issues before they reach production.

But there's still plenty of room to expand this workflow.

A few ideas worth exploring are:

* Integration testing with local environments
* Property-based testing
* Fuzz testing
* Coverage reporting
* More advanced Compact contract simulations

One thing I've noticed is that every contract project eventually develops its own testing style.

The important part isn't having a perfect setup from day one.

The important part is having a setup that makes testing easy enough that you'll actually do it.

---

## Conclusion

Testing was something I used to treat as an afterthought.

Now it's one of the first things I set up whenever I start a new project.

The reason is simple: debugging after deployment is always more painful than catching problems locally.

By building a small simulator, writing automated tests, and connecting everything to GitHub Actions, you create a safety net that grows alongside your project.

The examples in this guide are intentionally simple, but the same principles apply to much larger Compact contracts.

Start small.

Write tests early.

Add more coverage as your contract evolves.

Your future self will thank you for it.

Happy coding, and see you on Midnight Network.
