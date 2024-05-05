import React, { useState, useContext, createContext, useEffect, ReactNode, FC } from "react";
import { getWallets, connectWallet, disconnectWallet } from "../api/cardanoAPI";
import { Asset, WalletContextProps } from "../types/types";
import { decodeHexToAscii } from "../utils/utils";

const defaultContext: WalletContextProps = {
  isConnected: false,
  assets: [],
  connectedWalletId: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  decodeHexToAscii: (processedArray) => processedArray,
  isClient: true,
  wallets: [],
};


const WalletContext = createContext<WalletContextProps>(defaultContext);

export const useWallet = () => useContext(WalletContext);

type WalletProviderProps = {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }: WalletProviderProps) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [connectedWalletId, setConnectedWalletId] = useState<string | null>(null);
  const [wallets, setWallets] = useState<string[]>([]);
  const [isClient, setIsClient] = useState<boolean>(true);

  const handleConnectWallet = async (walletName: string) => {
    const [success, walletId, walletAssets] = await connectWallet(walletName, isClient, isConnected);
    if (success && walletId && walletAssets) {
      setIsConnected(true);
      setConnectedWalletId(walletId);
      setAssets(walletAssets);
    }
  };

  const handleDisconnectWallet = () => {
     setIsConnected(disconnectWallet(isClient, isConnected));
    if (!isConnected) {
      setConnectedWalletId(null);
      setAssets([]);
    }
  };

  useEffect(() => {
    setIsClient(typeof window !== "undefined");
    if (isClient) {
      const installedWallets = getWallets(isClient);
      setWallets(installedWallets || []); // Fix: Provide an empty array as the default value
    }
  }, [isClient]);

  const handleDecodeHexToAscii = (processedArray: Asset[]): Asset[] => {
    return decodeHexToAscii(processedArray);
  };

  return (
    <WalletContext.Provider value={{
      isConnected,
      assets,
      connectedWalletId,
      connectWallet: handleConnectWallet,
      disconnectWallet: handleDisconnectWallet,
      decodeHexToAscii: handleDecodeHexToAscii,
      isClient,
      wallets,
    }}>
      {children}
    </WalletContext.Provider>
  );
};
