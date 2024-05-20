import { signupUser } from './signupUser';
import { hashPassword, validateEmail, validatePassword, verifyWalletAddress } from './utils/utils';
import { SignupOptions, SignupResult } from './types/types';

// Mock the utils functions
jest.mock('./utils/utils', () => ({
  hashPassword: jest.fn(),
  validateEmail: jest.fn(),
  validatePassword: jest.fn(),
  verifyWalletAddress: jest.fn(),
}));

describe('signupUser', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should signup user with valid email and password', () => {
    (validateEmail as jest.Mock).mockReturnValue(true);
    (validatePassword as jest.Mock).mockReturnValue(true);
    (hashPassword as jest.Mock).mockReturnValue('hashed_password');

    const options: SignupOptions = { email: 'user@example.com', password: 'StrongPassword123' };
    const result: SignupResult = signupUser(options);

    expect(validateEmail).toHaveBeenCalledWith(options.email);
    expect(validatePassword).toHaveBeenCalledWith(options.password);
    expect(hashPassword).toHaveBeenCalledWith(options.password);
    expect(result).toEqual({ success: true, email: options.email, passwordHash: 'hashed_password' });
  });

  it('should fail signup with invalid email format', () => {
    (validateEmail as jest.Mock).mockReturnValue(false);

    const options: SignupOptions = { email: 'invalid_email', password: 'StrongPassword123' };
    const result: SignupResult = signupUser(options);

    expect(validateEmail).toHaveBeenCalledWith(options.email);
    expect(result).toEqual({ success: false, error: 'Invalid email format' });
  });

  it('should fail signup with weak password', () => {
    (validateEmail as jest.Mock).mockReturnValue(true);
    (validatePassword as jest.Mock).mockReturnValue(false);

    const options: SignupOptions = { email: 'user@example.com', password: 'weak' };
    const result: SignupResult = signupUser(options);

    expect(validateEmail).toHaveBeenCalledWith(options.email);
    expect(validatePassword).toHaveBeenCalledWith(options.password);
    expect(result).toEqual({ success: false, error: 'Password must be a stronger' });
  });

  it('should signup user with valid wallet information', () => {
    (verifyWalletAddress as jest.Mock).mockReturnValue(true);

    const options: SignupOptions = {
      walletAddress: 'user_wallet_address',
      walletNetwork: 1,
      signature: 'valid_signature',
      key: 'valid_key',
      nonce: 'valid_nonce',
    };
    const result: SignupResult = signupUser(options);

    expect(verifyWalletAddress).toHaveBeenCalledWith(options.signature, options.key, options.nonce, options.walletAddress);
    expect(result).toEqual({ success: true, walletAddress: options.walletAddress, walletNetwork: options.walletNetwork });
  });

  it('should fail signup with invalid wallet signature', () => {
    (verifyWalletAddress as jest.Mock).mockReturnValue(false);

    const options: SignupOptions = {
      walletAddress: 'user_wallet_address',
      walletNetwork: 1,
      signature: 'invalid_signature',
      key: 'valid_key',
      nonce: 'valid_nonce',
    };
    const result: SignupResult = signupUser(options);

    expect(verifyWalletAddress).toHaveBeenCalledWith(options.signature, options.key, options.nonce, options.walletAddress);
    expect(result).toEqual({ success: false, error: 'Invalid wallet authentication' });
  });

  it('should return error for missing signup inputs', () => {
    const options: SignupOptions = {};
    const result: SignupResult = signupUser(options);

    expect(result).toEqual({ success: false, error: 'Invalid signup inputs' });
  });

  it('should handle unexpected errors gracefully', () => {
    (validateEmail as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const options: SignupOptions = { email: 'user@example.com', password: 'StrongPassword123' };
    const result: SignupResult = signupUser(options);

    expect(result).toEqual({ success: false, error: 'Unexpected error' });
  });
});
