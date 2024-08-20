interface Window {
    ethereum?: {
      isMetaMask?: boolean; // Optional property to check if MetaMask is installed
      request: (args: { method: string, params?: Array<any> }) => Promise<any>;
    };
  }
  
  declare var window: Window;
  
  interface SolanaProvider {
    isPhantom?: boolean; // Specific to Phantom wallet
    publicKey: {
      toString(): string;
    };
    signTransaction: (transaction: any) => Promise<any>;
    signAllTransactions: (transactions: any[]) => Promise<any[]>;
    signAndSendTransaction: (transaction: any) => Promise<{ signature: string }>;
    connect: () => Promise<{ publicKey: string }>;
    disconnect: () => Promise<void>;
    on: (event: string, handler: (args: any) => void) => void;
    request: (args: { method: string, params?: Array<any> }) => Promise<any>;
  }
  
  interface Window {
    solana?: SolanaProvider;
  }
  
  declare var window: Window;

  