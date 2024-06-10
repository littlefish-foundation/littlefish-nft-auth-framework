import { loginUser } from './loginUser';
import { verifyPassword, verifyWalletAddress, validateEmail, findMatchingAsset, verifyAssetOwnership } from './utils/utils';
import { LoginOptions, LoginResult, User } from './types/types';
import { Asset } from '../frontend/types/types';

// Mock dependencies
jest.mock('./utils/utils');

jest.mock('bech32', () => ({
  encode: jest.fn(),
  toWords: jest.fn().mockReturnValue([]) // mock other functions as needed
}));

jest.mock('bcryptjs', () => ({
  hashSync: jest.fn(),
  compareSync: jest.fn()
}));

jest.mock('@cardano-foundation/cardano-verify-datasignature', () => ({
  verifySignature: jest.fn()
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn()
}));



const mockVerifyPassword = verifyPassword as jest.MockedFunction<typeof verifyPassword>;
const mockVerifyWalletAddress = verifyWalletAddress as jest.MockedFunction<typeof verifyWalletAddress>;
const mockValidateEmail = validateEmail as jest.MockedFunction<typeof validateEmail>;
const mockFindMatchingAsset = findMatchingAsset as jest.MockedFunction<typeof findMatchingAsset>;
const mockVerifyAssetOwnership = verifyAssetOwnership as jest.MockedFunction<typeof verifyAssetOwnership>;

describe('loginUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const user: User = {
    email: 'test@example.com',
    password: 'hashed_password',
    stakeAddress: 'stake1uxyz',
    walletNetwork: 1,
    asset: { policyID: 'policy1', assetName: 'asset1', amount: 1 }
  };

  test('should authenticate user with valid email and password', async () => {
    const options: LoginOptions = { email: 'test@example.com', password: 'password123' };
    mockValidateEmail.mockReturnValue(true);
    mockVerifyPassword.mockReturnValue(true);

    const result: LoginResult = await loginUser(user, options);

    expect(result).toEqual({ success: true });
    expect(mockValidateEmail).toHaveBeenCalledWith(options.email);
    expect(mockVerifyPassword).toHaveBeenCalledWith(options.password, user.password);
  });

  test('should return error for invalid email format', async () => {
    const options: LoginOptions = { email: 'invalid-email', password: 'password123' };
    mockValidateEmail.mockReturnValue(false);

    const result: LoginResult = await loginUser(user, options);

    expect(result).toEqual({ success: false, error: 'Invalid email or email format' });
    expect(mockValidateEmail).toHaveBeenCalledWith(options.email);
  });

  test('should return error for incorrect email', async () => {
    const options: LoginOptions = { email: 'wrong@example.com', password: 'password123' };
    mockValidateEmail.mockReturnValue(true);

    const result: LoginResult = await loginUser(user, options);

    expect(result).toEqual({ success: false, error: 'Invalid email or email format' });
  });

  test('should return error for incorrect password', async () => {
    const options: LoginOptions = { email: 'test@example.com', password: 'wrongpassword' };
    mockValidateEmail.mockReturnValue(true);
    mockVerifyPassword.mockReturnValue(false);

    const result: LoginResult = await loginUser(user, options);

    expect(result).toEqual({ success: false, error: 'Invalid password' });
    expect(mockVerifyPassword).toHaveBeenCalledWith(options.password, user.password);
  });

  test('should authenticate user with valid wallet address and signature', async () => {
    const options: LoginOptions = {
      stakeAddress: 'stake1uxyz',
      walletNetwork: 1,
      signature: 'signature',
      key: 'key',
      nonce: 'nonce'
    };
    mockVerifyWalletAddress.mockReturnValue(true);

    const result: LoginResult = await loginUser(user, options);

    expect(result).toEqual({ success: true });
    expect(mockVerifyWalletAddress).toHaveBeenCalledWith(
      options.signature,
      options.key,
      options.nonce,
      options.stakeAddress,
      options.walletNetwork
    );
  });

  test('should return error for invalid wallet signature', async () => {
    const options: LoginOptions = {
      stakeAddress: 'stake1uxyz',
      walletNetwork: 1,
      signature: 'invalid-signature',
      key: 'key',
      nonce: 'nonce'
    };
    mockVerifyWalletAddress.mockReturnValue(false);

    const result: LoginResult = await loginUser(user, options);

    expect(result).toEqual({ success: false, error: 'Invalid wallet authentication' });
    expect(mockVerifyWalletAddress).toHaveBeenCalledWith(
      options.signature,
      options.key,
      options.nonce,
      options.stakeAddress,
      options.walletNetwork
    );
  });

  test('should return error for mismatched stake address or network', async () => {
    const options: LoginOptions = {
      stakeAddress: 'different_stake_address',
      walletNetwork: 1,
      signature: 'signature',
      key: 'key',
      nonce: 'nonce'
    };
    mockVerifyWalletAddress.mockReturnValue(true);

    const result: LoginResult = await loginUser(user, options);

    expect(result).toEqual({ success: false, error: 'Invalid network or wallet address' });
  });

  test('should authenticate user with valid wallet address and asset ownership', async () => {
    const options: LoginOptions = {
      stakeAddress: 'stake1uxyz',
      walletNetwork: 1,
      signature: 'signature',
      key: 'key',
      nonce: 'nonce',
      assets: [{ policyID: 'policy1', assetName: 'asset1', amount: 1 }]
    };
    mockVerifyWalletAddress.mockReturnValue(true);
    mockFindMatchingAsset.mockReturnValue(options.assets[0]);
    mockVerifyAssetOwnership.mockResolvedValue(true);

    const result: LoginResult = await loginUser(user, options);

    expect(result).toEqual({ success: true });
    expect(mockVerifyWalletAddress).toHaveBeenCalledWith(
      options.signature,
      options.key,
      options.nonce,
      options.stakeAddress,
      options.walletNetwork
    );
    expect(mockFindMatchingAsset).toHaveBeenCalledWith(options.assets, user.asset);
    expect(mockVerifyAssetOwnership).toHaveBeenCalledWith(
      options.stakeAddress,
      options.assets[0],
      options.walletNetwork
    );
  });

  test('should return error for unmatched asset', async () => {
    const options: LoginOptions = {
      stakeAddress: 'stake1uxyz',
      walletNetwork: 1,
      signature: 'signature',
      key: 'key',
      nonce: 'nonce',
      assets: [{ policyID: 'policy2', assetName: 'asset2', amount: 1 }]
    };
    mockVerifyWalletAddress.mockReturnValue(true);
    mockFindMatchingAsset.mockReturnValue(null);

    const result: LoginResult = await loginUser(user, options);

    expect(result).toEqual({ success: false, error: 'Invalid asset' });
    expect(mockFindMatchingAsset).toHaveBeenCalledWith(options.assets, user.asset);
  });

  test('should return error for asset verification failure', async () => {
    const options: LoginOptions = {
      stakeAddress: 'stake1uxyz',
      walletNetwork: 1,
      signature: 'signature',
      key: 'key',
      nonce: 'nonce',
      assets: [{ policyID: 'policy1', assetName: 'asset1', amount: 1 }]
    };
    mockVerifyWalletAddress.mockReturnValue(true);
    mockFindMatchingAsset.mockReturnValue(options.assets[0]);
    mockVerifyAssetOwnership.mockResolvedValue(false);

    const result: LoginResult = await loginUser(user, options);

    expect(result).toEqual({ success: false, error: 'Asset cannot be verified on-chain' });
    expect(mockFindMatchingAsset).toHaveBeenCalledWith(options.assets, user.asset);
    expect(mockVerifyAssetOwnership).toHaveBeenCalledWith(
      options.stakeAddress,
      options.assets[0],
      options.walletNetwork
    );
  });

  test('should return error for invalid login inputs', async () => {
    const options: LoginOptions = {};
    const result: LoginResult = await loginUser(user, options);
    expect(result).toEqual({ success: false, error: 'Invalid login inputs' });
  });
});
