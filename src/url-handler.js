/**
 * URL handler for encoding and decoding wheel configurations
 */

const MAX_CONFIG_PARAM_LENGTH = 12000;
const MAX_TITLE_LENGTH = 80;
const MAX_LABEL_LENGTH = 80;
const MAX_ITEMS = 20;
const ALLOWED_THEMES = new Set(['forest', 'ocean', 'sunset', 'berry', 'fresh']);

function normalizeText(value, fallback, maxLength) {
    const text = typeof value === 'string' ? value.trim() : '';
    const normalized = text || fallback;
    return normalized.slice(0, maxLength);
}

function normalizeWeight(value) {
    const weight = Number.parseInt(value, 10);
    return Number.isFinite(weight) ? Math.max(1, Math.min(weight, 999)) : 1;
}

export function normalizeSharedConfig(config) {
    const payload = config?.version === 1 && config.config ? config.config : config;

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return null;
    }

    if (!Array.isArray(payload.items) || payload.items.length < 2) {
        return null;
    }

    const items = payload.items
        .slice(0, MAX_ITEMS)
        .map((item, index) => ({
            label: normalizeText(item?.label, `选项${index + 1}`, MAX_LABEL_LENGTH),
            weight: normalizeWeight(item?.weight)
        }));

    if (items.length < 2) {
        return null;
    }

    return {
        title: normalizeText(payload.title, '我的转盘', MAX_TITLE_LENGTH),
        theme: ALLOWED_THEMES.has(payload.theme) ? payload.theme : 'forest',
        items
    };
}

/**
 * Encode configuration to URL parameter
 * @param {Object} config - Configuration object to encode
 * @returns {string} URL parameter string
 */
export function encodeConfigToURL(config) {
    try {
        const payload = {
            version: 1,
            config: normalizeSharedConfig(config) || config
        };

        // Serialize config to JSON
        const jsonString = JSON.stringify(payload);

        // Encode using Base64 + URI encoding for special characters
        const encoded = btoa(encodeURIComponent(jsonString));

        const params = new URLSearchParams();
        params.set('config', encoded);
        return `?${params.toString()}`;
    } catch (error) {
        console.error('Error encoding config to URL:', error);
        return '';
    }
}

/**
 * Decode configuration from URL parameter
 * @returns {Object|null} Decoded configuration or null if not found
 */
export function decodeConfigFromURL() {
    try {
        const params = new URLSearchParams(window.location.search);
        const configParam = params.get('config');

        if (!configParam) {
            return null;
        }

        if (configParam.length > MAX_CONFIG_PARAM_LENGTH) {
            return null;
        }

        if (!/^[A-Za-z0-9+/=]+$/.test(configParam)) {
            return null;
        }

        // Decode the Base64 + URI encoded string
        const jsonString = decodeURIComponent(atob(configParam));
        const config = JSON.parse(jsonString);

        return normalizeSharedConfig(config);
    } catch (error) {
        console.error('Error decoding config from URL:', error);
        return null;
    }
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

/**
 * Clear configuration from URL (update URL without reloading)
 */
export function clearConfigFromURL() {
    const url = new URL(window.location);
    url.searchParams.delete('config');

    // Update URL without reloading page
    window.history.replaceState({}, '', url.toString());
}
