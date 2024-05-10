import { verifyPassword, verifyWalletAddress, validateEmail } from './utils/utils';


function validateInputs(user: { email?: string, password?: string, walletAddress?: string }, email: string, password: string, walletAddress: string, signature: string, key: string, message: string, networkID: number) {
    if (!user) throw new Error("User object is required.");
    if (walletAddress) {
        if (!isNonEmptyString(walletAddress) || !isNonEmptyString(signature) || !isNonEmpty, string(key) || !isNonEmptyString(message)) {
            throw new Error("All wallet authentication parameters must be non-empty strings.");
        }
    } else if (email && password) {
        if (!validateEmail(email)) throw new Error("Invalid email format.");
        if (!isNonEmptyString(password)) throw new Error("Password must be a non-empty string.");
    } else {
        throw new Error("Invalid authentication data provided.");
    }
}
/**
 * Authentication function to validate users based on email and password or a wallet address.
 * Assumes that user data fetching is handled outside this function.
 *
 * @param {object} user - The user object containing at least email, password hash, or wallet address.
 * @param {string} password - The plain text password for verification.
 * @param {string} walletAddress - The wallet address for verification.
 * @return {object} The authenticated user object or null if authentication fails.
 */
export async function authenticateUser(
    user: { email?: string, password?: string, walletAddress?: string },
    email: string,
    password: string,
    walletAddress: string,
    signature: string,
    key: string,
    message: string,
    networkID: number
) {
    if (walletAddress) {
        if (walletAddress !== user.walletAddress) {
            throw new Error('Invalid wallet address');
        }
        const isValidSignature = verifyWalletAddress(signature, key, message, walletAddress, networkID);
        if (!isValidSignature) {
            throw new Error('Invalid wallet signature');
        }
        return user;
    } else if (email && password) {
        if (email !== user.email) {
            throw new Error('Invalid email');
        }
        if (user.password && verifyPassword(password, user.password)) {
            return user;
        }
    }
    throw new Error('Authentication failed');
}