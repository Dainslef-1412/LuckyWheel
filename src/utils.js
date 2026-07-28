/**
 * Utility functions for the wheel generator
 */

/**
 * Calculate total weight from items array
 * @param {Array} items - Array of items with weight property
 * @returns {number} Total weight
 */
export function getTotalWeight(items) {
    return items.reduce((sum, item) => sum + (item.weight || 0), 0);
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}


/**
 * Fold an angle into the [0, 360) range
 * @param {number} degrees - Angle in degrees
 * @returns {number} Equivalent angle in [0, 360)
 */
export function normalizeAngle(degrees) {
    return ((degrees % 360) + 360) % 360;
}

/**
 * Generate random weighted selection
 * @param {Array} items - Array of items with weight property
 * @returns {Object} Selected item
 */
export function weightedRandom(items) {
    const totalWeight = getTotalWeight(items);
    let random = Math.random() * totalWeight;

    for (const item of items) {
        random -= item.weight;
        if (random <= 0) return item;
    }

    return items[items.length - 1];
}

/**
 * Generate unique ID for items
 * @returns {string} Unique ID
 */
export function generateId() {
    return Math.random().toString(36).slice(2, 11);
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 20) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Calculate angle at percentage of radius
 * @param {number} centerX - Center X coordinate
 * @param {number} centerY - Center Y coordinate
 * @param {number} radius - Radius
 * @param {number} angle - Angle in degrees
 * @returns {Object} Object with x and y coordinates
 */
export function calculatePointOnCircle(centerX, centerY, radius, angle) {
    const radians = degToRad(angle - 90); // -90 to start from top
    return {
        x: centerX + radius * Math.cos(radians),
        y: centerY + radius * Math.sin(radians)
    };
}
