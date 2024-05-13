import verifySignature from '@cardano-foundation/cardano-verify-datasignature';
import bcrypt from "bcryptjs";
import { randomBytes } from 'crypto';
import { bech32 } from "bech32";

export function isNonEmptyString(str: string): boolean {
    return typeof str === 'string' && str.trim() !== '';
}

export function validateEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export function convertHexToBech32(hex: string) {
    try {
      const bytes = Buffer.from(hex, "hex");
      const words = bech32.toWords(bytes);
      try {
        const result = bech32.encode("stake", words);
        return(result);
      } catch (innerError) {
        console.error("Encoding error:", innerError);
      }
    } catch (error) {
      console.error("Error converting hex to bytes:", error);
    }
  };

export function validatePassword(password: string) {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[A-Za-z/d@$!%*?&].{8,}$/;
    return regex.test(password);
}

export function verifyWalletAddress(signature: string, key: string, message: string, hex: string): boolean {
    try {
        const address = convertHexToBech32(hex);

        return verifySignature(signature, key, message, address);
    } catch (error) {
        console.error("Failed to verify wallet address:", error);
        return false;
    }
}

export function hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
}

export function generateNonce(): string {
    return randomBytes(16).toString('hex'); // Generate a 16-byte hex string
};