// Exporting React context and hooks
export { WalletProvider, useWallet } from './providers/WalletContext';

// Export utility functions
export { GetAssets } from './components/GetAssets';

// Export components
export { default as Wallet } from './components/Wallet';
export { default as SignMessage } from './components/SignMessage';

// Export hooks and utilities if there are any that should be publicly accessible
export { default as getInstalledWallets } from './components/GetInstalledWallets';
