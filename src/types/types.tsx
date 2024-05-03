export type Asset = {
  policyID: string;
  assetName: string;
  amount: number;
};

export type WalletContextProps = {
  isConnected: boolean;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  connectedWalletId: string | null;
  setConnectedWalletId: React.Dispatch<React.SetStateAction<string | null>>;
  connectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: () => void;
  decodeHexToAscii: (processedArray: Asset[]) => Asset[];
  isClient: boolean;
  setIsClient: React.Dispatch<React.SetStateAction<boolean>>;
  wallets: string[];
  setWallets: React.Dispatch<React.SetStateAction<string[]>>;
};
