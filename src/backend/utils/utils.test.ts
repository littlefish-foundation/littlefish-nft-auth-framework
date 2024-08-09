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
  findMatchingAsset,
  metadataReader
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

  test("metadataReader fetches asset information and gets metadata of the asset", async () => {
    const mockResponse =
    {
      asset: "9b80f2ad359fcc76802228b0cac920ce41e30b50edf86a79658597c74c6974746c6546697368417574684e4654303031",
      policy_id: "9b80f2ad359fcc76802228b0cac920ce41e30b50edf86a79658597c7",
      asset_name: "4c6974746c6546697368417574684e4654303031",
      fingerprint: "asset1dxf8jwms9zmzxpecayc304dpxe8vgckcp2nnvj",
      quantity: "1",
      initial_mint_tx_hash: "264706f45b2a32b7479061b9c19b6fc9c4cef4b2c3027f5ded4ad965c133b274",
      mint_or_burn_count: 1,
      onchain_metadata: {
        sso: {
          role: [
            "admin"
          ],
          issuer: "littlefishFoundation",
          version: "0.1.0",
          maxUsage: 10,
          tiedWallet: "stake_test1uqz3slthktsttndksu2r5wqvlz78urn0lc840vkzlm33vegq6def0",
          issuanceDate: "2024-07-13T10:00:00Z",
          expirationDate: "2025-07-13T10:00:00Z",
          isTransferable: 0,
          inactivityPeriod: "30d",
          uniqueIdentifier: "LF-AUTH-001-2024",
          isMaxUsageEnabled: 1,
          isInactivityEnabled: 1
        },
        name: "LittleFish Authentication Token 001",
        files: [
          {
            src: "ipfs://QmVoEvfny6U2GEYV2k42bpbkFdSYn7iXBRL9mRYDAGN3UM",
            name: "littlefish_auth_token_test.png",
            mediaType: "image/png"
          }
        ],
        image: "ipfs://QmVoEvfny6U2GEYV2k42bpbkFdSYn7iXBRL9mRYDAGN3UM",
        mediaType: "image/png",
        description: "Authentication token for the LittleFish platform - User 001"
      },
      onchain_metadata_standard: "CIP25v1",
      onchain_metadata_extra: null,
      metadata: null
    };
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

    const [metadata] = await metadataReader({ policyID: "9b80f2ad359fcc76802228b0cac920ce41e30b50edf86a79658597c7", assetName: "4c6974746c6546697368417574684e4654303031", amount: 1 }, "apiKey", "testnet");

    expect(metadata).toEqual({
      role: [
        "admin"
      ],
      issuer: "littlefishFoundation",
      version: "0.1.0",
      maxUsage: 10,
      tiedWallet: "stake_test1uqz3slthktsttndksu2r5wqvlz78urn0lc840vkzlm33vegq6def0",
      issuanceDate: "2024-07-13T10:00:00Z",
      expirationDate: "2025-07-13T10:00:00Z",
      isTransferable: false,
      inactivityPeriod: "30d",
      uniqueIdentifier: "LF-AUTH-001-2024",
      isMaxUsageEnabled: true,
      isInactivityEnabled: true
    });
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
