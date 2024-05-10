import { hashPassword, validateEmail, validatePassword, verifyWalletAddress } from './utils/utils';

function validateSignupInputs(email?: string, password?: string, walletAddress?: string) {
    if (email && !validateEmail(email)) {
        throw new Error("Invalid email format.");
    }
    if (password && !validatePassword(password)) {
        throw new Error("Password must be a stronger.");
    }
}

export function signupUser(
    email?: string,
    password?: string,
    walletAddress?: string,
    networkID?: number,
    signature?: string,
    key?: string,
    message?: string,
): { success: boolean, email?: string, passwordHash?: string, walletAddress?: string, walletNetwork?: number, error?: string } {
    try {
        validateSignupInputs(email, password, walletAddress);

        if (walletAddress && signature && key && message && networkID) {
            const isValidSignature = verifyWalletAddress(signature, key, message, walletAddress, networkID);
            if (!isValidSignature) {
                return { success: false, error: 'Invalid wallet authentication' };
            }
            return { success: true, walletAddress, walletNetwork: networkID };
        } else if (email && password) {
            return { success: true, email, passwordHash: hashPassword(password) };
        }
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message || "Signup failed due to an input validation error" };
        } else {
            return { success: false };
        }
    }
    return { success: false, error: "Invalid signup inputs" };
}