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
  decodeHexToAscii: (processedArray: any[]) => Asset[];
  isClient: boolean;
  wallets: string[];
}

const WalletContext = createContext<WalletContextProps | null>(null);

export const useWallet = () => useContext(WalletContext);

type WalletProviderProps = {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }: WalletProviderProps): JSX.Element => {
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
  }, [isClient]);

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

  function processAssets(inputArray: any[]): any[] {
    const results: any[] = [];
    inputArray.forEach((row) => {
      if (row.length === 3) {
        results.push(row);
      } else {
        let policyID = row[0];
        let i = 1;
        while (i < row.length) {
          if (row[i].length === 56 && i + 2 < row.length) {
            policyID = row[i];
            i++;
          }
          if (i + 1 < row.length) {
            results.push([policyID, row[i], row[i + 1]]);
            i += 2;
          } else {
            break;
          }
        }
      }
    });
    console.log(results)
    return results;
  }

  const assetDecoder = (hexDataArray: string[]): any[] => {
    let results: any[] = [];

    hexDataArray.forEach((hexData) => {
      const bytes = new Uint8Array(
        hexData.match(/[\da-f]{2}/gi).map((h) => parseInt(h, 16))
      );
      const decoded = cbor.decode(bytes.buffer);

      decoded.forEach((utxo) => {
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
              key = new Uint8Array(key.split(",").map(Number));
            }
            const keyHex = byteArrayToHex(key);
            let assetDetail = [keyHex];
            let details = [];
            Object.entries(val).forEach(
              ([innerKey, innerVal], index, array) => {
                if (typeof innerKey === "string") {
                  innerKey = new Uint8Array(innerKey.split(",").map(Number));
                }
                const innerKeyHex = byteArrayToHex(innerKey);
                //console.log(innerKeyHex, innerVal);
                assetDetail.push(innerKeyHex, innerVal);
                //console.log(assetDetail);
              });
            assetResults.push(assetDetail);
            assetResults = assetResults.flat();
            //console.log(assetResults);
          });
          results.push(assetResults);
          //results = results.flat();
          //console.log(results)
        }
      });
    });

    setAssets(results);
    console.log(results)
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
        setUtxos(decoded);
        setAssets(processAssets(decoded)); // Assuming processAssets is integrated here
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
