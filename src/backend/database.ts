import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({ where: { email } });
}

export async function findUserByWalletAddress(walletAddress: string) {
  return await prisma.user.findUnique({ where: { walletAddress } });
}
