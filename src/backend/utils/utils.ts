import verifySignature from "@cardano-foundation/cardano-verify-datasignature";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { bech32 } from "bech32";
import { getConfig } from "../config";
import { Asset } from "src/frontend/types/types";

async function fetchAssets(
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

export function isNonEmptyString(str: string): boolean {
  return typeof str === "string" && str.trim() !== "";
}

export function validateEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function convertHexToBech32(hex: string, walletNetwork: number) {
  try {
    const bytes = Buffer.from(hex, "hex");
    const words = bech32.toWords(bytes);
    console.log("Words:", words);
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

export function validatePassword(password: string) {
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[A-Za-z/d@$!%*?&].{8,}$/;
  return regex.test(password);
}

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

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateNonce(): string {
  return randomBytes(16).toString("hex"); // Generate a 16-byte hex string
}

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
