import { loginUser } from './loginUser';
import { verifyPassword, verifyWalletAddress, validateEmail, isNonEmptyString } from './utils/utils';


// Mock the utils functions
jest.mock('./utils/utils', () => ({
    verifyPassword: jest.fn(),
    verifyWalletAddress: jest.fn(),
    validateEmail: jest.fn(),
    isNonEmptyString: jest.fn()
}));

describe('loginUser', () => {
    const user = {
        email: 'user@example.com',
        password: 'hashed_password',
        walletAddress: 'user_wallet_address',
        walletNetwork: 1
    };

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    it('should authenticate user with correct email and password', () => {
        (validateEmail as jest.Mock).mockReturnValue(true);
        (isNonEmptyString as jest.Mock).mockReturnValue(true);
        (verifyPassword as jest.Mock).mockReturnValue(true);

        const options = { email: 'user@example.com', password: 'password123' };
        const result = loginUser(user, options);

        expect(validateEmail).toHaveBeenCalledWith(options.email);
        expect(isNonEmptyString).toHaveBeenCalledWith(options.password);
        expect(verifyPassword).toHaveBeenCalledWith(options.password, user.password);
        expect(result).toEqual({ success: true });
    });

    it('should fail authentication with incorrect email format', () => {
        (validateEmail as jest.Mock).mockReturnValue(false);

        const options = { email: 'bad_email', password: 'password123' };
        const result = loginUser(user, options);

        expect(validateEmail).toHaveBeenCalledWith(options.email);
        expect(result).toEqual({ success: false, error: 'Invalid email or email format' });
    });

    it('should authenticate user with correct wallet information', () => {
        (verifyWalletAddress as jest.Mock).mockReturnValue(true);

        const options = {
            walletAddress: 'user_wallet_address',
            networkID: 1,
            signature: 'valid_signature',
            key: 'valid_key',
            message: 'valid_message'
        };
        const result = loginUser(user, options);

        expect(verifyWalletAddress).toHaveBeenCalledWith(options.signature, options.key, options.message, options.walletAddress, options.networkID);
        expect(result).toEqual({ success: true });
    });

    it('should fail authentication with invalid wallet signature', () => {
        (verifyWalletAddress as jest.Mock).mockReturnValue(false);

        const options = {
            walletAddress: 'user_wallet_address',
            networkID: 1,
            signature: 'invalid_signature',
            key: 'valid_key',
            message: 'valid_message'
        };
        const result = loginUser(user, options);

        expect(verifyWalletAddress).toHaveBeenCalledWith(options.signature, options.key, options.message, options.walletAddress, options.networkID);
        expect(result).toEqual({ success: false, error: 'Invalid wallet authentication' });
    });

    // Add more tests as needed for different scenarios
});