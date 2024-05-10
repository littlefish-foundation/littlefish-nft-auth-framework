// src/nonceManager.ts
import { randomBytes } from 'crypto';

export const generateNonce = (): string => {
    return randomBytes(16).toString('hex'); // Generate a 16-byte hex string
};

// Add more functions if you're managing nonce storage and validation
