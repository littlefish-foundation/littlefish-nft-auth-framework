import { assetDecoder, processAssets } from '../utils/utils';
import { Asset, WalletContextProps } from '../types/types';

declare global {
  interface Window {
    cardano: any;
  }
}

export async function connectWallet(walletName: string, setIsConnected: boolean, setConnectedWalletId: string | null, setAssets: Asset[], setUtxos: any[], isClient: boolean) {

    if (isClient && window.cardano && window.cardano[walletName]) {
      try {
        const api = await window.cardano[walletName].enable();
        setIsConnected(true);
        setConnectedWalletId(walletName);

        const utxoData = await api.getUtxos();
        const decoded = assetDecoder(utxoData);
        const processed = processAssets(decoded);
        setAssets(processed);
        setUtxos(decoded);
      } catch (error) {
        console.error("Failed to enable the wallet or fetch UTXOs", error);
        setIsConnected(false);
        setConnectedWalletId(null);
      }
    } else {
      console.error("Wallet not found or cardano object not available");
    }
  }

export function disconnectWallet(setIsConnected: boolean, setConnectedWalletId: string, isClient: boolean) {
    if (isClient) {
      setIsConnected(false);
      setConnectedWalletId(null);
    }
  }

export function getWallets {
    if (isClient && window.cardano) {
      const installedWallets = Object.keys(window.cardano);
      setWallets(
        expectedWallets.filter(wallet => installedWallets.includes(wallet))
      );
    }
  };