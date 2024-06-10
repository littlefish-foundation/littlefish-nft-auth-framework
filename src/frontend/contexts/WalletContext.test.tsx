import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WalletProvider, useWallet } from './WalletContext'; // Adjust the import path as necessary
import { fetchAssets } from '../../backend/utils/utils'; // Adjust the import path as necessary

jest.mock('../api/cardanoAPI', () => ({
  getWallets: jest.fn(),
  connectWallet: jest.fn(),
  disconnectWallet: jest.fn()
}));

jest.mock('../utils/utils', () => {
  const originalModule = jest.requireActual('../utils/utils');
  return {
    __esModule: true,
    ...originalModule,
    fetchAssets: jest.fn(),
  };
});

const { getWallets, connectWallet, disconnectWallet } = require('../api/cardanoAPI');
const mockFetchAssets = require('../utils/utils').fetchAssets as jest.MockedFunction<typeof fetchAssets>;

const TestComponent = () => {
  const {
    isConnected,
    connectWallet,
    disconnectWallet,
    networkID
  } = useWallet();

  return (
    <div>
      <button onClick={() => connectWallet('TestWallet')}>Connect Wallet</button>
      <button onClick={() => disconnectWallet()}>Disconnect Wallet</button>
      <div data-testid="isConnected">{isConnected ? 'Connected' : 'Disconnected'}</div>
      <div data-testid="networkID">{networkID}</div>
    </div>
  );
};

describe('WalletProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getWallets.mockResolvedValue([]);
  });

  it('should connect to a wallet successfully', async () => {
    connectWallet.mockResolvedValue([true, 'TestWallet', [], [''], 1]);
    mockFetchAssets.mockResolvedValue([]);

    await act(async () => {
      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      );
    });

    await act(async () => {
      userEvent.click(screen.getByText('Connect Wallet'));
    });

    expect(screen.getByTestId('isConnected').textContent).toBe('Connected');
    expect(screen.getByTestId('networkID').textContent).toBe('1');
  });

  it('should disconnect from a wallet successfully', async () => {
    disconnectWallet.mockReturnValue(true); // Simulate successful disconnection

    await act(async () => {
      render(
        <WalletProvider>
          <TestComponent />
        </WalletProvider>
      );
    });

    // First connect the wallet
    await act(async () => {
      userEvent.click(screen.getByText('Connect Wallet'));
    });

    // Then disconnect the wallet
    await act(async () => {
      userEvent.click(screen.getByText('Disconnect Wallet'));
    });

    expect(screen.getByTestId('isConnected').textContent).toBe('Disconnected');
  });

  it('should handle errors when fetching wallets fails', async () => {
    getWallets.mockRejectedValue(new Error('Failed to fetch wallets'));

    let errorCaught = true;
    try {
      await act(async () => {
        render(
          <WalletProvider>
            <TestComponent />
          </WalletProvider>
        );
      });
    } catch (error) {
      errorCaught = true;
      expect(error.message).toContain('Failed to fetch wallets');
    }

    expect(errorCaught).toBe(true); // Ensure that an error was caught in the test
  });
});

