import {
  validateEmail,
  verifyWalletAddress,
  verifyAssetOwnership,
} from "./utils/utils";
import { SignupOptions, SignupResult } from "./types/types";

export async function signupUser(
  options: SignupOptions
): Promise<SignupResult> {
  try {
    const {
      email,
      password,
      stakeAddress,
      walletNetwork,
      signature,
      key,
      nonce,
      asset,
      authPolicies,
    } = options;

    if (stakeAddress && signature && key && nonce && walletNetwork) {
      const isValidSignature = verifyWalletAddress(
        signature,
        key,
        nonce,
        stakeAddress
      );
      if (!isValidSignature) {
        return {
          success: false,
          error: "Invalid wallet authentication",
        };
      }
      if (asset) {
        if (authPolicies && !authPolicies.includes(asset.policyID)) {
          return {
            success: false,
            error: "Invalid asset.",
          };
        }
        // verify there is the asset in the wallet via blockfrost API
        const verified = await verifyAssetOwnership(stakeAddress, asset);
        if (!verified) {
          return {
            success: false,
            error: "Asset cannot be verified on-chain",
          };
        }
        if (authPolicies) {
          // verify the asset policy matches the auth policy
          const isValidPolicy = authPolicies.includes(asset.policyID);
          if (!isValidPolicy) {
            return {
              success: false,
              error: "Invalid asset policy",
            };
          }
          return {
            success: true,
            verifiedPolicy: asset.policyID,
            asset,
            stakeAddress,
            walletNetwork,
          };
        }
        return {
          success: true,
          asset,
          stakeAddress,
          walletNetwork,
        };
      }
      return {
        success: true,
        stakeAddress,
        walletNetwork,
      };
    }
    if (email && password) {
      if (!validateEmail(email)) {
        return { success: false, error: "Invalid email format" };
      }
      return { success: true, email, passwordHash: password };
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error:
          error.message || "Signup failed due to an input validation error",
      };
    } else {
      return { success: false };
    }
  }
  return { success: false, error: "Invalid signup inputs" };
}
