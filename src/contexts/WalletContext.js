import React, { useState, useContext, createContext, useCallback, useEffect } from "react";
import cbor from "cbor-js";

const WalletContext = createContext(null);

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [connectedWalletId, setConnectedWalletId] = useState(null);
  const [utxos, setUtxos] = useState([]);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    setIsClient(typeof window !== "undefined");
    if (isClient) {
      getWallets();
    }
  }, [isClient, assets]);

  const expectedWallets = [
    "nami",
    "eternl",
    "yoroi",
    "flint",
    "typhon",
    "gerowallet",
    "nufi",
    "lace",
  ];

  const assetDecoder = (hexDataArray) => {
    let results = [];

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
          let assetResults = [];
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

  function decodeHexToAscii(processedArray) {
    return processedArray.map(item => {
      const [policyID, assetHex, amount] = item;
      const assetName = hexToString(assetHex);
      return [policyID, assetName, amount];
    });
  }

  function hexToString(hex) {
    const hexes = hex.match(/.{1,2}/g) || [];
    let result = '';
    for (let j = 0; j < hexes.length; j++) {
      result += String.fromCharCode(parseInt(hexes[j], 16));
    }
    return result;
  }

  const byteArrayToHex = (buffer) => {
    return Array.from(buffer, (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("");
  };

  function processAssets(inputArray) {
    const results = [];
    inputArray.forEach(row => {
      if (row.length === 3) {
        results.push(row);
      } else {
        // Extended processing for longer rows
        let policyID = row[0]; // Initial policy ID
        let i = 1;             // Start from the second element
        while (i < row.length) {
          if (row[i].length === 56 && i + 2 < row.length) {
            // New policy ID found and there are at least two more items (name and amount)
            policyID = row[i];
            i++;
          }
          if (i + 1 < row.length) {
            results.push([policyID, row[i], row[i + 1]]);
            i += 2;  // Move to the next potential asset name
          } else {
            // If there's a hanging element without a pair, break the loop
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
      setWallets(expectedWallets.filter(wallet => installedWallets.includes(wallet)));
    }
    return [];  // Ensure that a value is returned even if `window.cardano` is undefined
  }, [expectedWallets, isClient]);

  const connectWallet = useCallback(async (walletName) => {
    console.log(`Attempting to connect to wallet: ${walletName}`);
    if (isClient && window.cardano && window.cardano[walletName]) {
      try {
        const api = await window.cardano[walletName].enable({ extensions: [] });
        console.log("Wallet enabled", api);
        setIsConnected(true);
        setConnectedWalletId(walletName);

        const utxoData = await api.getUtxos();
        const decoded = assetDecoder(utxoData);
        console.log(decoded);
        setUtxos(decoded);
        setAssets(processAssets(decoded));  // Notice the change here from `utxos` to `decoded`
        console.log(assets);
      } catch (error) {
        console.error("Failed to enable the wallet or fetch UTXOs", error);
      }
    } else {
      console.error("Wallet not found or cardano object not available");
    }
  }, [setIsConnected, setConnectedWalletId, setUtxos, setAssets, window.cardano, isClient]);


  const disconnectWallet = useCallback(() => {
    if (isClient) {
      console.log("Disconnecting wallet...");
      setIsConnected(false);
      setConnectedWalletId(null);
    }  // Clear the connected wallet ID upon disconnect
  }, [isClient]);

  return (
    <WalletContext.Provider value={{
      isConnected, assets, connectedWalletId, connectWallet, disconnectWallet, decodeHexToAscii, isClient,
      wallets
    }}>
      {isClient ? children : null}
    </WalletContext.Provider>
  );
};