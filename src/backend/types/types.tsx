import { Asset } from "../../frontend/types/types";


/**
 * Interface for the signup options. This interface can be used in three ways:
 * 1. To signup a user with email and password.
 * 2. To signup a user with wallet address and signature.
 * 3. To signup a user with wallet address, signature, and asset.
 * @interface SignupOptions
 * @property {string} email - The email address of the user.
 * @property {string} password - The password of the user.
 * @property {string} stakeAddress - The wallet address of the user.
 * @property {number} walletNetwork - The network of the wallet.
 * @property {Asset} asset - The asset to be verified.
 * @property {string} signature - The signature of the user.
 * @property {string} key - The key of the user.
 * @property {string} nonce - The nonce of the user.
 * @property {string[]} authPolicies - The authentication policies of the user.
 * @property {boolean} authPolicyStrict - The strictness of the authentication policy.
 */
export interface SignupOptions {
    email?: string;
    password?: string;
    stakeAddress?: string;
    walletNetwork?: number;
    asset?: Asset;
    signature?: string;
    key?: string;
    nonce?: string;
    authPolicies?: string[];
    authPolicyStrict?: boolean;
}

/**
 * Interface for the login options. This interface can be used in three ways:
 * 1. To login a user with email and password.
 * 2. To login a user with wallet address and signature.
 * 3. To login a user with wallet address, signature, and asset.
 * @interface LoginOptions
 * @property {string} email - The email address of the user.
 * @property {string} password - The password of the user.
 * @property {string} stakeAddress - The wallet address of the user.
 * @property {number} walletNetwork - The network of the wallet.
 * @property {Asset[]} assets - The assets to be verified.
 * @property {string} signature - The signature of the user.
 * @property {string} key - The key of the user.
 * @property {string} nonce - The nonce of the user.
 * @property {string} authPolicy - The authentication policy of the user.
 */
export interface LoginOptions {
    email?: string;
    password?: string;
    stakeAddress?: string;
    walletNetwork?: number;
    assets?: Asset[];
    signature?: string;
    key?: string;
    nonce?: string;
    authPolicy?: string;
}

/**
 * Interface representing a user. This includes optional fields for email, password hash, stake address,
 * wallet network, and associated asset.
 * @interface User
 * @property {string} email - The email address of the user.
 * @property {string} password - The password hash of the user.
 * @property {string} stakeAddress - The wallet address of the user.
 * @property {number} walletNetwork - The network of the wallet.
 * @property {Asset} asset - The asset associated with the user.
 */
export interface User {
    email?: string;
    password?: string;
    stakeAddress?: string;
    walletNetwork?: number;
    asset?: Asset;
}

/**
 * Interface for the result of the signup process. This includes fields indicating the success of the signup
 * and optional fields for user details or error messages.
 * @interface SignupResult
 * @property {boolean} success - Indicates if the signup was successful.
 * @property {string} email - The email address if signup was successful.
 * @property {string} passwordHash - The password hash if signup was successful.
 * @property {string} stakeAddress - The stake address if signup was successful.
 * @property {number} walletNetwork - The network of the wallet if signup was successful.
 * @property {Asset} asset - The asset if signup was successful.
 * @property {string} error - The error message if signup failed.
 * @property {string} verifiedPolicy - The verified asset policy if signup was successful.
 */
export interface SignupResult {
    success: boolean;
    email?: string;
    passwordHash?: string;
    stakeAddress?: string;
    walletNetwork?: number;
    asset?: Asset;
    error?: string;
    verifiedPolicy?: string;
}

/**
 * Interface for the result of the login process. This includes fields indicating the success of the login
 * and optional fields for error messages.
 * @interface LoginResult
 * @property {boolean} success - Indicates if the login was successful.
 * @property {string} error - The error message if login failed.
 */
export interface LoginResult {
    success: boolean;
    error?: string;
}