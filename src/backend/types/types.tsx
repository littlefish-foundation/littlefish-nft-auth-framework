export interface SignupOptions {
    email?: string;
    password?: string;
    walletAddress?: string;
    walletNetwork?: number;
    signature?: string;
    key?: string;
    nonce?: string;
}

export interface User {
    email?: string;
    password?: string;
    walletAddress?: string;
    walletNetwork?: number;
}

export interface SignupResult {
    success: boolean;
    email?: string;
    passwordHash?: string;
    walletAddress?: string;
    walletNetwork?: number;
    error?: string;
}

export interface LoginResult {
    success: boolean;
    error?: string;
}