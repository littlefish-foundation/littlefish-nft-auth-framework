import { signupUser } from "./signupUser";
import { validateEmail, verifyWalletAddress, verifyAssetOwnership } from "./utils/utils";
import { SignupOptions, SignupResult } from "./types/types";

// Mock the utility functions
jest.mock("./utils/utils");

const mockValidateEmail = validateEmail as jest.MockedFunction<typeof validateEmail>;
const mockVerifyWalletAddress = verifyWalletAddress as jest.MockedFunction<typeof verifyWalletAddress>;
const mockVerifyAssetOwnership = verifyAssetOwnership as jest.MockedFunction<typeof verifyAssetOwnership>;

describe("signupUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should sign up with valid email and password", async () => {
    const options: SignupOptions = {
      email: "test@example.com",
      password: "password123",
    };
    mockValidateEmail.mockReturnValue(true);

    const result: SignupResult = await signupUser(options);

    expect(result).toEqual({ success: true, email: options.email, passwordHash: options.password });
    expect(mockValidateEmail).toHaveBeenCalledWith(options.email);
  });

  test("should return error for invalid email format", async () => {
    const options: SignupOptions = {
      email: "invalid-email",
      password: "password123",
    };
    mockValidateEmail.mockReturnValue(false);

    const result: SignupResult = await signupUser(options);

    expect(result).toEqual({ success: false, error: "Invalid email format" });
    expect(mockValidateEmail).toHaveBeenCalledWith(options.email);
  });

  test("should sign up with valid wallet address and signature", async () => {
    const options: SignupOptions = {
      stakeAddress: "stake1uxyz",
      signature: "signature",
      key: "key",
      nonce: "nonce",
      walletNetwork: 1, // walletNetwork is a number
    };
    mockVerifyWalletAddress.mockReturnValue(true);

    const result: SignupResult = await signupUser(options);

    expect(result).toEqual({ success: true, stakeAddress: options.stakeAddress, walletNetwork: options.walletNetwork });
    expect(mockVerifyWalletAddress).toHaveBeenCalledWith(options.signature, options.key, options.nonce, options.stakeAddress, options.walletNetwork);
  });

  test("should return error for invalid wallet address and signature", async () => {
    const options: SignupOptions = {
      stakeAddress: "stake1uxyz",
      signature: "invalid-signature",
      key: "key",
      nonce: "nonce",
      walletNetwork: 1, // walletNetwork is a number
    };
    mockVerifyWalletAddress.mockReturnValue(false);

    const result: SignupResult = await signupUser(options);

    expect(result).toEqual({ success: false, error: "Invalid wallet authentication" });
    expect(mockVerifyWalletAddress).toHaveBeenCalledWith(options.signature, options.key, options.nonce, options.stakeAddress, options.walletNetwork);
  });

  test("should sign up with valid wallet address and asset verification", async () => {
    const options: SignupOptions = {
      stakeAddress: "stake1uxyz",
      signature: "signature",
      key: "key",
      nonce: "nonce",
      walletNetwork: 1, // walletNetwork is a number
      asset: { policyID: "policy1", assetName: "asset1", amount: 1 },
    };
    mockVerifyWalletAddress.mockReturnValue(true);
    mockVerifyAssetOwnership.mockResolvedValue(true);

    const result: SignupResult = await signupUser(options);

    expect(result).toEqual({
      success: true,
      asset: options.asset,
      stakeAddress: options.stakeAddress,
      walletNetwork: options.walletNetwork,
    });
    expect(mockVerifyWalletAddress).toHaveBeenCalledWith(options.signature, options.key, options.nonce, options.stakeAddress, options.walletNetwork);
    expect(mockVerifyAssetOwnership).toHaveBeenCalledWith(options.stakeAddress, options.asset, options.walletNetwork);
  });

  test("should return error for invalid asset policy", async () => {
    const options: SignupOptions = {
      stakeAddress: "stake1uxyz",
      signature: "signature",
      key: "key",
      nonce: "nonce",
      walletNetwork: 1, // walletNetwork is a number
      asset: { policyID: "invalid-policy", assetName: "asset1", amount: 1 },
      authPolicies: ["policy1"],
      authPolicyStrict: true,
    };
    mockVerifyWalletAddress.mockReturnValue(true);

    const result: SignupResult = await signupUser(options);

    expect(result).toEqual({ success: false, error: "Invalid asset." });
    expect(mockVerifyWalletAddress).toHaveBeenCalledWith(options.signature, options.key, options.nonce, options.stakeAddress, options.walletNetwork);
  });

  test("should return error when asset cannot be verified on-chain", async () => {
    const options: SignupOptions = {
      stakeAddress: "stake1uxyz",
      signature: "signature",
      key: "key",
      nonce: "nonce",
      walletNetwork: 1, // walletNetwork is a number
      asset: { policyID: "policy1", assetName: "asset1", amount: 1 },
    };
    mockVerifyWalletAddress.mockReturnValue(true);
    mockVerifyAssetOwnership.mockResolvedValue(false);

    const result: SignupResult = await signupUser(options);

    expect(result).toEqual({ success: false, error: "Asset cannot be verified on-chain" });
    expect(mockVerifyWalletAddress).toHaveBeenCalledWith(options.signature, options.key, options.nonce, options.stakeAddress, options.walletNetwork);
    expect(mockVerifyAssetOwnership).toHaveBeenCalledWith(options.stakeAddress, options.asset, options.walletNetwork);
  });
});
