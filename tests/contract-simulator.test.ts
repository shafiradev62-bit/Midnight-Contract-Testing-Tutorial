import { describe, it, expect, beforeEach } from 'vitest';
import { ContractSimulator } from '../src/contract-simulator';

const ALICE = '0x742d35Cc6634C0532925a3b81127179012922666';
const BOB = '0x60aE616a21558eCa24704686051973696e2427a9';
const CHARLIE = '0x429d198297323c970196e25a9008350c6357a104';

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

      it('supports multiple mints to same address', () => {
        simulator.callMethod('mint', [ALICE, 50], ALICE);
        simulator.callMethod('mint', [ALICE, 50], ALICE);
        expect(simulator.callMethod('balanceOf', [ALICE])).toBe(100);
      });

      it('rejects invalid mint amounts', () => {
        expect(simulator.callMethod('mint', [ALICE, -100], ALICE).success).toBe(false);
        expect(simulator.callMethod('mint', [ALICE, 0], ALICE).success).toBe(false);
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

      it('records all transactions in history', () => {
        simulator.callMethod('transfer', [BOB, 50], ALICE);
        simulator.callMethod('transfer', [CHARLIE, 50], ALICE);
        expect(simulator.getTransactionHistory().length).toBe(2);
      });
    });
  });
});
