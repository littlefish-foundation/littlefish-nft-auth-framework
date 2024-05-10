import { verifyPassword, verifyWalletAddress, validateEmail, isNonEmptyString } from './utils/utils';


function validateLoginInputs(user: { email?: string, password?: string, walletAddress?: string }, email?: string, password?: string, walletAddress?: string, signature?: string, key?: string, message?: string, networkID?: number) {
    if (!user) throw new Error("User object is required.");

    if (walletAddress && signature && key && message && networkID) {
        // Validate wallet address and related parameters
        if (!isNonEmptyString(walletAddress) || !isNonEmptyString(signature) || !isNonEmptyString(key) || !isNonEmptyString(message) || typeof networkID !== 'number'   ) {
            throw new Error("All wallet authentication parameters must be non-empty strings.");
        }
    } else if (email && password) {
        // Validate email and password
        if (!validateEmail(email)) throw new Error("Invalid email format.");
        if (!isNonEmptyString(password)) throw new Error("Password must be a non-empty string.");
    } else {
        // Ensure that some form of authentication data is provided
        throw new Error("Authentication data is incomplete.");
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
export function loginUser(
    user: { email?: string, password?: string, walletAddress?: string, walletNetwork?: number },
    email?: string,
    password?: string,
    walletAddress?: string,
    signature?: string,
    key?: string,
    message?: string,
    networkID?: number
) {
    validateLoginInputs(user, email, password, walletAddress, signature, key, message, networkID);

    if (walletAddress && signature && key && message && walletAddress !== user.walletAddress) {
        if (networkID !== user.walletNetwork) {
            throw new Error('Invalid network');
        }
        const isValidSignature = verifyWalletAddress(signature, key, message, walletAddress, networkID);
        if (!isValidSignature) {
            throw new Error('Invalid wallet authentication');
        }
        return user;
    } else if (email && password && email !== user.email) {
        if (user.password && verifyPassword(password, user.password)) {
            return user;
        }
    }
    throw new Error('Authentication failed');
}