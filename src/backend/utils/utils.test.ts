import { 
  fetchAssets, 
  isNonEmptyString, 
  validateEmail, 
  convertHexToBech32, 
  validatePassword, 
  verifyWalletAddress, 
  hashPassword, 
  verifyPassword, 
  generateNonce, 
  verifyWalletAssets, 
  verifyAssetPolicy, 
  verifyAssetOwnership, 
  findMatchingAsset 
} from './utils'; // Replace 'yourModule' with the actual module file
import verifySignature from "@cardano-foundation/cardano-verify-datasignature";
import * as bcrypt from "bcryptjs";
import { getConfig } from "../config";
import fetchMock from 'jest-fetch-mock';
import { hash } from 'crypto';

fetchMock.enableMocks();

jest.mock('@cardano-foundation/cardano-verify-datasignature', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../config', () => ({
  getConfig: jest.fn(),
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => Buffer.from('1234567890123456')),
}));

jest.mock("bcryptjs", () => ({
  compareSync: jest.fn((s: string, hash: string) => Boolean),
  hashSync: jest.fn((s: string, salt?: string | number) => String),
}));

describe("Test suite for your module functions", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
  });

  test("fetchAssets fetches and returns assets correctly", async () => {
    const mockResponse = [
      { unit: "policyIDassetName1", quantity: "1000" },
      { unit: "policyIDassetName2", quantity: "2000" }
    ];
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

    const assets = await fetchAssets("stakeAddress", "apiKey", "testnet");
    
    expect(assets).toEqual([
      { policyID: "policyIDassetName1", assetName: "", amount: 1000 },
      { policyID: "policyIDassetName2", assetName: "", amount: 2000 }
    ]);
  });

  test("isNonEmptyString returns true for non-empty string", () => {
    expect(isNonEmptyString("Hello")).toBe(true);
  });

  test("isNonEmptyString returns false for empty string", () => {
    expect(isNonEmptyString("")).toBe(false);
  });

  test("validateEmail returns true for valid email", () => {
    expect(validateEmail("test@example.com")).toBe(true);
  });

  test("validateEmail returns false for invalid email", () => {
    expect(validateEmail("invalid-email")).toBe(false);
  });

  test("convertHexToBech32 converts hex to bech32 address", () => {
    const hex = "hexstring";
    const walletNetwork = 1; // Mainnet
    const bech32Address = convertHexToBech32(hex, walletNetwork);
    
    expect(bech32Address).toBeDefined();
  });

  test("validatePassword returns true for valid password", () => {
    expect(validatePassword("Valid123Valid123")).toBe(true);
  });

  test("validatePassword returns false for invalid password", () => {
    expect(validatePassword("invalid")).toBe(false);
  });

  test("verifyWalletAddress verifies address correctly", () => {
    const signature = "signature";
    const key = "key";
    const message = "message";
    const hex = "hexstring";
    const walletNetwork = 1;

    (verifySignature as jest.Mock).mockReturnValue(true);

    const result = verifyWalletAddress(signature, key, message, hex, walletNetwork);
    
    expect(result).toBe(true);
  });

  describe('generateNonce', () => {
    it('generates a 16-byte hex string', () => {
      //const mockRandomBytes = jest.fn().mockReturnValue(Buffer.from('1234567890123456'));
      //(crypto.randomBytes as jest.Mock).mockImplementation(mockRandomBytes);
      const nonce = generateNonce();
      expect(nonce).toBe('31323334353637383930313233343536'); // Buffer '1234567890123456' converted to hex string
    });
  });

  test("verifyWalletAssets verifies assets correctly", async () => {
    const mockConfig = { apiKey: "apiKey", networkId: "testnet" };
    (getConfig as jest.Mock).mockReturnValue(mockConfig);

    const mockResponse = [
      { unit: "policyIDassetName1", quantity: "1000" },
      { unit: "policyIDassetName2", quantity: "2000" }
    ];
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

    const assets = [
      { policyID: "policyIDassetName1", assetName: "", amount: 1000 },
      { policyID: "policyIDassetName2", assetName: "", amount: 2000 }
    ];
    const result = await verifyWalletAssets(assets, "stakeAddress", 1);
    
    expect(result).toBe(true);
  });

  test("verifyAssetPolicy verifies policy ID correctly", async () => {
    const mockConfig = { apiKey: "apiKey", networkId: "testnet" };
    (getConfig as jest.Mock).mockReturnValue(mockConfig);

    const mockResponse = [
      { unit: "policyIDassetName1", quantity: "1000" },
      { unit: "policyIDassetName1", quantity: "2000" }
    ];
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

    const result = await verifyAssetPolicy("policyIDassetName1", "stakeAddress", 1);
    
    expect(result).toBe(true);
  });

  test("verifyAssetOwnership verifies asset ownership correctly", async () => {
    const mockConfig = { apiKey: "apiKey", networkId: "testnet" };
    (getConfig as jest.Mock).mockReturnValue(mockConfig);

    const mockResponse = [
      { unit: "policyIDassetName", quantity: "1000" }
    ];
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

    const asset = { policyID: "policyIDassetName", assetName: "", amount: 1000 };
    const result = await verifyAssetOwnership("stakeAddress", asset, 1);
    
    expect(result).toBe(true);
  });

  test("findMatchingAsset finds matching asset correctly", () => {
    const assets = [
      { policyID: "policyID", assetName: "assetName1", amount: 1000 },
      { policyID: "policyID", assetName: "assetName2", amount: 2000 }
    ];
    const userAsset = { policyID: "policyID", assetName: "assetName1", amount: 1000 };
    
    const result = findMatchingAsset(assets, userAsset);
    
    expect(result).toEqual(userAsset);
  });
});
