import { Asset } from "../types/types";
/**
 * Decodes assets names from hex string to ASCII.
 * @param {Asset[]} processedArray - The array of assets to decode.
 * @returns {Asset[]} - The array of assets with decoded named assets.
 */
export declare function decodeHexToAscii(processedArray: Asset[]): Asset[];
/**
 * Helper function that converts a hexadecimal string to ASCII.
 * @param {string} hex - The hexadecimal string to convert.
 * @returns {string} - The ASCII string.
 */
export declare function hexToString(hex: string): string;
/**
 * Decodes the assets from a hexadecimal string.
 * @param {string[]} hexDataArray - The array of hexadecimal strings to decode.
 * @returns {any[]} - The array of decoded assets.
 */
export declare function assetDecoder(hexDataArray: string[]): any[];
/**
 * Helper function that converts a byte array to a hexadecimal string.
 * @param {Uint8Array} buffer - The byte array to convert.
 * @returns {string} - The hexadecimal string.
 */
export declare function byteArrayToHex(buffer: Uint8Array): string;
/**
 * Function to process asset data and convert it to Asset objects.
 * @param {any[]} inputArray - The array of rows to process.
 * @returns {Asset[]} - The array of processed assets.
 */
export declare function processAssets(inputArray: any[]): Asset[];
//# sourceMappingURL=utils.d.ts.map