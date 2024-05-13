import { loginUser } from './loginUser';
import { verifyPassword, verifyWalletAddress, validateEmail, isNonEmptyString } from './utils/utils';
import { SignupOptions, LoginResult, User } from './types/types';

// Mock the utils functions
jest.mock('./utils/utils', () => ({
  verifyPassword: jest.fn(),
  verifyWalletAddress: jest.fn(),
  validateEmail: jest.fn(),
  isNonEmptyString: jest.fn(),
}));

describe('loginUser', () => {
  const user: User = {
    email: 'user@example.com',
    password: 'hashed_password',
    walletAddress: 'user_wallet_address',
    walletNetwork: 1,
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should authenticate user with correct email and password', () => {
    (validateEmail as jest.Mock).mockReturnValue(true);
    (isNonEmptyString as jest.Mock).mockReturnValue(true);
    (verifyPassword as jest.Mock).mockReturnValue(true);

    const options: SignupOptions = { email: 'user@example.com', password: 'password123' };
    const result: LoginResult = loginUser(user, options);

    expect(validateEmail).toHaveBeenCalledWith(options.email);
    expect(isNonEmptyString).toHaveBeenCalledWith(options.password);
    expect(verifyPassword).toHaveBeenCalledWith(options.password, user.password);
    expect(result).toEqual({ success: true });
  });

  it('should fail authentication with incorrect email format', () => {
    (validateEmail as jest.Mock).mockReturnValue(false);

    const options: SignupOptions = { email: 'bad_email', password: 'password123' };
    const result: LoginResult = loginUser(user, options);

    expect(validateEmail).toHaveBeenCalledWith(options.email);
    expect(result).toEqual({ success: false, error: 'Invalid email or email format' });
  });

  it('should fail authentication with incorrect password', () => {
    (validateEmail as jest.Mock).mockReturnValue(true);
    (isNonEmptyString as jest.Mock).mockReturnValue(true);
    (verifyPassword as jest.Mock).mockReturnValue(false);

    const options: SignupOptions = { email: 'user@example.com', password: 'wrongpassword' };
    const result: LoginResult = loginUser(user, options);

    expect(validateEmail).toHaveBeenCalledWith(options.email);
    expect(isNonEmptyString).toHaveBeenCalledWith(options.password);
    expect(verifyPassword).toHaveBeenCalledWith(options.password, user.password);
    expect(result).toEqual({ success: false, error: 'Invalid password' });
  });

  it('should authenticate user with correct wallet information', () => {
    (verifyWalletAddress as jest.Mock).mockReturnValue(true);

    const options: SignupOptions = {
      walletAddress: 'user_wallet_address',
      walletNetwork: 1,
      signature: 'valid_signature',
      key: 'valid_key',
      nonce: 'valid_nonce',
    };
    const result: LoginResult = loginUser(user, options);

    expect(verifyWalletAddress).toHaveBeenCalledWith(options.signature, options.key, options.nonce, options.walletAddress);
    expect(result).toEqual({ success: true });
  });

  it('should fail authentication with invalid wallet signature', () => {
    (verifyWalletAddress as jest.Mock).mockReturnValue(false);

    const options: SignupOptions = {
      walletAddress: 'user_wallet_address',
      walletNetwork: 1,
      signature: 'invalid_signature',
      key: 'valid_key',
      nonce: 'valid_nonce',
    };
    const result: LoginResult = loginUser(user, options);

    expect(verifyWalletAddress).toHaveBeenCalledWith(options.signature, options.key, options.nonce, options.walletAddress);
    expect(result).toEqual({ success: false, error: 'Invalid wallet authentication' });
  });

  it('should fail authentication with incorrect wallet address or network', () => {
    const options: SignupOptions = {
      walletAddress: 'incorrect_wallet_address',
      walletNetwork: 2,
      signature: 'valid_signature',
      key: 'valid_key',
      nonce: 'valid_nonce',
    };
    const result: LoginResult = loginUser(user, options);

    expect(result).toEqual({ success: false, error: 'Invalid network or wallet address' });
  });

  it('should fail authentication with missing credentials', () => {
    const options: SignupOptions = {};
    const result: LoginResult = loginUser(user, options);

    expect(result).toEqual({ success: false, error: 'Invalid login inputs' });
  });
});
