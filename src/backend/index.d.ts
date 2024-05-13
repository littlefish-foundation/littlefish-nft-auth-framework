// backend/index.d.ts
import { SignupOptions, SignupResult, User, LoginResult } from './types/types';
export function signupUser(options: SignupOptions): SignupResult;
export function loginUser(user: User, options: SignupOptions): LoginResult;
export function generateNonce(): string;
export function verifyWalletAddress(signature: string, key: string, message: string, hex: string): boolean;

export { SignupOptions, SignupResult, User, LoginResult } from './types/types';
