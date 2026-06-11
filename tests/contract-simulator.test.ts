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

    it('returns copies of transaction history to prevent mutation', () => {
      simulator.callMethod('mint', [ALICE, 100], ALICE);
      const history = simulator.getTransactionHistory();
      history[0].from = 'hacked';
      expect(simulator.getTransactionHistory()[0].from).toBe(ALICE);
    });
  });

  describe('Input Validation', () => {
    it('throws error for invalid method name', () => {
      expect(() => simulator.callMethod('', [])).toThrow('Invalid method name');
      expect(() => simulator.callMethod('   ', [])).toThrow('Invalid method name');
      expect(() => simulator.callMethod(123 as any, [])).toThrow('Invalid method name');
    });

    it('throws error for invalid args', () => {
      expect(() => simulator.callMethod('balanceOf', 'not array' as any)).toThrow('Args must be an array');
    });

    it('throws error for invalid caller', () => {
      expect(() => simulator.callMethod('balanceOf', [ALICE], '')).toThrow('Invalid caller address');
      expect(() => simulator.callMethod('balanceOf', [ALICE], '   ')).toThrow('Invalid caller address');
      expect(() => simulator.callMethod('balanceOf', [ALICE], 123 as any)).toThrow('Invalid caller address');
    });

    it('throws error for unknown method', () => {
      expect(() => simulator.callMethod('unknownMethod', [])).toThrow('Method \'unknownMethod\' not implemented');
    });
  });

  describe('Token Operations', () => {
    describe('Minting', () => {
      it('mints tokens to specified address', () => {
        const result = simulator.callMethod('mint', [ALICE, 100], ALICE);
        expect(result.success).toBe(true);
        expect(simulator.callMethod('balanceOf', [ALICE])).toBe(100);
      });

      it('supports multiple mints to same address', () => {
        simulator.callMethod('mint', [ALICE, 50], ALICE);
        simulator.callMethod('mint', [ALICE, 50], ALICE);
        expect(simulator.callMethod('balanceOf', [ALICE])).toBe(100);
      });

      it('rejects invalid mint amounts', () => {
        expect(simulator.callMethod('mint', [ALICE, -100], ALICE).success).toBe(false);
        expect(simulator.callMethod('mint', [ALICE, -100], ALICE).error).toBe('Invalid amount');
        expect(simulator.callMethod('mint', [ALICE, 0], ALICE).success).toBe(false);
        expect(simulator.callMethod('mint', [ALICE, 0], ALICE).error).toBe('Invalid amount');
        expect(simulator.callMethod('mint', [ALICE, Infinity], ALICE).success).toBe(false);
        expect(simulator.callMethod('mint', [ALICE, NaN], ALICE).success).toBe(false);
        expect(simulator.callMethod('mint', [ALICE, '100' as any], ALICE).success).toBe(false);
      });

      it('rejects invalid recipient addresses for mint', () => {
        expect(simulator.callMethod('mint', ['', 100], ALICE).success).toBe(false);
        expect(simulator.callMethod('mint', ['   ', 100], ALICE).success).toBe(false);
        expect(simulator.callMethod('mint', [123, 100], ALICE).success).toBe(false);
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
        expect(simulator.callMethod('balanceOf', [ALICE])).toBe(200);
      });

      it('rejects invalid transfer amounts', () => {
        expect(simulator.callMethod('transfer', [BOB, -50], ALICE).success).toBe(false);
        expect(simulator.callMethod('transfer', [BOB, 0], ALICE).success).toBe(false);
        expect(simulator.callMethod('transfer', [BOB, Infinity], ALICE).success).toBe(false);
        expect(simulator.callMethod('transfer', [BOB, NaN], ALICE).success).toBe(false);
      });

      it('rejects invalid recipient addresses for transfer', () => {
        expect(simulator.callMethod('transfer', ['', 50], ALICE).success).toBe(false);
        expect(simulator.callMethod('transfer', ['   ', 50], ALICE).success).toBe(false);
      });

      it('records all transactions in history', () => {
        simulator.callMethod('transfer', [BOB, 50], ALICE);
        simulator.callMethod('transfer', [CHARLIE, 50], ALICE);
        expect(simulator.getTransactionHistory().length).toBe(3);
      });

      it('allows transfer to self', () => {
        const result = simulator.callMethod('transfer', [ALICE, 50], ALICE);
        expect(result.success).toBe(true);
        expect(simulator.callMethod('balanceOf', [ALICE])).toBe(200); // Balance remains same
      });

      it('transfers to address with zero balance', () => {
        const result = simulator.callMethod('transfer', [CHARLIE, 50], ALICE);
        expect(result.success).toBe(true);
        expect(simulator.callMethod('balanceOf', [CHARLIE])).toBe(50);
      });
    });

    describe('BalanceOf', () => {
      it('returns 0 for non-existent addresses', () => {
        expect(simulator.callMethod('balanceOf', [BOB])).toBe(0);
      });

      it('returns 0 for invalid address types', () => {
        expect(simulator.callMethod('balanceOf', [123])).toBe(0);
        expect(simulator.callMethod('balanceOf', [null])).toBe(0);
        expect(simulator.callMethod('balanceOf', [undefined])).toBe(0);
      });
    });
  });

  describe('Integration Tests', () => {
    it('handles complex multi-party transfer scenario', () => {
      // Mint to Alice
      simulator.callMethod('mint', [ALICE, 1000], DEAD_ADDRESS);
      const initialBalance = simulator.callMethod('balanceOf', [ALICE]);
      expect(initialBalance).toBe(1000);

      // Alice transfers to Bob and Charlie
      simulator.callMethod('transfer', [BOB, 300], ALICE);
      simulator.callMethod('transfer', [CHARLIE, 200], ALICE);
      expect(simulator.callMethod('balanceOf', [ALICE])).toBe(500);
      expect(simulator.callMethod('balanceOf', [BOB])).toBe(300);
      expect(simulator.callMethod('balanceOf', [CHARLIE])).toBe(200);

      // Bob transfers to Charlie
      simulator.callMethod('transfer', [CHARLIE, 100], BOB);
      expect(simulator.callMethod('balanceOf', [BOB])).toBe(200);
      expect(simulator.callMethod('balanceOf', [CHARLIE])).toBe(300);

      // We don't test exact transaction count since balanceOf adds transactions
      // Just verify all operations worked
    });

    it('resets state correctly after multiple operations', () => {
      simulator.callMethod('mint', [ALICE, 100], DEAD_ADDRESS);
      simulator.callMethod('transfer', [BOB, 50], ALICE);
      simulator.setState({ customField: 'test' });

      simulator.reset();

      expect(simulator.getState()).toEqual({});
      // Check balance without using callMethod (to avoid adding transaction)
      const state = simulator.getState();
      expect(state.balances?.[ALICE]).toBeUndefined();
      expect(simulator.getTransactionHistory().length).toBe(0);
    });
  });
});
