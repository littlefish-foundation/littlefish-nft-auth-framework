import {
  verifyPassword,
  verifyWalletAddress,
  validateEmail,
  findMatchingAsset,
  verifyAssetOwnership,
} from "./utils/utils";
import { LoginOptions, LoginResult, User } from "./types/types";

/**
 * Authentication function to validate users based on email and password or a wallet address.
 * Assumes that user data fetching is handled outside this function.
 *
 * @param {User} user - The user object containing at least email, password hash, or wallet address.
 * @param {LoginOptions} options - The options containing credentials for verification.
 * @return {LoginResult} The result of the authentication.
 */
export async function loginUser(
  user: User,
  options: LoginOptions
): Promise<LoginResult> {
  const {
    email,
    password,
    stakeAddress,
    walletNetwork,
    signature,
    key,
    nonce,
    assets,
  } = options;

  if (stakeAddress && signature && key && nonce) {
    const isValidSignature = verifyWalletAddress(
      signature,
      key,
      nonce,
      stakeAddress,
      walletNetwork
    );
    console.log("Valid Signature: ", isValidSignature)
    if (!isValidSignature) {
      return { success: false, error: "Invalid wallet authentication" };
    }
    if (
      stakeAddress !== user.stakeAddress ||
      walletNetwork !== user.walletNetwork
    ) {
      return { success: false, error: "Invalid network or wallet address" };
    }
    if (assets) {
      const matchingAsset = findMatchingAsset(assets, user.asset);
      console.log("Matching Asset: ", matchingAsset)
      if (!matchingAsset) {
        return { success: false, error: "Invalid asset" };
      }
      const verified = await verifyAssetOwnership(stakeAddress, matchingAsset, walletNetwork);
      console.log("Verified Asset Ownership: ", verified)
      if (!verified) {
        return { success: false, error: "Asset cannot be verified on-chain" };
      }
      return { success: true };
    }

    return { success: true };
  } else if (email && password) {
    if (!validateEmail(email) || email !== user.email) {
      return { success: false, error: "Invalid email or email format" };
    }
    if (!verifyPassword(password, user.password)) {
      return { success: false, error: "Invalid password" };
    }
    return { success: true };
  }
  return { success: false, error: "Invalid login inputs" };
}
