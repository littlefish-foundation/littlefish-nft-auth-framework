import { Asset } from "src/frontend/types/types";
/**
 * Fetches assets associated with a stake address from the Blockfrost API.
 * @param {string} stakeAddress - The stake address to fetch assets for.
 * @param {string} apiKey - The Blockfrost API key.
 * @param {string} networkId - The network identifier (mainnet or testnet).
 * @returns {Promise<Asset[]>} - A promise that resolves to an array of assets.
 */
export declare function fetchAssets(stakeAddress: string, apiKey: string, networkId: string): Promise<Asset[]>;
/**
 * Checks if a string is non-empty.
 * @param {string} str - The string to check.
 * @returns {boolean} - True if the string is non-empty, false otherwise.
 */
export declare function isNonEmptyString(str: string): boolean;
/**
 * Validates an email address.
 * @param {string} email - The email address to validate.
 * @returns {boolean} - True if the email is valid, false otherwise.
 */
export declare function validateEmail(email: string): boolean;
/**
 * Converts a hexadecimal string to a bech32 address.
 * @param {string} hex - The hexadecimal string to convert.
 * @param {number} walletNetwork - The network identifier (1 for mainnet, 0 for testnet).
 * @returns {string | undefined} - The bech32 address or undefined if conversion fails.
 */
export declare function convertHexToBech32(hex: string, walletNetwork: number): string;
/**
 * Validates a password against a regex pattern.
 * @param {string} password - The password to validate.
 * @returns {boolean} - True if the password is valid, false otherwise.
 */
export declare function validatePassword(password: string): boolean;
/**
 * Verifies a wallet address using a signature, key, message, and hex string.
 * @param {string} signature - The signature to verify.
 * @param {string} key - The key to use for verification.
 * @param {string} message - The message to verify.
 * @param {string} hex - The hex string to convert to a bech32 address.
 * @param {number} walletNetwork - The network identifier (1 for mainnet, 0 for testnet).
 * @returns {boolean} - True if the verification is successful, false otherwise.
 */
export declare function verifyWalletAddress(signature: string, key: string, message: string, hex: string, walletNetwork: number): boolean;
/**
 * Hashes a password using bcrypt.
 * @param {string} password - The password to hash.
 * @returns {string} - The hashed password.
 */
export declare function hashPassword(password: string): string;
/**
 * Verifies a password against a hashed password using bcrypt.
 * @param {string} password - The password to verify.
 * @param {string} hash - The hashed password to compare against.
 * @returns {boolean} - True if the password matches the hash, false otherwise.
 */
export declare function verifyPassword(password: string, hash: string): boolean;
/**
 * Generates a random nonce.
 * @returns {string} - A 16-byte hex string.
 */
export declare function generateNonce(): string;
/**
 * Verifies the assets associated with a wallet address.
 * @param {Asset[]} assets - The assets to verify.
 * @param {string} stakeAddress - The stake address of the wallet.
 * @param {number} walletNetwork - The network identifier (1 for mainnet, 0 for testnet).
 * @returns {Promise<boolean>} - A promise that resolves to true if the assets are verified, false otherwise.
 */
export declare function verifyWalletAssets(assets: Asset[], stakeAddress: string, walletNetwork: number): Promise<boolean>;
/**
 * Verifies if a policy ID exists in the assets associated with a wallet address.
 * @param {string} policyId - The policy ID to verify.
 * @param {string} stakeAddress - The stake address of the wallet.
 * @param {number} walletNetwork - The network identifier (1 for mainnet, 0 for testnet).
 * @returns {Promise<boolean>} - A promise that resolves to true if the policy ID is found, false otherwise.
 */
export declare function verifyAssetPolicy(policyId: string, stakeAddress: string, walletNetwork: number): Promise<boolean>;
/**
 * Verifies the ownership of a specific asset associated with a wallet address.
 * @param {string} stakeAddress - The stake address of the wallet.
 * @param {Asset} asset - The asset to verify.
 * @param {number} walletNetwork - The network identifier (1 for mainnet, 0 for testnet).
 * @returns {Promise<boolean>} - A promise that resolves to true if the asset is verified, false otherwise.
 */
export declare function verifyAssetOwnership(stakeAddress: string, asset: Asset, walletNetwork: number): Promise<boolean>;
/**
 * Finds a matching asset in a list of assets.
 * @param {Asset[]} assets - The list of assets to search.
 * @param {Asset} userAsset - The asset to find a match for.
 * @returns {Asset | null} - The matching asset or null if no match is found.
 */
export declare function findMatchingAsset(assets: Asset[], userasset: Asset): Asset | null;
//# sourceMappingURL=utils.d.ts.map