/**
 * URL handler for encoding and decoding wheel configurations
 */

/**
 * Encode configuration to URL parameter
 * @param {Object} config - Configuration object to encode
 * @returns {string} URL parameter string
 */
export function encodeConfigToURL(config) {
    try {
        // Serialize config to JSON
        const jsonString = JSON.stringify(config);

        // Encode using Base64 + URI encoding for special characters
        const encoded = btoa(encodeURIComponent(jsonString));

        return `?config=${encoded}`;
    } catch (error) {
        console.error('Error encoding config to URL:', error);
        return '';
    }
}

/**
 * Decode configuration from a query string
 * @param {string} search - Query string, with or without the leading `?`
 * @returns {Object|null} Decoded configuration, or null if absent or malformed
 */
export function decodeConfigFromSearch(search) {
    try {
        const params = new URLSearchParams(search);
        const configParam = params.get('config');

        if (!configParam) {
            return null;
        }

        // Decode the Base64 + URI encoded string
        const jsonString = decodeURIComponent(atob(configParam));
        const config = JSON.parse(jsonString);

        return config;
    } catch (error) {
        console.error('Error decoding config from URL:', error);
        return null;
    }
}

/**
 * Decode configuration from the current page URL
 * @returns {Object|null} Decoded configuration or null if not found
 */
export function decodeConfigFromURL() {
    return decodeConfigFromSearch(window.location.search);
}

/**
 * Generate shareable URL with configuration
 * @param {Object} config - Configuration object to share
 * @returns {string} Complete shareable URL
 */
export function generateShareURL(config) {
    const baseUrl = window.location.origin + window.location.pathname;
    const urlParam = encodeConfigToURL(config);
    return baseUrl + urlParam;
}

/**
 * Check if URL contains configuration parameter
 * @returns {boolean} True if URL has config parameter
 */
export function hasConfigInURL() {
    const params = new URLSearchParams(window.location.search);
    return params.has('config');
}
