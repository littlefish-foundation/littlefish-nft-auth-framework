"use client";
import React, { useState, useEffect } from "react";
import { useWallet } from "../contexts/WalletContext";
import { Wallet, Asset } from "../types/types";

/**
 * Interface for the WalletConnectButtonProps.
 */
interface WalletConnectButtonProps {
  onAssetSelect: (asset: Asset) => void;
  div1ClassName?: string; // Optional className prop for the container
  buttonClassName?: string; // Optional className prop for buttons
  div2ClassName?: string; // Optional className prop for the dropdown
  imgClassName?: string; // Optional className prop for the image
}

/**
 * A component that displays a button to connect to a wallet.
 */

const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  onAssetSelect,
  div1ClassName = "",
  buttonClassName = "",
  div2ClassName = "",
  imgClassName = ""
}) => {
  // Use the wallet context to get the wallets, connection status, and connect/disconnect functions
  const {
    wallets, // The wallets available to connect to
    isConnected, // A boolean indicating if the wallet is connected
    connectWallet, // A function to connect to a wallet
    disconnectWallet, // A function to disconnect the wallet
    connectedWalletId, // The ID of the connected wallet
    assets, // The assets associated with the connected wallet
    decodeHexToAscii, // A function to decode hex strings to ASCII
  } = useWallet();
  const [decodedAssets, setDecodedAssets] = useState<Asset[]>([]);

  useEffect(() => {
    if (assets && Array.isArray(assets)) {
      setDecodedAssets(decodeHexToAscii(assets));
    }
  }, [assets]);

  // State to manage the visibility of the dropdown
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [assetDropdownVisible, setAssetDropdownVisible] = useState(false);

  // State to manage the wallet name and icon
  const [walletName, setWalletName] = useState<string>("");
  const [walletIcon, setWalletIcon] = useState<string>("");

  // Function to toggle the doropdown menu visibility
  const handleConnectClick = () => {
    setDropdownVisible(!dropdownVisible);
  };

  // Function to handle the wallet selection and connection
  const handleWalletClick = (wallet: Wallet) => {
    connectWallet(wallet.name);
    setWalletName(wallet.name);
    setWalletIcon(wallet.icon);
    setDropdownVisible(false); // Close the dropdown after selecting a wallet
  };

  const handleAssetDropdownClick = () => {
    setAssetDropdownVisible(!assetDropdownVisible);
  };

  const handleAssetClick = (asset: Asset) => {
    onAssetSelect(asset);
    setAssetDropdownVisible(false);
  };

  return (
    <div className={`container ${div1ClassName}`}>
      {isConnected ? (
        <>
          <button className={`button ${buttonClassName}`} onClick={() => disconnectWallet()}>
            Disconnect {connectedWalletId}
          </button>
          {assets.length > 0 && (
            <button className={`button ${buttonClassName}`} onClick={() => handleAssetDropdownClick()}>
              <p>You can authenticate with Asset</p>
            </button>
          )}
          {assetDropdownVisible && (
            <div className={`dropdown ${div2ClassName}`}>
              {decodedAssets.map((asset, index) => (
                <button
                  className={`button ${buttonClassName}`}
                  key={index}
                  onClick={() => handleAssetClick(assets[index])}
                >
                  
                  <p className="assetName">Select {asset.assetName}</p>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        // Display the connect button and the dropdown menu if the wallet is not connected
        <div className={`container ${div1ClassName}`}>
          <button className={`button ${buttonClassName}`} onClick={() => handleConnectClick()}>
            Connect Wallet
          </button>
          {dropdownVisible && (
            // Display the dropdown menu with the available wallets if the dropdown is visible
            <div className={`dropdown ${div2ClassName}`}>
              {wallets.map((wallet, index) => (
                <button
                  className={`${buttonClassName}`}
                  key={index}
                  onClick={() => handleWalletClick(wallet)}
                >
                  <img
                        src={wallet.icon}
                        alt={wallet.name}
                        className={`${imgClassName} ${
                          wallet.name !== connectedWalletId ? "grayscale" : ""
                        }`} // Corrected condition
                      />
                      
                  <span>
                    {wallet.name !== "typhoncip30" ? wallet.name.charAt(0).toUpperCase() + wallet.name.slice(1) : "Typhon"}
                  </span>
                  
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default WalletConnectButton;
