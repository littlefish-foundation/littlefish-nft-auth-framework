import { assetDecoder, processAssets } from "../utils/utils";
import { Asset, Wallet } from "../types/types";

// Declare a global interface for the window object to include the Cardano object
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
export async function signMessage(
  walletName: string,
  isConnected: boolean,
  message: string,
  address: string
): Promise<[string, string] | void> {
  let hexMessage = "";
  if (!isConnected) {
    console.error("Wallet not connected");
    return;
  }
  // Convert the message to hex
  if (message) {
    for (var i = 0, l = message.length; i < l; i++) {
      hexMessage += message.charCodeAt(i).toString(16);
    }
  }
  try {
    const api = await window.cardano[walletName].enable();
    const signedMessage = await api.signData(address, hexMessage);
    const key = signedMessage.key;
    const signature = signedMessage.signature;
    return [key, signature];
  } catch (error) {
    console.error("Failed to sign the message", error);
  }
}

/**
 * Connects to the specified wallet and fetches its assets and other details.
 * @param walletName - The name of the wallet to connect to.
 * @param isClient - A flag indicating if the code is running on the client side.
 * @param isConnected - A boolean indicating if the wallet is connected.
 * @returns A promise that resolves with the connection status, wallet name, assets, address, and network ID.
 */

export async function connectWallet(
  walletName: string,
  isClient: boolean,
  isConnected: boolean
): Promise<[boolean, string, Asset[] | null, [string], number]> {
  let walletAssets: Asset[] | null = null;
  let networkID: number = 0;
  let balance: number = 0;
  let address: [string] = [""];
  let utxoData: [string] = [""];
  if (isClient && window.cardano && window.cardano[walletName]) {
    try {
      await window.cardano[walletName].enable().then(async (api) => {
        balance = await api.getBalance();
        networkID = await api.getNetworkId();
        utxoData = await api.getUtxos();
        address = await api.getRewardAddresses();
      });
      const walletAssets = processAssets(assetDecoder(utxoData));
      isConnected = true;
      return [isConnected, walletName, walletAssets, address, networkID];
    } catch (error) {
      console.error("Failed to enable the wallet or fetch UTXOs", error);
      isConnected = false;
      walletName = "null";
      let walletAssets: null = null;
      return [isConnected, walletName, walletAssets, address, networkID];
    }
  } else {
    console.error("Wallet not found or cardano object not available");
  }

  return [isConnected, walletName, walletAssets, address, networkID];
}

/**
 * Disconnects the wallet if it is connected.
 * @param isClient - A flag indicating if the code is running on the client side.
 * @param isConnected - A boolean indicating if the wallet is connected.
 * @returns A boolean indicating if the wallet is disconnected.
 */

export function disconnectWallet(
  isClient: boolean,
  isConnected: boolean
): boolean {
  let connectionStatus = isConnected;
  if (isClient && connectionStatus) {
    connectionStatus = false;
  }
  return connectionStatus;
}

/**
 * Fetches the installed wallets on the client.
 * @param isClient - A flag indicating if the code is running on the client side.
 * @returns A promise that resolves with the installed wallets or null if not available.
 */

export async function getWallets(isClient: boolean): Promise<Wallet[] | null> {
  async function walletCheck(wallet: string): Promise<Wallet | null> {
    try {
      // Check if the wallet has an API version and icon. If there is an API version, the wallet is a CIP-30 wallet.
      const version = await window.cardano[wallet].apiVersion;
      const icon = await window.cardano[wallet].icon;
      return version ? { name: wallet, icon: icon } : null;
    } catch (error) {
      console.error(`Error checking wallet ${wallet}:`, error);
      return null;
    }
  }
  if (isClient && window.cardano) {
    try {
      const installedWallets = Object.keys(window.cardano);
      const promises = installedWallets.map(walletCheck);
      const results = await Promise.all(promises);
      return results.filter((wallet) => wallet !== null);
    } catch (error) {
      console.error("Error retrieving wallets:", error);
      return null;
    }
  }
  return null;
}
