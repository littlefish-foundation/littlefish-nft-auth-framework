import { Asset } from "../../frontend/types/types";

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

export interface User {
    email?: string;
    password?: string;
    stakeAddress?: string;
    walletNetwork?: number;
    asset?: Asset;
}

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

export interface LoginResult {
    success: boolean;
    error?: string;
}