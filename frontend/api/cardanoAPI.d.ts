import { Asset, Wallet } from "../types/types";
declare global {
    interface Window {
        cardano: any;
    }
}
/**
 * Sign a message using the specific Cardano wallet.
 * @param walletName - The name of the wallet to use for signing.
 * @param isConnected - A boolean indicating if the wallet is connected.
 * @param message - The message to sign.
 * @param address - The address to sign the message with.
 * @returns A promise that resolves with the key and signature or void if not connected.
 */
export declare function signMessage(walletName: string, isConnected: boolean, message: string, address: string): Promise<[string, string] | void>;
/**
 * Connects to the specified wallet and fetches its assets and other details.
 * @param walletName - The name of the wallet to connect to.
 * @param isClient - A flag indicating if the code is running on the client side.
 * @param isConnected - A boolean indicating if the wallet is connected.
 * @returns A promise that resolves with the connection status, wallet name, assets, address, and network ID.
 */
export declare function connectWallet(walletName: string, isClient: boolean, isConnected: boolean): Promise<[boolean, string, Asset[] | null, [string], number]>;
/**
 * Disconnects the wallet if it is connected.
 * @param isClient - A flag indicating if the code is running on the client side.
 * @param isConnected - A boolean indicating if the wallet is connected.
 * @returns A boolean indicating if the wallet is disconnected.
 */
export declare function disconnectWallet(isClient: boolean, isConnected: boolean): boolean;
/**
 * Fetches the installed wallets on the client.
 * @param isClient - A flag indicating if the code is running on the client side.
 * @returns A promise that resolves with the installed wallets or null if not available.
 */
export declare function getWallets(isClient: boolean): Promise<Wallet[] | null>;
//# sourceMappingURL=cardanoAPI.d.ts.map