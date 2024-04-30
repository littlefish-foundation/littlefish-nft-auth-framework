import React, {
  useState,
  useContext,
  createContext,
  useCallback,
  useEffect,
  FC,
} from "react";
import cbor from "cbor-js";

interface Asset {
  policyID: string;
  assetName: string;
  amount: number;
}

interface WalletProps {
  isConnected: boolean;
  assets: Asset[];
  connectedWalletId: string | null;
  connectWallet: (walletName: string) => void;
  disconnectWallet: () => void;
  decodeHexToAscii: (processedArray: any[]) => Asset[];
  isClient: boolean;
  wallets: string[];
}

export const WalletContext = createContext<WalletProps | null>(null);

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  const [isClient, setIsClient] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [wallets, setWallets] = useState<string[]>([]);
  const [connectedWalletId, setConnectedWalletId] = useState<string | null>(
    null
  );
  const [utxos, setUtxos] = useState<any[]>([]);
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

  const assetDecoder = (hexDataArray: string[]): any[] => {
    let results: Asset[] = [];

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
            let assetDetail: any[] = [keyHex];
            let details: any[] = [];
            Object.entries(val).forEach(
              ([innerKey, innerVal], index, array) => {
                if (typeof innerKey === "string") {
                  innerKey = new Uint8Array(innerKey.split(",").map(Number));
                }
                const innerKeyHex = byteArrayToHex(innerKey);
                assetDetail.push(innerKeyHex, innerVal);
              }
            );
            assetResults.push(assetDetail);
            assetResults = assetResults.flat();
          });
          results.push(assetResults);
        }
      });
    });
    return results;
  };

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

  const byteArrayToHex = (buffer: Uint8Array): string => {
    return Array.from(buffer, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
  };

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
    return results;
  }

  const getWallets = useCallback(() => {
    if (isClient && window.cardano) {
      const installedWallets = Object.keys(window.cardano);
      setWallets(
        expectedWallets.filter((wallet) => installedWallets.includes(wallet))
      );
    }
    return [];
  }, [expectedWallets, isClient]);

  const connectWallet = useCallback(
    async (walletName: string) => {
      console.log(`Attempting to connect to wallet: ${walletName}`);
      if (isClient && window.cardano && window.cardano[walletName]) {
        try {
          const api = await window.cardano[walletName].enable({
            extensions: [],
          });
          console.log("Wallet enabled", api);
          setIsConnected(true);
          setConnectedWalletId(walletName);

          const utxoData = await api.getUtxos();
          const decoded = assetDecoder(utxoData);
          setUtxos(decoded);
          setAssets(processAssets(decoded));
        } catch (error) {
          console.error("Failed to enable the wallet or fetch UTXOs", error);
        }
      } else {
        console.error("Wallet not found or cardano object not available");
      }
    },
    [
      setIsConnected,
      setConnectedWalletId,
      setUtxos,
      setAssets,
      window.cardano,
      isClient,
    ]
  );

  const disconnectWallet = useCallback(() => {
    if (isClient) {
      console.log("Disconnecting wallet...");
      setIsConnected(false);
      setConnectedWalletId(null);
    }
  }, [isClient]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        assets,
        connectedWalletId,
        connectWallet,
        disconnectWallet,
        decodeHexToAscii,
        isClient,
        wallets,
      }}
    >
      {isClient ? children : null}
    </WalletContext.Provider>
  );
};


