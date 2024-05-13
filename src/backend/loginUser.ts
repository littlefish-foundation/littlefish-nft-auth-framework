import { verifyPassword, verifyWalletAddress, validateEmail, isNonEmptyString } from './utils/utils';
import { SignupOptions, LoginResult, User} from './types/types';

/**
 * Authentication function to validate users based on email and password or a wallet address.
 * Assumes that user data fetching is handled outside this function.
 *
 * @param {object} user - The user object containing at least email, password hash, or wallet address.
 * @param {string} password - The plain text password for verification.
 * @param {string} walletAddress - The wallet address for verification.
 * @return {object} The authenticated user object or null if authentication fails.
 */
export function loginUser(
    user: User,
    options: SignupOptions
): LoginResult {
    const { email, password, walletAddress, walletNetwork, signature, key, nonce } = options;

    if (walletAddress && signature && key && nonce && walletNetwork) {
        if (walletAddress !== user.walletAddress || walletNetwork !== user.walletNetwork) {
            return { success: false, error: 'Invalid network or wallet address' };
        }
        const isValidSignature = verifyWalletAddress(signature, key, nonce, walletAddress);
        if (!isValidSignature) {
            return { success: false, error: 'Invalid wallet authentication' };
        }
        return { success: true };
    } else if (email && password && email !== user.email) {
        if (!validateEmail(email) || email !== user.email) {
            return { success: false, error: 'Invalid email or email format' };
        }
        if (!isNonEmptyString(password) || (user.password && !verifyPassword(password, user.password))) {
            return { success: false, error: 'Invalid password' };
        }
        return { success: true };
    }
    return { success: false, error: 'Invalid login inputs' };
}