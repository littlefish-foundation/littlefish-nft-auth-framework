import type { WalletProviderProps } from './contexts/WalletContext';
import type { WalletContextProps, Asset } from './types/types';

export { WalletProviderProps } from './contexts/WalletContext';
export { WalletContextProps, Asset } from './types/types';
export declare const WalletProvider: React.FC<WalletProviderProps>;
export function useWallet(): WalletContextProps;

export function signMessage(
    walletName: string,
    isConnected: boolean,
    message: string,
    address: string
): Promise<[string, string] | void>
