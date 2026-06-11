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

// Deep clone utility for safe state handling
function deepClone<T>(obj: T): T {
  if (typeof structuredClone !== 'undefined') {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}

export class ContractSimulator {
  #state: LedgerState;
  #transactionHistory: Transaction[];
  #contractCode: any;

  constructor(contractCode: any, initialState: LedgerState = {}) {
    this.#contractCode = contractCode;
    this.#state = deepClone(initialState); // Deep clone initial state to prevent external mutations
    this.#transactionHistory = [];
  }

  getState(): LedgerState {
    return deepClone(this.#state); // Always return a copy to prevent external state mutations
  }

  setState(newState: Partial<LedgerState>): void {
    // Create a new state object instead of mutating
    this.#state = {
      ...deepClone(this.#state),
      ...deepClone(newState)
    };
  }

  callMethod(methodName: string, args: any[] = [], caller: string = '0x000000000000000000000000000000000000dEaD'): any {
    // Validate inputs first
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

    // Ensure balances object exists
    const currentState = deepClone(this.#state);
    if (!currentState.balances) {
      currentState.balances = {};
    }

    const balances = currentState.balances;
    const senderBalance = balances[caller] || 0;

    if (senderBalance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Update balances (create new state object)
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

    // Ensure balances object exists
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
