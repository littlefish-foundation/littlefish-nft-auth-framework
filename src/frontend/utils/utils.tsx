import cbor from "cbor-js";
import { Asset } from "../types/types";

/**
 * Decodes assets names from hex string to ASCII.
 * @param {Asset[]} processedArray - The array of assets to decode.
 * @returns {Asset[]} - The array of assets with decoded named assets.
 */
export function decodeHexToAscii(processedArray: Asset[]): Asset[] {
  return processedArray.map((item) => {
    const { policyID, assetName, amount } = item;
    const decodedAssetName = hexToString(assetName); // Decode the hex asset name to a string
    return {
      policyID: policyID,
      assetName: decodedAssetName,
      amount: amount,
    };
  });
}

/**
 * A Helper function that gets the balance in lovelace from getBalance function result.
  * @param {string} balance - The balance to convert.
  * @returns {number} - The balance in lovelace.
 */
export function balanceDecoded(balance: string): number {
  const bytes = new Uint8Array(
    balance.match(/[\da-f]{2}/gi)?.map((h) => parseInt(h, 16)) || []
  );
  const decodedData = cbor.decode(bytes.buffer);
  if (Array.isArray(decodedData) && typeof decodedData[0] === "number") {
    const test = { balance: decodedData[0] };
    return decodedData[0];
  } else {
    return 0;
  }
}

/**
 * Helper function that converts a hexadecimal string to ASCII.
 * @param {string} hex - The hexadecimal string to convert.
 * @returns {string} - The ASCII string.
 */
export function hexToString(hex: string): string {
  const hexes = hex.match(/.{1,2}/g) || [];
  let result = "";
  for (let j = 0; j < hexes.length; j++) {
    result += String.fromCharCode(parseInt(hexes[j], 16));
  }
  return result;
}

/**
 * Decodes the assets from a hexadecimal string.
 * @param {string[]} hexDataArray - The array of hexadecimal strings to decode.
 * @returns {any[]} - The array of decoded assets.
 */
export function assetDecoder(hexDataArray: string[]): any[] {
  let results: any[] = [];

  hexDataArray.forEach((hexData) => {
    // Convert the hexadecimal string to a byte array
    const bytes = new Uint8Array(
      hexData.match(/[\da-f]{2}/gi)?.map((h) => parseInt(h, 16)) || []
    );
    // Decode the byte array using CBOR
    const decoded = cbor.decode(bytes.buffer);

    decoded.forEach((utxo: any[]) => {
      if (Array.isArray(utxo) && utxo.length === 2 && Array.isArray(utxo[1])) {
        const [binaryData, details] = utxo;
        const [amount, assets] = details;
        let assetResults: any[] = [];
        // Process each asset
        Object.entries(assets).forEach(([key, val]) => {
          if (typeof key === "string") {
            const keyBytes = new Uint8Array(key.split(",").map(Number));
            const keyHex: string = byteArrayToHex(keyBytes);
            let assetDetail: any[] = [keyHex];
            let details: any[] = [];
            // Process each detail
            Object.entries(val as { [s: string]: unknown }).forEach(
              ([innerKey, innerVal], index, array) => {
                if (typeof innerKey === "string") {
                  const innerKeyBytes = new Uint8Array(
                    innerKey.split(",").map(Number)
                  );
                  const innerKeyHex: string = byteArrayToHex(innerKeyBytes);
                  assetDetail.push(innerKeyHex, innerVal);
                }
              }
            );
            assetResults.push(assetDetail);
          }
          assetResults = assetResults.flat();
        });
        results.push(assetResults);
      }
    });
  });
  return results;
}

/**
 * Helper function that converts a byte array to a hexadecimal string.
 * @param {Uint8Array} buffer - The byte array to convert.
 * @returns {string} - The hexadecimal string.
 */
export function byteArrayToHex(buffer: Uint8Array): string {
  return Array.from(buffer, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Function to process asset data and convert it to Asset objects.
 * @param {any[]} inputArray - The array of rows to process.
 * @returns {Asset[]} - The array of processed assets.
 */
export function processAssets(inputArray: any[]): Asset[] {
  const results: Asset[] = [];

  inputArray.forEach((row) => {
    if (row.length === 3) {
      // Assuming row is [policyID, assetName, amount]
      const asset: Asset = {
        policyID: row[0],
        assetName: row[1],
        amount: typeof row[2] === 'number' ? row[2] : parseInt(row[2], 10),
      };
      results.push(asset);
    } else {
      let policyID = row[0];
      let i = 1;
      while (i < row.length) {
        if (
          typeof row[i] === "string" &&
          row[i].length === 56 &&
          i + 2 < row.length
        ) {
          policyID = row[i];
          i++;
        }
        if (i + 1 < row.length) {
          // Ensure row[i] is treated as assetName and row[i+1] as amount
          const asset: Asset = {
            policyID: policyID,
            assetName: row[i],
            amount: parseInt(row[i + 1], 10), // Convert to number if not already
          };
          results.push(asset);
          i += 2;
        } else {
          break;
        }
      }
    }
  });
  return results;
}
