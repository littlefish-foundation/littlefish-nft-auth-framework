import React, { useState, useContext, createContext, useCallback, useEffect, ReactNode, FC } from "react";
import cbor from "cbor-js";

type Asset = {
  policyID: string;
  assetName: string;
  amount: number;
}

declare global {
  interface Window {
    cardano: any;
  }
}

type WalletContextProps = {
  isConnected: boolean;
  assets: Asset[];
  connectedWalletId: string | null;
  connectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: () => void;
  decodeHexToAscii: (processedArray: Asset[]) => Asset[];
  isClient: boolean;
  wallets: string[];
}
const defaultContext: WalletContextProps = {
  isConnected: false,
  assets: [],
  connectedWalletId: null,
  connectWallet: async (walletName: string) => { console.log(`Connecting to ${walletName}`); },
  disconnectWallet: () => { console.log("Disconnecting wallet"); },
  decodeHexToAscii: (processedArray: any[]) => processedArray,
  isClient: false,
  wallets: [],
};

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

  function decodeHexToAscii(processedArray: Asset[]): Asset[] {
    return processedArray.map((item) => {
      const { policyID, assetName, amount } = item;
      const decodedAssetName = hexToString(assetName);
      return {
        policyID: policyID,
        assetName: decodedAssetName,
        amount: amount,
      };
    });
  }

  function hexToString(hex: string): string {
    const hexes = hex.match(/.{1,2}/g) || [];
    let result = "";
    for (let j = 0; j < hexes.length; j++) {
      result += String.fromCharCode(parseInt(hexes[j], 16));
    }
    return result;
  }

  function processAssets(inputArray: any[]): Asset[] {
    const results: Asset[] = [];
  
    inputArray.forEach((row) => {
      if (row.length === 3) {
        // Assuming row is [policyID, assetName, amount]
        const asset: Asset = {
          policyID: row[0],
          assetName: row[1],
          amount: row[2]
        };
        results.push(asset);
      } else {
        let policyID = row[0];
        let i = 1;
        while (i < row.length) {
          if (typeof row[i] === 'string' && row[i].length === 56 && i + 2 < row.length) {
            policyID = row[i];
            i++;
          }
          if (i + 1 < row.length) {
            // Ensure row[i] is treated as assetName and row[i+1] as amount
            const asset: Asset = {
              policyID: policyID,
              assetName: row[i],
              amount: parseInt(row[i + 1], 10) // Convert to number if not already
            };
            results.push(asset);
            i += 2;
          } else {
            break;
          }
        }
      }
    });
    return results;
  }

  useEffect(() => {
    console.log(assets);
    }, [assets]);

  const assetDecoder = (hexDataArray: string[]): any[] => {
    let results: any[] = [];

    hexDataArray.forEach((hexData) => {
      const bytes = new Uint8Array(
        hexData.match(/[\da-f]{2}/gi)?.map((h) => parseInt(h, 16)) || []
      );
      const decoded = cbor.decode(bytes.buffer);

      decoded.forEach((utxo: any[]) => {
        if (
          Array.isArray(utxo) &&
          utxo.length === 2 &&
          Array.isArray(utxo[1])
        ) {
          const [binaryData, details] = utxo;
          const [amount, assets] = details;
          let assetResults: any[] = [];
          Object.entries(assets).forEach(([key, val]) => {
            if (typeof key === "string") {
              const keyBytes = new Uint8Array(key.split(",").map(Number));
              const keyHex: string = byteArrayToHex(keyBytes);
              let assetDetail: any[] = [keyHex];
              let details: any[] = [];
              Object.entries(val as { [s: string]: unknown }).forEach(([innerKey, innerVal], index, array) => {
                if (typeof innerKey === "string") {
                  const innerKeyBytes = new Uint8Array(innerKey.split(",").map(Number));
                  const innerKeyHex: string = byteArrayToHex(innerKeyBytes);
                  assetDetail.push(innerKeyHex, innerVal);
                }
              });
              assetResults.push(assetDetail);
            }
            assetResults = assetResults.flat();
          });
          results.push(assetResults);
        }
      });
    });

    setAssets(results);
    return results;
  };

  const byteArrayToHex = (buffer: Uint8Array): string => {
    return Array.from(buffer, byte => byte.toString(16).padStart(2, "0")).join("");
  };

  const getWallets = useCallback(() => {
    if (isClient && window.cardano) {
      const installedWallets = Object.keys(window.cardano);
      setWallets(
        expectedWallets.filter(wallet => installedWallets.includes(wallet))
      );
    }
  }, [expectedWallets, isClient]);

  const connectWallet = useCallback(async (walletName: string) => {

    if (isClient && window.cardano && window.cardano[walletName]) {
      try {
        const api = await window.cardano[walletName].enable();
        setIsConnected(true);
        setConnectedWalletId(walletName);

        const utxoData = await api.getUtxos();
        const decoded = assetDecoder(utxoData);
        const processed = processAssets(decoded);
        setAssets(processed);
        setUtxos(decoded);
      } catch (error) {
        console.error("Failed to enable the wallet or fetch UTXOs", error);
        setIsConnected(false);
        setConnectedWalletId(null);
      }
    } else {
      console.error("Wallet not found or cardano object not available");
    }
  }, [isClient]);

  const disconnectWallet = useCallback(() => {
    if (isClient) {
      setIsConnected(false);
      setConnectedWalletId(null);
    }
  }, [isClient]);

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
