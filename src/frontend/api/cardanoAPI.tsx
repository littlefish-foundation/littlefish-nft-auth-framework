import { assetDecoder, processAssets } from "../utils/utils";
import { Asset } from "../types/types";

declare global {
  interface Window {
    cardano: any;
  }
}

const expectedWallets: string[] = [
  "nami",
  "eternl",
  "yoroi",
  "flint",
  "typhon",
  "gerowallet",
  "nufi",
  "lace",
];

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
  console.log(walletName);
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

export async function connectWallet(
  walletName: string,
  isClient: boolean,
  isConnected: boolean
): Promise<[boolean, string, Asset[]| null, number, [string] ]> {
  let walletAssets: Asset[] | null = null;
  let networkID: number = 0;
  let address: [string] = [""];
  if (isClient && window.cardano && window.cardano[walletName]) {
    try {
      const api = await window.cardano[walletName].enable();
      networkID = await window.cardano.getNetworkId();
      const utxoData = await api.getUtxos();
      address = await api.getUsedAddresses();
      const walletAssets = processAssets(assetDecoder(utxoData));
      isConnected = true;
      return [isConnected, walletName, walletAssets, networkID, address];
    } catch (error) {
      console.error("Failed to enable the wallet or fetch UTXOs", error);
      isConnected = false;
      walletName = "null";
      let walletAssets: null = null;
      return [isConnected, walletName, walletAssets, networkID, address];
    }
  } else {
    console.error("Wallet not found or cardano object not available");
  }

  return [isConnected, walletName, walletAssets, networkID, address];
}

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

export function getWallets(isClient: boolean) {
  if (isClient && window.cardano) {
    const installedWallets = Object.keys(window.cardano);
    return expectedWallets.filter((wallet) =>
      installedWallets.includes(wallet)
    );
  }
}
