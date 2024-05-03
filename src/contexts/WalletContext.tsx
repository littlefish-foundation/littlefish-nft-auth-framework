import React, { useState, useContext, createContext, useEffect, ReactNode, FC } from "react";
import { getWallets, connectWallet, disconnectWallet } from "../api/cardanoAPI";
import { Asset, WalletContextProps } from "../types/types";

const defaultContext: WalletContextProps = {
  isConnected: false,
  setIsConnected: () => {},
  assets: [],
  setAssets: () => {},
  connectedWalletId: null,
  setConnectedWalletId: () => {},
  connectWallet: async () => {},
  disconnectWallet: () => {},
  decodeHexToAscii: (processedArray) => processedArray,
  isClient: true,
  setIsClient: () => {},
  wallets: [],
  setWallets: () => {},
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

  const handleConnectWallet = async (walletName: string) => {
    const [success, walletId, walletAssets] = await connectWallet(walletName, isClient, isConnected);
    if (success && walletId && walletAssets) {
      setIsConnected(true);
      setConnectedWalletId(walletId);
      setAssets(walletAssets);
    }
  };

  const handleDisconnectWallet = () => {
    const [success, disconnectedWalletId] = disconnectWallet(isClient, isConnected);
    if (success && disconnectedWalletId) {
      setIsConnected(false);
      setConnectedWalletId(null);
      setAssets([]);
    }
  };

  useEffect(() => {
    setIsClient(typeof window !== "undefined");
    if (isClient) {
      const installedWallets = getWallets(isClient);
      setWallets(installedWallets);
    }
  }, [isClient]);

  const handleDecodeHexToAscii = (processedArray: Asset[]): Asset[] => {
    return decodeHexToAscii(processedArray);
  };

  return (
    <WalletContext.Provider value={{
      isConnected,
      setIsConnected,
      assets,
      setAssets,
      connectedWalletId,
      setConnectedWalletId,
      connectWallet: handleConnectWallet,
      disconnectWallet: handleDisconnectWallet,
      decodeHexToAscii: handleDecodeHexToAscii,
      isClient,
      setIsClient,
      wallets,
      setWallets,
    }}>
      {children}
    </WalletContext.Provider>
  );
};
