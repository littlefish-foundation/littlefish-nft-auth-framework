import { Sso } from "./sso";
import { verifyWalletAddress, metadataReader } from "./utils/utils";
import { SsoOptions, SsoResult } from "./types/types";
import { error } from "console";

// Mock the utility functions
jest.mock("./utils/utils");

const mockVerifyWalletAddress = verifyWalletAddress as jest.MockedFunction<
  typeof verifyWalletAddress
>;
const mockMetadataReader = metadataReader as jest.MockedFunction<
  typeof metadataReader
>;

describe("Sso", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should validate the metadata sso", async () => {
    const options: SsoOptions = {
      stakeAddress: "stake1uxyz",
      signature: "signature",
      key: "key",
      nonce: "nonce",
      walletNetwork: 1, // walletNetwork is a number
      asset: {
        policyID: "policy",
        assetName: "asset",
        amount: 1,
      },
      issuerOption: "issuer",
      platformUniqueIdentifier: "unique",
      usageCount: 2,
    };
    mockVerifyWalletAddress.mockReturnValue(true);
    mockMetadataReader.mockResolvedValue([
      {
        sso: {
          version: "0.1.0",
          uniqueIdentifier: "unique",
          issuer: "issuer",
          issuanceDate: "2022-01-01",
          expirationDate: "2024-12-31",
          isTransferable: 1,
          tiedWallet: "wallet",
          isMaxUsageEnabled: 1,
          maxUsage: 10,
          isInactivityEnabled: 1,
          inactivityPeriod: 30,
          role: "role",
        },
      },
      true,
    ]);

    const result: SsoResult = await Sso(options);

    expect(result).toEqual({
      success: true,
      roles: "role",
    });
    expect(mockVerifyWalletAddress).toHaveBeenCalledWith(
      options.signature,
      options.key,
      options.nonce,
      options.stakeAddress,
      options.walletNetwork
    );
  });

  test("should not validate the metadata sso due to expiration date", async () => {
    const options: SsoOptions = {
      stakeAddress: "stake1uxyz",
      signature: "signature",
      key: "key",
      nonce: "nonce",
      walletNetwork: 1, // walletNetwork is a number
      asset: {
        policyID: "policy",
        assetName: "asset",
        amount: 1,
      },
      issuerOption: "issuer",
      platformUniqueIdentifier: "unique",
      usageCount: 2,
    };
    mockVerifyWalletAddress.mockReturnValue(true);
    mockMetadataReader.mockResolvedValue([
      {
        sso: {
          version: "0.1.0",
          uniqueIdentifier: "unique",
          issuer: "issuer",
          issuanceDate: "2022-01-01",
          expirationDate: "2022-12-31",
          isTransferable: 1,
          tiedWallet: "wallet",
          isMaxUsageEnabled: 1,
          maxUsage: 10,
          isInactivityEnabled: 1,
          inactivityPeriod: 30,
          role: "role",
        },
      },
      true,
    ]);

    const result: SsoResult = await Sso(options);

    expect(result).toEqual({
      success: false,
      error: "Asset has expired",
    });
    expect(mockVerifyWalletAddress).toHaveBeenCalledWith(
      options.signature,
      options.key,
      options.nonce,
      options.stakeAddress,
      options.walletNetwork
    );
  });

  test("should not validate the metadata sso due to issuer mismatch", async () => {
    const options: SsoOptions = {
      stakeAddress: "stake1uxyz",
      signature: "signature",
      key: "key",
      nonce: "nonce",
      walletNetwork: 1, // walletNetwork is a number
      asset: {
        policyID: "policy",
        assetName: "asset",
        amount: 1,
      },
      issuerOption: "issuer",
      platformUniqueIdentifier: "unique",
      usageCount: 2,
    };
    mockVerifyWalletAddress.mockReturnValue(true);
    mockMetadataReader.mockResolvedValue([
      {
        sso: {
          version: "0.1.0",
          uniqueIdentifier: "unique",
          issuer: "wrongIssuer",
          issuanceDate: "2022-01-01",
          expirationDate: "2024-12-31",
          isTransferable: 1,
          tiedWallet: "wallet",
          isMaxUsageEnabled: 1,
          maxUsage: 10,
          isInactivityEnabled: 1,
          inactivityPeriod: 30,
          role: "role",
        },
      },
      true,
    ]);

    const result: SsoResult = await Sso(options);

    expect(result).toEqual({
      success: false,
      error: "Issuer does not match",
    });
    expect(mockVerifyWalletAddress).toHaveBeenCalledWith(
      options.signature,
      options.key,
      options.nonce,
      options.stakeAddress,
      options.walletNetwork
    );
  });

  test("should not validate the metadata sso due to no sso available", async () => {
    const options: SsoOptions = {
      stakeAddress: "stake1uxyz",
      signature: "signature",
      key: "key",
      nonce: "nonce",
      walletNetwork: 1, // walletNetwork is a number
      asset: {
        policyID: "policy",
        assetName: "asset",
        amount: 1,
      },
      issuerOption: "issuer",
      platformUniqueIdentifier: "unique",
      usageCount: 2,
    };
    mockVerifyWalletAddress.mockReturnValue(true);
    mockMetadataReader.mockResolvedValue([{}, false]);

    const result: SsoResult = await Sso(options);

    expect(result).toEqual({
      success: false,
      error: "No SSO available for the asset",
    });
    expect(mockVerifyWalletAddress).toHaveBeenCalledWith(
      options.signature,
      options.key,
      options.nonce,
      options.stakeAddress,
      options.walletNetwork
    );
  });

  test("should validate the metadata sso with non-transferable asset", async () => {
    const options: SsoOptions = {
      stakeAddress: "stake1uxyz",
      signature: "signature",
      key: "key",
      nonce: "nonce",
      walletNetwork: 1, // walletNetwork is a number
      asset: {
        policyID: "policy",
        assetName: "asset",
        amount: 1,
      },
      issuerOption: "Issuer",
      platformUniqueIdentifier: "unique",
      usageCount: 2,
    };
    mockVerifyWalletAddress.mockReturnValue(true);
    mockMetadataReader.mockResolvedValue([
        {
          sso: {
            version: "0.1.0",
            uniqueIdentifier: "unique",
            issuer: "Issuer",
            issuanceDate: "2022-01-01",
            expirationDate: "2024-12-31",
            isTransferable: 0,
            tiedWallet: "stake1uxyz",
            isMaxUsageEnabled: 1,
            maxUsage: 10,
            isInactivityEnabled: 1,
            inactivityPeriod: 30,
            role: "role",
          },
        },
        true,
      ]);

    const result: SsoResult = await Sso(options);

    expect(result).toEqual({
      success: true,
      roles: "role",
    });
    expect(mockVerifyWalletAddress).toHaveBeenCalledWith(
      options.signature,
      options.key,
      options.nonce,
      options.stakeAddress,
      options.walletNetwork
    );
  });

  test("should not validate the metadata sso due to invalid owner", async () => {
    const options: SsoOptions = {
      stakeAddress: "stake1uxyz",
      signature: "signature",
      key: "key",
      nonce: "nonce",
      walletNetwork: 1, // walletNetwork is a number
      asset: {
        policyID: "policy",
        assetName: "asset",
        amount: 1,
      },
      issuerOption: "Issuer",
      platformUniqueIdentifier: "unique",
      usageCount: 2,
    };
    mockVerifyWalletAddress.mockReturnValue(true);
    mockMetadataReader.mockResolvedValue([
        {
          sso: {
            version: "0.1.0",
            uniqueIdentifier: "unique",
            issuer: "Issuer",
            issuanceDate: "2022-01-01",
            expirationDate: "2024-12-31",
            isTransferable: 0,
            tiedWallet: "stake2uxyz",
            isMaxUsageEnabled: 1,
            maxUsage: 10,
            isInactivityEnabled: 1,
            inactivityPeriod: 30,
            role: "role",
          },
        },
        true,
      ]);

    const result: SsoResult = await Sso(options);

    expect(result).toEqual({
      success: false,
      error: "Invalid wallet for the asset",
    });
    expect(mockVerifyWalletAddress).toHaveBeenCalledWith(
      options.signature,
      options.key,
      options.nonce,
      options.stakeAddress,
      options.walletNetwork
    );
  });

  test("should not validate the metadata sso due max usage", async () => {
    const options: SsoOptions = {
      stakeAddress: "stake1uxyz",
      signature: "signature",
      key: "key",
      nonce: "nonce",
      walletNetwork: 1, // walletNetwork is a number
      asset: {
        policyID: "policy",
        assetName: "asset",
        amount: 1,
      },
      issuerOption: "Issuer",
      platformUniqueIdentifier: "unique",
      usageCount: 10,
    };
    mockVerifyWalletAddress.mockReturnValue(true);
    mockMetadataReader.mockResolvedValue([
        {
          sso: {
            version: "0.1.0",
            uniqueIdentifier: "unique",
            issuer: "Issuer",
            issuanceDate: "2022-01-01",
            expirationDate: "2024-12-31",
            isTransferable: 0,
            tiedWallet: "stake1uxyz",
            isMaxUsageEnabled: 1,
            maxUsage: 10,
            isInactivityEnabled: 1,
            inactivityPeriod: 30,
            role: "role",
          },
        },
        true,
      ]);

    const result: SsoResult = await Sso(options);

    expect(result).toEqual({
      success: false,
      error: "Maximum usage reached",
    });
    expect(mockVerifyWalletAddress).toHaveBeenCalledWith(
      options.signature,
      options.key,
      options.nonce,
      options.stakeAddress,
      options.walletNetwork
    );
  });
});
