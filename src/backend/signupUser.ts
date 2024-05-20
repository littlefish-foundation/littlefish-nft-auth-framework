import { validateEmail, verifyWalletAddress } from './utils/utils';
import { SignupOptions, SignupResult } from './types/types';

export function signupUser(
    options: SignupOptions
): SignupResult {
    try {
        
        const { email, password, walletAddress, walletNetwork, signature, key, nonce } = options;
        if (walletAddress && signature && key && nonce && walletNetwork) {
            const isValidSignature = verifyWalletAddress(signature, key, nonce, walletAddress);
            if (!isValidSignature) {
                return { success: false, error: 'Invalid wallet authentication' };
            }
            return { success: true, walletAddress, walletNetwork};
        }
        if (email && password) {
            if (!validateEmail(email)) {
                return { success: false, error: 'Invalid email format' };
            }
            return { success: true, email, passwordHash : password };
        }
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message || "Signup failed due to an input validation error" };
        } else {
            return { success: false};
        }
    }
    return { success: false, error: "Invalid signup inputs" };
}