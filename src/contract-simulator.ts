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
    this.#state = Object.freeze ? Object.freeze({ ...initialState }) : { ...initialState };
    this.#transactionHistory = [];
  }

  getState(): LedgerState {
    return structuredClone ? structuredClone(this.#state) : JSON.parse(JSON.stringify(this.#state));
  }

  setState(newState: Partial<LedgerState>): void {
    this.#state = { ...this.#state, ...newState };
  }

  callMethod(methodName: string, args: any[] = [], caller: string = '0x000000000000000000000000000000000000dEaD'): any {
    const tx: Transaction = {
      from: caller,
      to: 'contract',
      value: 0,
      data: { methodName, args },
      timestamp: Date.now()
    };
    this.#transactionHistory.push(tx);

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

    if (typeof amount !== 'number' || amount <= 0) {
      return { success: false, error: 'Invalid amount' };
    }

    if (!this.#state.balances) {
      this.#state.balances = {};
    }

    const balances = this.#state.balances;

    if (!balances[caller]) {
      return { success: false, error: 'Insufficient balance' };
    }

    if (balances[caller] < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    balances[caller] -= amount;
    balances[to] = (balances[to] || 0) + amount;

    return { success: true };
  }

  #handleMint(args: any[], caller: string): { success: boolean; error?: string } {
    const [to, amount] = args;

    if (typeof amount !== 'number' || amount <= 0) {
      return { success: false, error: 'Invalid amount' };
    }

    if (!this.#state.balances) {
      this.#state.balances = {};
    }

    const balances = this.#state.balances;
    balances[to] = (balances[to] || 0) + amount;

    return { success: true };
  }

  #handleBalanceOf(args: any[]): number {
    const [address] = args;
    if (!this.#state.balances) return 0;
    return this.#state.balances[address] || 0;
  }

  getTransactionHistory(): Transaction[] {
    return structuredClone ? structuredClone(this.#transactionHistory) : JSON.parse(JSON.stringify(this.#transactionHistory));
  }

  reset(initialState: LedgerState = {}): void {
    this.#state = { ...initialState };
    this.#transactionHistory = [];
  }
}
