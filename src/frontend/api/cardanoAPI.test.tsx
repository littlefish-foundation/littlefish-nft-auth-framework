import { signMessage, connectWallet } from '../api/cardanoAPI';
import { Asset } from '../types/types';
import { assetDecoder, processAssets } from '../utils/utils';

// Mock the global window.cardano object
beforeAll(() => {
  global.window = Object.create(window);
  global.window.cardano = {
    nami: {
      enable: jest.fn().mockResolvedValue({
        signData: jest.fn().mockResolvedValue({
          key: 'mockKey',
          signature: 'mockSignature',
        }),
        getNetworkId: jest.fn().mockResolvedValue(1),
        getUtxos: jest.fn().mockResolvedValue(['mockUtxo']),
        getRewardAddresses: jest.fn().mockResolvedValue(['address1']),
      }),
    },
  };
});

jest.mock('../utils/utils', () => ({
  assetDecoder: jest.fn(),
  processAssets: jest.fn(),
}));

describe('Wallet Utility Functions', () => {
  describe('signMessage', () => {
    it('should return key and signature when wallet is connected and message is signed', async () => {
      const result = await signMessage('nami', true, 'test message', 'test address');

      expect(result).toEqual(['mockKey', 'mockSignature']);
    });

    it('should log error and return void when signing fails', async () => {
      (global.window.cardano.nami.enable as jest.Mock).mockResolvedValue({
        signData: jest.fn().mockRejectedValue(new Error('Signing error')),
      });
      console.error = jest.fn();

      const result = await signMessage('nami', true, 'test message', 'test address');

      expect(console.error).toHaveBeenCalledWith('Failed to sign the message', expect.any(Error));
      expect(result).toBeUndefined();
    });
  });

  describe('connectWallet', () => {
    it('should return wallet details when connection is successful', async () => {
      const mockWalletAssets: Asset[] = [{ policyID: 'policy1', assetName: 'asset1', amount: 100 }];
      (global.window.cardano.nami.enable as jest.Mock).mockResolvedValue({
        getUtxos: jest.fn().mockResolvedValue(['mockUtxo']),
        getNetworkId: jest.fn().mockResolvedValue(1),
        getRewardAddresses: jest.fn().mockResolvedValue(['address1']),
      });
      (assetDecoder as jest.Mock).mockReturnValue(['decodedAsset']);
      (processAssets as jest.Mock).mockReturnValue(mockWalletAssets);

      const result = await connectWallet('nami', true, false);

      expect(result).toEqual([true, 'nami', mockWalletAssets, ['address1'], 1]);
    });

    it('should return default values when connection fails', async () => {
      (global.window.cardano.nami.enable as jest.Mock).mockRejectedValue(new Error('Connection error'));
      console.error = jest.fn();

      const result = await connectWallet('nami', true, false);

      expect(console.error).toHaveBeenCalledWith('Failed to enable the wallet or fetch UTXOs', expect.any(Error));
      expect(result).toEqual([false, 'null', null, [''], 0]);
    });
  });
});
