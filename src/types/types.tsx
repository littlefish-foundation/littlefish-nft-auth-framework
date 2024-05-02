export type Asset = {
    policyID: string;
    assetName: string;
    amount: number;
  };
  
  export type WalletContextProps = {
    isConnected: boolean;
    assets: Asset[];
    connectedWalletId: string | null;
    connectWallet: (walletName: string) => Promise<void>;
    disconnectWallet: () => void;
    decodeHexToAscii: (processedArray: Asset[]) => Asset[];
    isClient: boolean;
    wallets: string[];
  };
  