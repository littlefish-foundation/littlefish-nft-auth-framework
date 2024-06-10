import {
  validateEmail,
  verifyWalletAddress,
  verifyAssetOwnership,
} from "./utils/utils";
import { SignupOptions, SignupResult } from "./types/types";

export async function signupUser(
  options: SignupOptions
): Promise<SignupResult> {
  // Extract the required fields from the options object
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
    authPolicyStrict,
  } = options;

  // Check if the user has provided a wallet address and signature
  if (stakeAddress && signature && key && nonce) {
    // Verify the signature using the provided wallet address, signature, key, nonce, and network
    const isValidSignature = verifyWalletAddress(
      signature,
      key,
      nonce,
      stakeAddress,
      walletNetwork
    );

    // If the signature is invalid, return an error
    if (!isValidSignature) {
      return {
        success: false,
        error: "Invalid wallet authentication",
      };
    }

    // If the user has provided an asset, verify the ownership of the asset
    if (asset) {
      // If the user has provided authPolicies, verify the asset policy
      if (authPolicies && !authPolicies.includes(asset.policyID) && authPolicyStrict) {
        return {
          success: false,
          error: "Invalid asset.",
        };
      }
      // verify there is the asset in the wallet via blockfrost API
      const verified = await verifyAssetOwnership(stakeAddress, asset, walletNetwork);

      // If the asset cannot be verified on-chain, return an error
      if (!verified) {
        return {
          success: false,
          error: "Asset cannot be verified on-chain",
        };
      }

      // If authPolicies are provided and strict, verify the asset policy
      if (authPolicies && authPolicyStrict) {
        // verify the asset policy matches the auth policy
        const isValidPolicy = authPolicies.includes(asset.policyID);

        // If the asset policy is invalid, return an error
        if (!isValidPolicy) {
          return {
            success: false,
            error: "Invalid asset policy",
          };
        }

        // Successful wallet authentication and asset verification with verified policy
        return {
          success: true,
          verifiedPolicy: asset.policyID,
          asset,
          stakeAddress,
          walletNetwork,
        };
      }

      // Successful wallet authentication and asset verification without strict policy
      return {
        success: true,
        asset,
        stakeAddress,
        walletNetwork,
      };
    }

    // Successful wallet authentication without asset verification
    return {
      success: true,
      stakeAddress,
      walletNetwork,
    };
  }

  // Check if the user has provided email and password
  if (email && password) {
    // Validate the email format
    if (!validateEmail(email)) {
      return { success: false, error: "Invalid email format" };
    }

    // Successful email and password authentication
    return { success: true, email, passwordHash: password };
  }

  // Return an error if the signup inputs are invalid
  return { success: false, error: "Invalid signup inputs" };
}
