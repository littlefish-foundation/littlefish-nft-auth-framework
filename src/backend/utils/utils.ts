import verifySignature from '@cardano-foundation/cardano-verify-datasignature';
import { Address } from '@emurgo/cardano-serialization-lib-asmjs';
import bcrypt from "bcryptjs";
import { randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';

export function validateEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export function validatePassword(password: string) {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[A-Za-z/d@$!%*?&].{8,}$/;
    return regex.test(password);
}

export function verifyWalletAddress(signature: string, key: string, message: string, hex: string, networkID: number = 0): boolean {
    try {
        const address = Address.from_hex(hex);
        const bech32Prefix = networkID === 1 ? "addr" : "addr_test";
        const bech32Address = address.to_bech32(bech32Prefix);

        return verifySignature(signature, key, message, bech32Address);
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

/**
* Finds a user by email using the provided Prisma client instance.
* @param {PrismaClient} prisma
* @param {string} email
* @return {Promise<User | null>}
*/
export async function findUserByEmail(prisma: PrismaClient, email: string) {
    return await prisma.user.findUnique({ where: { email } });
}

/**
* Finds a user by wallet address using the provided Prisma client instance.
* @param {PrismaClient} prisma
* @param {string} walletAddress
* @return {Promise<User | null>}
*/
export async function findUserByWalletAddress(prisma: PrismaClient, walletAddress: string) {
    return await prisma.user.findUnique({ where: { walletAddress } });
}