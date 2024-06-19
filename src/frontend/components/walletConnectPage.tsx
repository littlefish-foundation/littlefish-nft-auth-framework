"use client";
import React from "react";
import { useWallet } from '../contexts/WalletContext';
//import "./walletConnectPage.css"; // Import the new CSS file
import { Wallet } from "../types/types";

/**
 * A component that displays the wallet connection page.
 */
const WalletConnectPage: React.FC = () => {
  // Use the wallet context to get the wallets, connection status, and connect/disconnect functions
  const {
    wallets, // The wallets available to connect to
    isConnected, // A boolean indicating if the wallet is connected
    connectWallet, // A function to connect to a wallet
    disconnectWallet, // A function to disconnect the wallet
    connectedWalletId, // The ID of the connected wallet
    networkID, // The network ID of the connected wallet
  } = useWallet();

  return (
    <div id="container">
      {!isConnected ? (
        // Display the wallet connection options if the wallet is not connected
        <>
          <h1 id="h1">Please Choose the Wallet you want to connect</h1>
          {wallets.length === 0 && <h2>No wallets available</h2>}
          {wallets.length !== 0 && (
            <div id="dropdown">
              {wallets.map((wallet, index) => (
                <button
                  id="button"
                  key={index}
                  onClick={() => connectWallet(wallet.name)}
                >
                  Connect to {wallet.name}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        // Display the connected wallet information if the wallet is connected and the network ID
        <div>
          <div id="networkInfo">
            Network ID: {networkID === 1 ? "Mainnet" : "Testnet"}
          </div>
          <button id="button" onClick={() => disconnectWallet()}>
            Disconnect {connectedWalletId}
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnectPage;
