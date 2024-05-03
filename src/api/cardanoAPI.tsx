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

export async function connectWallet(
  walletName: string,
  isClient: boolean,
  isConnected: boolean
): Promise<[boolean, string | null, Asset[] | null]> {
  let walletId: string | null = null;
  let walletAssets: Asset[] | null = null;
  if (isClient && window.cardano && window.cardano[walletName]) {
    try {
      const api = await window.cardano[walletName].enable();
      const utxoData = await api.getUtxos();
      const decoded = processAssets(assetDecoder(utxoData));
      isConnected = true;
      return [isConnected, walletName, decoded];
    } catch (error) {
      console.error("Failed to enable the wallet or fetch UTXOs", error);
      isConnected = false;
      walletName = "null";
      let walletAssets: null = null;
      return [isConnected, walletName, walletAssets];
    }
  } else {
    console.error("Wallet not found or cardano object not available");
  }

  return [isConnected, walletId, walletAssets];
}

export function disconnectWallet(isClient: boolean, isConnected: boolean): Promise<[boolean, string | null]> {
  let success = false;
  let disconnectWalletId: string | null = null;
  if (isClient && isConnected) {
    // setIsConnected(false);
    isConnected = false;
    disconnectWalletId = null;
    // setConnectedWalletId(null);
  }
  return [success, disconnectWalletId];
}

export function getWallets(isClient: boolean) {
  if (isClient && window.cardano) {
    const installedWallets = Object.keys(window.cardano);
    return expectedWallets.filter((wallet) =>
      installedWallets.includes(wallet)
    );
  }
}
