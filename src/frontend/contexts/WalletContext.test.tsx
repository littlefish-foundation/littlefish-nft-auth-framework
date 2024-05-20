import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { WalletProvider, useWallet } from './WalletContext';

const MockComponent = () => {
  const { connectWallet, disconnectWallet, networkID, isConnected, connectedWalletId } = useWallet();

  return (
    <div>
      <div data-testid="networkID">{networkID}</div>
      <div data-testid="isConnected">{isConnected ? 'true' : 'false'}</div>
      <div data-testid="connectedWalletId">{connectedWalletId}</div>
      <button onClick={() => connectWallet("eternl")}>connectWallet</button>
      <button onClick={() => disconnectWallet()}>DisconnectWallet</button>
    </div>
  );
};

describe('WalletProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should connectWallet to a wallet', async () => {
    render(
      <WalletProvider>
        <MockComponent />
      </WalletProvider>
    );

    // Simulate wallet connectWalletion
    act(() => {
      screen.getByText('connectWallet').click();
    });

    expect(screen.getByTestId('networkID').textContent).toBe('1');
  });

  it('should disconnectWallet from a wallet', async () => {
    render(
      <WalletProvider>
        <MockComponent />
      </WalletProvider>
    );

    // Simulate wallet connectWalletion
    act(() => {
      screen.getByText('connectWallet').click();
    });

    // Simulate wallet disconnectWalletion
    act(() => {
      screen.getByText('DisconnectWallet').click();
    });

    expect(screen.getByTestId('isConnected').textContent).toBe('false');
    expect(screen.getByTestId('connectedWalletId').textContent).toBe('');
  });
});
