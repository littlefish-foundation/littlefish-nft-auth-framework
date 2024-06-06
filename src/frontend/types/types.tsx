/**
 * @file This file contains all the types used in the frontend
 */

/**
 * Interface for the asset object.
 * @interface Asset
 * @property {string} policyID - The policy ID of the asset.
 * @property {string} assetName - The name of the asset.
 * @property {number} amount - The amount of the asset.
 * @example
 * const asset: Asset = {
 *   policyID: "policyID",
 *   assetName: "assetName",
 *   amount: 1
 * };
 * @example
 * const assets: Asset[] = [
 *   {
 *     policyID: "policyID",
 *     assetName: "assetName",
 *     amount: 1
 *   },
 *   {
 *     policyID: "policyID",
 *     assetName: "assetName",
 *     amount: 1
 *   }
 * ];
 */
export interface Asset {
  policyID: string;
  assetName: string;
  amount: number;
}

/**
 * Interface for the wallet context properties.
 * @interface WalletContextProps
 * @property {boolean} isConnected - Indicates if the wallet is connected.
 * @property {Asset[]} assets - Array of assets.
 * @property {string | null} connectedWalletId - ID of the connected wallet.
 * @property {(walletName: string) => Promise<void>} connectWallet - Function to connect to a wallet.
 * @property {() => void} disconnectWallet - Function to disconnect the wallet.
 * @property {(processedArray: Asset[]) => Asset[]} decodeHexToAscii - Function to decode hex to ASCII.
 * @property {boolean} isClient - Indicates if the code is running on the client side.
 * @property {Wallet[]} wallets - Array of wallets.
 * @property {number} networkID - Network ID.
 * @property {[string]} addresses - Array of addresses.
 * @example
 * const walletContextProps: WalletContextProps = {
 *   isConnected: true,
 *   assets: [
 *     {
 *       policyID: "policyID",
 *       assetName: "assetName",
 *       amount: 1
 *     }
 *   ],
 *   connectedWalletId: "connectedWalletId",
 *   connectWallet: async (walletName: string) => {},
 *   disconnectWallet: () => {},
 *   decodeHexToAscii: (processedArray: Asset[]) => processedArray,
 *   isClient: true,
 *   wallets: [
 *     {
 *       name: "name",
 *       icon: "icon"
 *     }
 *   ],
 *   networkID: 1,
 *   addresses: ["address"]
 * };
 */
export interface WalletContextProps {
  isConnected: boolean;
  assets: Asset[];
  connectedWalletId: string | null;
  connectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: () => void;
  decodeHexToAscii: (processedArray: Asset[]) => Asset[];
  isClient: boolean;
  wallets: Wallet[];
  networkID: number;
  addresses: [string];
}

/**
 * Interface for the wallet object.
 * @interface Wallet
 * @property {string} name - The name of the wallet.
 * @property {string} icon - The icon of the wallet.
 * @example
 * const wallet: Wallet = {
 *   name: "name",
 *   icon: "icon"
 * };
 * @example
 * const wallets: Wallet[] = [
 *   {
 *     name: "name",
 *     icon: "icon"
 *   },
 *   {
 *     name: "name",
 *     icon: "icon"
 *   }
 * ];
 */
export interface Wallet {
  name: string;
  icon: string;
}
