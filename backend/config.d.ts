/**
 * Sets the configuration for the API key and network ID.
 * This function allows updating the API key and network ID values.
 * @param {string} key - The API key to set.
 * @param {string} id - The network ID to set.
 */
export declare const setConfig: (key: string, id: string) => void;
/**
 * Retrieves the current configuration for the API key and network ID.
 * This function returns an object containing the current API key and network ID values.
 * @returns {{apiKey: string, networkId: string}} - The current configuration object.
 */
export declare const getConfig: () => {
    apiKey: string;
    networkId: string;
};
//# sourceMappingURL=config.d.ts.map