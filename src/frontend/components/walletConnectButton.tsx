"use client";
import React, { useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import "./walletConnectButton.css";
import { Wallet } from "../types/types";

/**
 * A component that displays a button to connect to a wallet.
 */

const WalletConnectButton: React.FC = () => {
  // Use the wallet context to get the wallets, connection status, and connect/disconnect functions
  const {
    wallets, // The wallets available to connect to
    isConnected, // A boolean indicating if the wallet is connected
    connectWallet, // A function to connect to a wallet
    disconnectWallet, // A function to disconnect the wallet
    connectedWalletId, // The ID of the connected wallet
  } = useWallet();

  // State to manage the visibility of the dropdown
  const [dropdownVisible, setDropdownVisible] = useState(false);

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

  return (
    <div className="container">
      {isConnected ? (
        <button className="button" onClick={() => disconnectWallet()}>
          Disconnect {connectedWalletId}
        </button>
      ) : (
        // Display the connect button and the dropdown menu if the wallet is not connected
        <div>
          <button className="button" onClick={() => handleConnectClick()}>
            Connect Wallet
          </button>
          {dropdownVisible && (
            // Display the dropdown menu with the available wallets if the dropdown is visible
            <div className="dropdown">
              {wallets.map((wallet, index) => (
                <button
                  className="button"
                  key={index}
                  onClick={() => handleWalletClick(wallet)}
                >
                  <p className="walletName">
                    {wallet.name !== "typhoncip30" ? wallet.name : "typhon"}
                  </p>
                  <img className="image" src={wallet.icon} alt="wallet icon" />
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
