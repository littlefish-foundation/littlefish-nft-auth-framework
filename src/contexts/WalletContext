import React, { useState, useContext, createContext, useCallback, useEffect } from "react";
import cbor from "cbor-js";

const WalletContext = createContext(null);

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [wallets, setWallets] = useState([]);
    const [connectedWalletId, setConnectedWalletId] = useState(null);
    const [utxos, setUtxos] = useState([]);
    const [assets, setAssets] = useState([]);

    useEffect(() => {
      console.log("Updated Assets:", assets);
    }, [assets]);

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
    
      const byteArrayToHex = (buffer) => {
        return Array.from(buffer, (byte) =>
          byte.toString(16).padStart(2, "0")
        ).join("");
      };
    

    const getWallets = useCallback(() => {
      if (typeof window.cardano !== "undefined") {
        const installedWallets = Object.keys(window.cardano);
        console.log(installedWallets);
        setWallets(
          expectedWallets.filter((wallet) => installedWallets.includes(wallet))
        );
      }
    }, [expectedWallets]);

    const connectWallet = useCallback((walletName) => {
      console.log(`Attempting to connect to wallet: ${walletName}`);
      if (typeof window.cardano !== "undefined" && window.cardano[walletName]) {
        window.cardano[walletName].enable({ extensions: [] })
          .then((api) => {
            console.log("Wallet enabled", api);
            setIsConnected(true);
            setConnectedWalletId(walletName);
            
            api.getUtxos().then((utxoData) => {
              const decoded = assetDecoder(utxoData);
              console.log(decoded);
              setAssets(decoded);
              console.log(assets);
            }).catch((error) => {
              console.error("Failed to get UTXO data", error);
            });
          })
          .catch((error) => {
            console.error("Failed to enable the wallet", error);
          });
      } else {
        console.error("Wallet not found or cardano object not available");
      }
    }, []);
    

    const disconnectWallet = useCallback(() => {
      console.log("Disconnecting wallet...");
      setIsConnected(false);
      setConnectedWalletId(null);  // Clear the connected wallet ID upon disconnect
    }, []);

    return (
      <WalletContext.Provider value={{ isConnected, assets, connectedWalletId, assetDecoder, connectWallet, disconnectWallet, getWallets,
       wallets }}>
        {children}
      </WalletContext.Provider>
    );
  };
