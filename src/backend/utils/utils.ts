import verifySignature from "@cardano-foundation/cardano-verify-datasignature";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { bech32 } from "bech32";
import { getConfig } from "../config";
import { Asset } from "src/frontend/types/types";

/**
 * Fetches assets associated with a stake address from the Blockfrost API.
 * @param {string} stakeAddress - The stake address to fetch assets for.
 * @param {string} apiKey - The Blockfrost API key.
 * @param {string} networkId - The network identifier (mainnet or testnet).
 * @returns {Promise<Asset[]>} - A promise that resolves to an array of assets.
 */
export async function fetchAssets(
  stakeAddress: string,
  apiKey: string,
  networkId: string
): Promise<Asset[]> {
  const url = `https://cardano-${networkId}.blockfrost.io/api/v0/accounts/${stakeAddress}/addresses/assets`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      project_id: apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch assets: ${response.statusText}`);
  }

  const data: { unit: string; quantity: string }[] = await response.json();

  return data.map((item) => {
    const policyID = item.unit.slice(0, 56);
    const assetName = item.unit.slice(56);
    const amount = Number(item.quantity);
    return { policyID, assetName, amount };
  });
}

/**
 * Fetches metadata associated with an asset from the Blockfrost API.
 * @param {Asset} rawAsset - The asset to fetch metadata for.
 * @param {string} networkId - The network identifier (mainnet or testnet).
 * @param {string} apiKey - The Blockfrost API key.
 * @returns {Promise<[any, boolean]>} - A promise that resolves to a tuple containing the metadata and a boolean indicating if the metadata is SSO.
 */
export async function metadataReader(rawAsset: Asset, networkId: string, apiKey: string,): Promise<[any, boolean]> {
  const asset = rawAsset.policyID+rawAsset.assetName;
  const url = `https://cardano-${networkId}.blockfrost.io/api/v0/assets/${asset}`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      project_id: apiKey,
    },
    });

  if (!response.ok) {
    throw new Error(`Failed to asset details: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.metadata) {
    throw new Error("No metadata found");
  }

  try {
    data.onchain_metadata.files[0].src.replace('ipfs://', 'https://ipfs.io/ipfs/');
  } catch (error) {
    console.error("Failed to fetch metadata:", error);
  }

  if (!data.metadata.sso) {
    return [data.onchain_metadata, false];
  }

  const sso = data.metadata.sso;
  if (sso.isMaxUsageEnabled == 1){
    sso.isMaxUsageEnabled = true
  } else {
    sso.isMaxUsageEnabled = false
  }

  if (sso.isTransferable == 1){
    sso.isTransferable = true
  } else {
    sso.isTransferable = false
  }

  if (sso.isInactivityEnabled == 1){
    sso.isInactivityEnabled = true
  } else {
    sso.isInactivityEnabled = false
  }
  return [sso, true];
}

/**
 * Checks if a string is non-empty.
 * @param {string} str - The string to check.
 * @returns {boolean} - True if the string is non-empty, false otherwise.
 */
export function isNonEmptyString(str: string): boolean {
  return typeof str === "string" && str.trim() !== "";
}

/**
 * Validates an email address.
 * @param {string} email - The email address to validate.
 * @returns {boolean} - True if the email is valid, false otherwise.
 */
export function validateEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Converts a hexadecimal string to a bech32 address.
 * @param {string} hex - The hexadecimal string to convert.
 * @param {number} walletNetwork - The network identifier (1 for mainnet, 0 for testnet).
 * @returns {string | undefined} - The bech32 address or undefined if conversion fails.
 */
export function convertHexToBech32(hex: string, walletNetwork: number) {
  try {
    const bytes = Buffer.from(hex, "hex");
    const words = bech32.toWords(bytes);
    try {
      if (walletNetwork === 1) {
        const result = bech32.encode("stake", words);
        return result;
      }
      if (walletNetwork === 0) {
        const result = bech32.encode("stake_test", words);
        return result;
      }
    } catch (innerError) {
      console.error("Encoding error:", innerError);
    }
  } catch (error) {
    console.error("Error converting hex to bytes:", error);
  }
}

/**
 * Validates a password against a regex pattern.
 * @param {string} password - The password to validate.
 * @returns {boolean} - True if the password is valid, false otherwise.
 */

export function validatePassword(password: string) {
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[A-Za-z/d@$!%*?&].{8,}$/;
  return regex.test(password);
}

/**
 * Verifies a wallet address using a signature, key, message, and hex string.
 * @param {string} signature - The signature to verify.
 * @param {string} key - The key to use for verification.
 * @param {string} message - The message to verify.
 * @param {string} hex - The hex string to convert to a bech32 address.
 * @param {number} walletNetwork - The network identifier (1 for mainnet, 0 for testnet).
 * @returns {boolean} - True if the verification is successful, false otherwise.
 */
export function verifyWalletAddress(
  signature: string,
  key: string,
  message: string,
  hex: string,
  walletNetwork: number
): boolean {
  try {
    const address = convertHexToBech32(hex, walletNetwork);

    return verifySignature(signature, key, message, address);
  } catch (error) {
    console.error("Failed to verify wallet address:", error);
    return false;
  }
}

/**
 * Hashes a password using bcrypt.
 * @param {string} password - The password to hash.
 * @returns {string} - The hashed password.
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

/**
 * Verifies a password against a hashed password using bcrypt.
 * @param {string} password - The password to verify.
 * @param {string} hash - The hashed password to compare against.
 * @returns {boolean} - True if the password matches the hash, false otherwise.
 */
export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

/**
 * Generates a random nonce.
 * @returns {string} - A 16-byte hex string.
 */
export function generateNonce(): string {
  return randomBytes(16).toString("hex"); // Generate a 16-byte hex string
}

/**
 * Verifies the assets associated with a wallet address.
 * @param {Asset[]} assets - The assets to verify.
 * @param {string} stakeAddress - The stake address of the wallet.
 * @param {number} walletNetwork - The network identifier (1 for mainnet, 0 for testnet).
 * @returns {Promise<boolean>} - A promise that resolves to true if the assets are verified, false otherwise.
 */
export async function verifyWalletAssets(
  assets: Asset[],
  stakeAddress: string,
  walletNetwork: number
): Promise<boolean> {
  const { apiKey, networkId } = getConfig();

  if (!apiKey) {
    throw new Error("BLOCKFROST_API_KEY is not set");
  }

  if (!networkId) {
    throw new Error("NETWORK_ID is not set");
  }

  function areAssetsEqual(asset1: Asset, asset2: Asset): boolean {
    return (
      asset1.policyID === asset2.policyID &&
      asset1.assetName === asset2.assetName &&
      asset1.amount === asset2.amount
    );
  }
  const address = convertHexToBech32(stakeAddress, walletNetwork);
  const fetchedAssets = await fetchAssets(address, apiKey, networkId);

  if (assets.length !== fetchedAssets.length) {
    return false;
  }

  return assets.every((asset) =>
    fetchedAssets.some((fetchedAsset) => areAssetsEqual(asset, fetchedAsset))
  );
}

/**
 * Verifies if a policy ID exists in the assets associated with a wallet address.
 * @param {string} policyId - The policy ID to verify.
 * @param {string} stakeAddress - The stake address of the wallet.
 * @param {number} walletNetwork - The network identifier (1 for mainnet, 0 for testnet).
 * @returns {Promise<boolean>} - A promise that resolves to true if the policy ID is found, false otherwise.
 */
export async function verifyAssetPolicy(
  policyId: string,
  stakeAddress: string,
  walletNetwork: number
): Promise<boolean> {
  const { apiKey, networkId } = getConfig();
  const address = convertHexToBech32(stakeAddress, walletNetwork);

  if (!apiKey) {
    throw new Error("BLOCKFROST_API_KEY is not set");
  }

  if (!networkId) {
    throw new Error("NETWORK_ID is not set");
  }

  const fetchedAssets = await fetchAssets(address, apiKey, networkId);
  // Check if the policyId exists in any of the assets
  return fetchedAssets.some((asset) => asset.policyID === policyId);
}

/**
 * Verifies the ownership of a specific asset associated with a wallet address.
 * @param {string} stakeAddress - The stake address of the wallet.
 * @param {Asset} asset - The asset to verify.
 * @param {number} walletNetwork - The network identifier (1 for mainnet, 0 for testnet).
 * @returns {Promise<boolean>} - A promise that resolves to true if the asset is verified, false otherwise.
 */
export async function verifyAssetOwnership(
  stakeAddress: string,
  asset: Asset,
  walletNetwork: number
): Promise<boolean> {
  const { apiKey, networkId } = getConfig();
  const address = convertHexToBech32(stakeAddress, walletNetwork);

  if (!apiKey) {
    throw new Error("BLOCKFROST_API_KEY is not set");
  }

  if (!networkId) {
    throw new Error("NETWORK_ID is not set");
  }

  const fetchedAssets = await fetchAssets(address, apiKey, networkId);

  return fetchedAssets.some(
    (fetchedAsset) =>
      fetchedAsset.policyID === asset.policyID &&
      fetchedAsset.assetName === asset.assetName &&
      fetchedAsset.amount === asset.amount
  );
}

/**
 * Finds a matching asset in a list of assets.
 * @param {Asset[]} assets - The list of assets to search.
 * @param {Asset} userAsset - The asset to find a match for.
 * @returns {Asset | null} - The matching asset or null if no match is found.
 */
export function findMatchingAsset(
  assets: Asset[],
  userasset: Asset
): Asset | null {
  return assets.find(
    (asset) =>
      asset.policyID === userasset.policyID &&
      asset.assetName === userasset.assetName
  );
}

/**
 * Decodes assets names from hex string to UTF-8.
 * @param {Asset[]} processedArray - The array of assets to decode.
 * @returns {Asset[]} - The array of assets with decoded named assets.
 */
export function decodeHexToUtf8(processedArray: Asset[]): Asset[] {
  return processedArray.map((item) => {
    const { policyID, assetName, amount } = item;
    const decodedAssetName = hexToUtf8(assetName); // Decode the hex asset name to UTF-8
    return {
      policyID: policyID,
      assetName: decodedAssetName,
      amount: amount,
    };
  });
}

// Helper function to convert hex to UTF-8
function hexToUtf8(hex: string): string {
  // Convert hex string to a byte array
  const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  // Decode the byte array to a UTF-8 string
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(bytes);
  }
