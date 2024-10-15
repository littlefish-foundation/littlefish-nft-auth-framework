import { SsoOptions, SsoResult } from "./types/types";
import { metadataReader, verifyWalletAddress, convertHexToBech32 } from "./utils/utils";
import { differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';

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
/**
 * Authentication function to validate users based on cardano asset and its sso metadata.
 * Assumes that user data fetching is handled outside this function.
 * @param {SsoOptions} options - The options containing credentials for verification.
 * @return {SsoResult} The result of the authentication.
 */

export async function Sso(options: SsoOptions): Promise<SsoResult> {
  const {
    stakeAddress,
    walletNetwork,
    signature,
    key,
    nonce,
    asset,
    issuerOption,
    platformUniqueIdentifier,
    usageCount,
    lastUsage,
  } = options;

  const bech32Address = convertHexToBech32(stakeAddress, walletNetwork);

  // Verify wallet address ownership
  const isValidSignature = verifyWalletAddress(
    signature,
    key,
    nonce,
    stakeAddress,
    walletNetwork
  );

  // If the signature is invalid, return an error
  if (!isValidSignature) {
    return { success: false, error: "Invalid wallet credentials" };
  }

  // Read the metadata and sso from the asset and check if the sso is available
  const [metadata, sso] = await metadataReader(asset);
  if (!sso) {
    return { success: false, error: "No SSO available for the asset" };
  }

  // Check if the sso version is supported
  if (metadata.sso.version == "0.1.0") {
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
    } = metadata.sso;
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
    
    if (uniqueIdentifier != platformUniqueIdentifier) {
      return { success: false, error: "Unique identifier does not match" };
    }
    // Check if the wallet is tied to the asset if it is not transferable
    if (!isTransferable && tiedWallet !== bech32Address) {
      return { success: false, error: "Invalid wallet for the asset" };
    }
    // Check if the asset has reached the maximum usage count if the max usage is enabled
      if (isMaxUsageEnabled && usageCount && usageCount >= maxUsage) {
        return { success: false, error: "Maximum usage reached" };
      }
    // if inactivity is enabled, check if the inactivity period has passed by checking the current time
    if (isInactivityEnabled && inactivityPeriod) {
      const lastUsageTime = new Date(lastUsage).toISOString();
      const isInactivityPeriodValid = checkInactivityPeriod(lastUsageTime, inactivityPeriod)
      if (!isInactivityPeriodValid) {
        return { success: false, error: "Inactivity period exceeded" };
      }
    }
    // If all checks pass, return the roles if they exist
    return { success: true, roles: role };
  }
  return { success: false, error: "Unsupported SSO version" };
}
