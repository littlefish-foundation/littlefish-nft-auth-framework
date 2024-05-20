"use client";
import React from "react";
import { useWallet } from '../contexts/WalletContext';
import "./walletConnectPage.css"; // Import the new CSS file

const WalletConnectPage: React.FC = () => {
  const {
    wallets,
    isConnected,
    connectWallet,
    disconnectWallet,
    connectedWalletId,
    networkID,
  } = useWallet();

  return (
    <div className="container">
      {!isConnected ? (
        <>
          <h1>Please Choose the Wallet you want to connect</h1>
          {wallets.length === 0 && <h2>No wallets available</h2>}
          {wallets.length !== 0 && (
            <div className="dropdown">
              {wallets.map((wallet, index) => (
                <button
                  className="button"
                  key={index}
                  onClick={() => connectWallet(wallet)}
                >
                  Connect to {wallet}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          <div className="networkInfo">
            Network ID: {networkID === 1 ? "Mainnet" : "Testnet"}
          </div>
          <button className="button" onClick={() => disconnectWallet()}>
            Disconnect {connectedWalletId}
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnectPage;
