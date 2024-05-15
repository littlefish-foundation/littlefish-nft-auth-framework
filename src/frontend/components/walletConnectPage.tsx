import React from "react";
import { useWallet } from "../contexts/WalletContext";

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
    <>
      {isConnected ? (
        <div>
          {wallets.map((wallet, index) => (
            <button key={index} onClick={() => connectWallet(wallet)}>
              Connect to {wallet}
            </button>
          ))}
        </div>
      ) : (
        <div>
          {networkID === 1 ? (
            <div>Network ID: Mainnet</div>
          ) : (
            <div>Network ID: Testnet</div>
          )}
          <button onClick={() => disconnectWallet()}>
            Disconnect {connectedWalletId}
          </button>
        </div>
      )}
    </>
  );
};

export default WalletConnectPage;