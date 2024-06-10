import {
  verifyPassword,
  verifyWalletAddress,
  validateEmail,
  findMatchingAsset,
  verifyAssetOwnership,
} from "./utils/utils";
import { LoginOptions, LoginResult, User } from "./types/types";

/**
 * Authentication function to validate users based on email and password or a wallet address or assets.
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
      return { success: false, error: "Invalid wallet authentication" };
    }

    // If the wallet address or network does not match the user's data, return an error
    if (
      stakeAddress !== user.stakeAddress ||
      walletNetwork !== user.walletNetwork
    ) {
      return { success: false, error: "Invalid network or wallet address" };
    }

    // If the user has provided assets, verify the ownership of the assets
    if (assets) {
      const matchingAsset = findMatchingAsset(assets, user.asset);

      // If no matching asset is found, return an error
      if (!matchingAsset) {
        return { success: false, error: "Invalid asset" };
      }

      // Verify the ownership of the asset on-chain
      const verified = await verifyAssetOwnership(stakeAddress, matchingAsset, walletNetwork);

      // If the asset cannot be verified on-chain, return an error
      if (!verified) {
        return { success: false, error: "Asset cannot be verified on-chain" };
      }

      // Successful wallet authentication and asset verification
      return { success: true };
    }

    // Successful wallet authentication
    return { success: true };

    // Check if the user has provided email and password
  } else if (email && password) {

    // If the email format is invalid or does not match the user's data, return an error
    if (!validateEmail(email) || email !== user.email) {
      return { success: false, error: "Invalid email or email format" };
    }

    // If the password is invalid, return an error
    if (!verifyPassword(password, user.password)) {
      return { success: false, error: "Invalid password" };
    }

    // Successful email and password authentication
    return { success: true };
  }

  // If neither wallet nor email and password authentication is provided, return an error
  return { success: false, error: "Invalid login inputs" };
}
