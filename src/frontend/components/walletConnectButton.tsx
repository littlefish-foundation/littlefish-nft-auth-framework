"use client"
import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import './walletConnectButton.css';

const WalletConnectButton: React.FC = () => {
  const {
    wallets,
    isConnected,
    connectWallet,
    disconnectWallet,
    connectedWalletId,
  } = useWallet();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleConnectClick = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleWalletClick = (wallet: string) => {
    connectWallet(wallet);
    setDropdownVisible(false);
  };

  return (
    <div className="container">
      {isConnected ? (
        <button className="button" onClick={() => disconnectWallet()}>
          Disconnect {connectedWalletId}
        </button>
      ) : (
        <div>
          <button className="button" onClick={() => handleConnectClick()}>
            Connect Wallet
          </button>
          {dropdownVisible && (
            <div className="dropdown">
              {wallets.map((wallet, index) => (
                <button className="button" key={index} onClick={() => handleWalletClick(wallet)}>
                  {wallet}
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
