import { verifyPassword, verifyWalletAddress, validateEmail, isNonEmptyString } from './utils/utils';
import { SignupOptions, LoginResult, User } from './types/types';

/**
 * Authentication function to validate users based on email and password or a wallet address.
 * Assumes that user data fetching is handled outside this function.
 *
 * @param {User} user - The user object containing at least email, password hash, or wallet address.
 * @param {SignupOptions} options - The options containing credentials for verification.
 * @return {LoginResult} The result of the authentication.
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
    } else if (email && password) {
        if (!validateEmail(email) || email !== user.email) {
            return { success: false, error: 'Invalid email or email format' };
        }
        return { success: true };
    }
    return { success: false, error: 'Invalid login inputs' };
}
