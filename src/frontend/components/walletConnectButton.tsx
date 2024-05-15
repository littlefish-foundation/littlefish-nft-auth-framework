import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

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
    <div>
      {isConnected ? (
        <button onClick={() => disconnectWallet()}>Disconnect {connectedWalletId}</button>
      ) : (
        <div>
          <button onClick={() => handleConnectClick()}>Connect Wallet</button>
          {dropdownVisible && (
            <div>
              {wallets.map((wallet, index) => (
                <div key={index}>
                  <button onClick={() => handleWalletClick(wallet)}>
                    {wallet}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton;
