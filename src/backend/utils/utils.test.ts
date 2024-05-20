import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { bech32 } from 'bech32';
import verifySignature from '@cardano-foundation/cardano-verify-datasignature';
import {
  isNonEmptyString,
  validateEmail,
  convertHexToBech32,
  validatePassword,
  verifyWalletAddress,
  hashPassword,
  verifyPassword,
  generateNonce,
} from '../utils/utils';

// Mocking the verifySignature module correctly
jest.mock('@cardano-foundation/cardano-verify-datasignature', () => jest.fn());

describe('Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isNonEmptyString', () => {
    it('should return true for a non-empty string', () => {
      expect(isNonEmptyString('hello')).toBe(true);
    });

    it('should return false for an empty string', () => {
      expect(isNonEmptyString('')).toBe(false);
    });

    it('should return false for a non-string value', () => {
      expect(isNonEmptyString(123 as any)).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should return true for a valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('should return false for an invalid email', () => {
      expect(validateEmail('test')).toBe(false);
    });
  });

  describe('convertHexToBech32', () => {
    it('should convert a hex string to a bech32 string', () => {
      const hex = '0123456789abcdef';
      const expectedBech32 = bech32.encode('stake', bech32.toWords(Buffer.from(hex, 'hex')));
      expect(convertHexToBech32(hex)).toBe(expectedBech32);
    });

    it('should handle encoding errors', () => {
      const hex = 'invalidhex';
      expect(() => convertHexToBech32(hex)).toThrow();
    });
  });

  describe('validatePassword', () => {
    it('should return true for a valid password', () => {
      expect(validatePassword('Password123')).toBe(true);
    });

    it('should return false for an invalid password', () => {
      expect(validatePassword('password')).toBe(false);
    });
  });

  describe('verifyWalletAddress', () => {
    const mockSignature = 'signature';
    const mockKey = 'key';
    const mockMessage = 'message';
    const mockHex = '0123456789abcdef';

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should return true for a valid wallet address', () => {
      const mockBech32Address = bech32.encode('stake', bech32.toWords(Buffer.from(mockHex, 'hex')));
      (verifySignature as jest.Mock).mockReturnValue(true);
      expect(verifyWalletAddress(mockSignature, mockKey, mockMessage, mockHex)).toBe(true);
      expect(verifySignature).toHaveBeenCalledWith(mockSignature, mockKey, mockMessage, mockBech32Address);
    });

    it('should return false for an invalid wallet address', () => {
      const mockBech32Address = bech32.encode('stake', bech32.toWords(Buffer.from(mockHex, 'hex')));
      (verifySignature as jest.Mock).mockReturnValue(false);
      expect(verifyWalletAddress(mockSignature, mockKey, mockMessage, mockHex)).toBe(false);
    });

    it('should handle verification errors', () => {
      (verifySignature as jest.Mock).mockImplementation(() => {
        throw new Error('Verification error');
      });
      expect(verifyWalletAddress(mockSignature, mockKey, mockMessage, mockHex)).toBe(false);
    });
  });

  describe('hashPassword', () => {
    it('should hash the password', () => {
      const password = 'Password123';
      const hashedPassword = hashPassword(password);
      expect(hashedPassword).not.toBe(password);
      expect(bcrypt.compareSync(password, hashedPassword)).toBe(true);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for a valid password', () => {
      const password = 'Password123';
      const hashedPassword = bcrypt.hashSync(password, 10);
      expect(verifyPassword(password, hashedPassword)).toBe(true);
    });

    it('should return false for an invalid password', () => {
      const password = 'password';
      const hashedPassword = bcrypt.hashSync('Password123', 10);
      expect(verifyPassword(password, hashedPassword)).toBe(false);
    });
  });

  describe('generateNonce', () => {
    it('should generate a 16-byte hex string', () => {
      const nonce = generateNonce();
      expect(nonce.length).toBe(32);
      expect(/^[0-9a-f]+$/.test(nonce)).toBe(true);
    });
  });
});
