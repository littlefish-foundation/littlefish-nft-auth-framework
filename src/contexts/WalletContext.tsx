import React, { useState, useContext, createContext, useCallback, useEffect, ReactNode, FC } from "react";
import { getWallets, connectWallet, disconnectWallet } from "../api/cardanoAPI";
import { WalletContextProps, Asset } from "../types/types";


const WalletContext = createContext<WalletContextProps>(defaultContext);

export const useWallet = () => useContext(WalletContext);

type WalletProviderProps = {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }: WalletProviderProps) => {
  const [isClient, setIsClient] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [wallets, setWallets] = useState<string[]>([]);
  const [connectedWalletId, setConnectedWalletId] = useState<string | null>(null);
  const [utxos, setUtxos] = useState<any[]>([]); // Use a more specific type if possible
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    setIsClient(typeof window !== "undefined");
    if (isClient) {
      getWallets();
    }
  }, [isClient, assets]);

  const expectedWallets: string[] = [
    "nami",
    "eternl",
    "yoroi",
    "flint",
    "typhon",
    "gerowallet",
    "nufi",
    "lace",
  ];

  useEffect(() => {
    console.log(assets);
    }, [assets]);

  return (
    <WalletContext.Provider value={{
      isConnected,
      assets,
      connectedWalletId,
      connectWallet,
      disconnectWallet,
      decodeHexToAscii,
      isClient,
      wallets,
    }}>
      {children}
    </WalletContext.Provider>
  );
};
