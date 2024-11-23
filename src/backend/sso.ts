import { SsoOptions, SsoResult } from "./types/types";
import { metadataReader, verifyWalletAddress, convertHexToBech32, verifyAssetOwnership } from "./utils/utils";
import { differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';
import { performance } from 'perf_hooks';

// Update the metrics interface
interface PerformanceMetrics {
  totalDuration: number;
  signatureVerification: number;
  metadataReading: number;
  validationChecks: number;
  assetOwnershipVerification: number;
}

/**
 * Authentication function to validate users based on cardano asset and its sso metadata.
 * Assumes that user data fetching is handled outside this function.
 * @param {SsoOptions} options - The options containing credentials for verification.
 * @return {SsoResult} The result of the authentication.
 */

export async function Sso(
  options: SsoOptions,
  enableMetrics: boolean = false
): Promise<SsoResult & { metrics?: PerformanceMetrics }> {
  const startTime = performance.now();
  let signatureStart, signatureEnd, metadataStart, metadataEnd, validationStart, validationEnd;
  let assetVerificationStart, assetVerificationEnd;

  const {
    stakeAddress,
    walletNetwork,
    signature,
    key,
    nonce,
    asset,
    issuerOption,
    platformUniqueIdentifiers,
    usageCount,
    lastUsage,
  } = options;

  const checkInactivityPeriod = (lastUsed: string, inactivityPeriod: string): boolean => {
    const now = new Date();
    const lastUsedDate = new Date(lastUsed);
    const [value, unit] = inactivityPeriod.match(/(\d+)([dmy])/)?.slice(1) ?? ['0', 'd'];
    const numericValue = parseInt(value, 10);

    switch (unit) {
        case 'd':
            return differenceInDays(now, lastUsedDate) <= numericValue;
        case 'm':
            return differenceInMonths(now, lastUsedDate) <= numericValue;
        case 'y':
            return differenceInYears(now, lastUsedDate) <= numericValue;
        default:
            return false;
    }
};

  // Verify wallet address ownership
  signatureStart = performance.now();
  const isValidSignature = verifyWalletAddress(
    signature,
    key,
    nonce,
    stakeAddress,
    walletNetwork
  );
  signatureEnd = performance.now();

  // If the signature is invalid, return an error
  if (!isValidSignature) {
    return { success: false, error: "Invalid wallet credentials" };
  }

  // Add asset ownership verification with performance metrics
  assetVerificationStart = performance.now();
  const verified = await verifyAssetOwnership(stakeAddress, asset, walletNetwork);
  assetVerificationEnd = performance.now();

  if (!verified) {
    return { success: false, error: "Asset cannot be verified on-chain" };
  }

  // Read the metadata and sso from the asset
  metadataStart = performance.now();
  let metadata, sso;
  try {
    [metadata, sso] = await metadataReader(asset);
  } catch (error) {
    metadataEnd = performance.now();
    const endTime = performance.now();
    
    if (enableMetrics) {
      return {
        success: false,
        error: "No metadata found for the asset",
        metrics: {
          totalDuration: endTime - startTime,
          signatureVerification: signatureEnd - signatureStart,
          metadataReading: metadataEnd - metadataStart,
          validationChecks: 0,
          assetOwnershipVerification: assetVerificationEnd - assetVerificationStart
        }
      };
    }
    return { success: false, error: "No metadata found for the asset" };
  }
  metadataEnd = performance.now();

  // Check if the sso version is supported
  validationStart = performance.now();
  if (metadata.version == "0.1.0") {
    const {
      uniqueIdentifier,
      issuer,
      issuanceDate,
      expirationDate,
      isTransferable,
      tiedWallet,
      isMaxUsageEnabled,
      maxUsage,
      isInactivityEnabled,
      inactivityPeriod,
      role,
    } = metadata;
    // Check if the asset is expired
    const currentTime = new Date().getTime();
    const expirationTime = new Date(expirationDate).getTime();
    if (currentTime > expirationTime) {
      return { success: false, error: "Asset has expired" };
    }
    // Check if the asset is issued by the correct issuer
    if (issuer != issuerOption) {
      return { success: false, error: "Issuer does not match" };
    }
    // Check if the unique identifier matches the platform unique identifier
    if (!platformUniqueIdentifiers.includes(uniqueIdentifier)) {
      return { success: false, error: "Unique identifier does not match" };
    }
    // Check if the wallet is tied to the asset if it is not transferable
    if (!isTransferable && tiedWallet !== convertHexToBech32(stakeAddress, walletNetwork)) {
      return { success: false, error: "Invalid wallet for the asset" };
    }
    // Check if the asset has reached the maximum usage count if the max usage is enabled
      if (isMaxUsageEnabled && usageCount && usageCount >= maxUsage) {
        return { success: false, error: "Maximum usage reached" };
      }
    // if inactivity is enabled, check if the inactivity period has passed by checking the current time
    if (isInactivityEnabled && inactivityPeriod) {
      if (!checkInactivityPeriod(lastUsage, inactivityPeriod)) {
        return { success: false, error: "Inactivity period exceeded" };
      }
    }
    // If all checks pass, return the roles if they exist
    validationEnd = performance.now();
    const endTime = performance.now();

    if (enableMetrics) {
      return {
        success: true,
        roles: role,
        metrics: {
          totalDuration: endTime - startTime,
          signatureVerification: signatureEnd - signatureStart,
          metadataReading: metadataEnd - metadataStart,
          validationChecks: validationEnd - validationStart,
          assetOwnershipVerification: assetVerificationEnd - assetVerificationStart
        }
      };
    }
    return { success: true, roles: role };
  }

  validationEnd = performance.now();
  const endTime = performance.now();

  if (enableMetrics) {
    return {
      success: false,
      error: "Unsupported SSO version",
      metrics: {
        totalDuration: endTime - startTime,
        signatureVerification: signatureEnd - signatureStart,
        metadataReading: metadataEnd - metadataStart,
        validationChecks: validationEnd - validationStart,
        assetOwnershipVerification: assetVerificationEnd - assetVerificationStart
      }
    };
  }
  return { success: false, error: "Unsupported SSO version" };
}