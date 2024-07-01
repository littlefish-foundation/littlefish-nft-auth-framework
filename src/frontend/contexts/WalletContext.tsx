import React, {
  useState,
  useContext,
  createContext,
  useEffect,
  ReactNode,
  FC,
} from "react";
import { getWallets, connectWallet, disconnectWallet } from "../api/cardanoAPI";
import { Asset, WalletContextProps, Wallet } from "../types/types";
import { decodeHexToAscii } from "../utils/utils";

// Define the default context to initialize the context
const defaultContext: WalletContextProps = {
  isConnected: false,
  assets: [],
  connectedWallet: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  decodeHexToAscii: (processedArray) => processedArray,
  isClient: true,
  wallets: [],
  networkID: 0,
  addresses: [""],
  balance: 0,
};

// Create a context for the wallet
const WalletContext = createContext<WalletContextProps>(defaultContext);

// Create a custom hook to use the wallet context
export const useWallet = () => useContext(WalletContext);

export type WalletProviderProps = {
  children: ReactNode;
};

// Create a provider component to wrap the application with the wallet context
export const WalletProvider: FC<WalletProviderProps> = ({
  children,
}: WalletProviderProps) => {
  // Define the state variables for the wallet context
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [connectedWallet, setConnectedWallet] = useState<Wallet | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isClient, setIsClient] = useState<boolean>(true);
  const [networkID, setNetworkID] = useState<number>(0);
  const [addresses, setAddresses] = useState<[string]>([""]);
  const [balance, setBalance] = useState<number>(0);

  // Define the functions to handle connecting the wallet
  const handleConnectWallet = async (wallet: Wallet) => {
    const [success, walletId, walletAssets, address, network, balance] =
      await connectWallet(wallet.name, isClient, isConnected);
    if (success && walletId && walletAssets) {
      setIsConnected(true);
      setConnectedWallet(wallet);
      setAssets(walletAssets);
      setNetworkID(network);
      setAddresses(address);
      setBalance(balance);

      localStorage.setItem(
        "walletConnected",
        JSON.stringify({
          wallet,
          walletAssets,
          network,
          address,
          balance,
        })
      );
    }
  };

  // Define the function to handle disconnecting the wallet
  const handleDisconnectWallet = () => {
    disconnectWallet(isClient, isConnected);
    setIsConnected(false);
    setConnectedWallet(null);
    setAssets([]);
    setNetworkID(0);
    setAddresses([""]);
    setBalance(0);
    localStorage.removeItem("walletConnected");
  };

  // Fetch the installed wallets when the component mounts
  useEffect(() => {
    setIsClient(typeof window !== "undefined");
    const fetchInstalledWallets = async () => {
      if (isClient) {
        try {
          const installedWallets = await getWallets(isClient);
          setWallets(installedWallets); // Fix: Provide an empty array as the default value
        } catch (error) {
          console.error("Failed to fetch installed wallets", error);
        }
      }
    };
    fetchInstalledWallets();
    const savedWalletConnection = localStorage.getItem("walletConnected");
    if (savedWalletConnection) {
      const { wallet, walletAssets, network, address, balance } = JSON.parse(
        savedWalletConnection
      );
      async () => await window.cardano[wallet.name].enable();
      setIsConnected(true);
      setConnectedWallet(wallet);
      setAssets(walletAssets);
      setNetworkID(network);
      setAddresses(address);
      setBalance(balance);
    }
  }, [isClient]);

  // Define the function to decode hexadecimal strings to ASCII
  const handleDecodeHexToAscii = (processedArray: Asset[]): Asset[] => {
    return decodeHexToAscii(processedArray);
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        assets,
        connectedWallet,
        connectWallet: handleConnectWallet,
        disconnectWallet: handleDisconnectWallet,
        decodeHexToAscii: handleDecodeHexToAscii,
        isClient,
        wallets,
        addresses,
        networkID,
        balance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
