/**
 * Spin animation and physics system
 */

import { weightedRandom } from './utils.js';
import { calculateSectorAngles, updateWheelRotation, getWheelRotation } from './wheel.js';

// Spin state
let isSpinning = false;
let currentRotation = 0;

/**
 * Get current spin state
 * @returns {boolean} Whether wheel is currently spinning
 */
export function getIsSpinning() {
    return isSpinning;
}

/**
 * Get current rotation
 * @returns {number} Current rotation in degrees
 */
export function getCurrentRotation() {
    return currentRotation;
}

/**
 * Reset rotation
 */
export function resetRotation() {
    currentRotation = 0;
}

/**
 * Calculate target rotation to land on specific item
 * @param {Object} winner - Winning item
 * @param {Array} items - All items
 * @param {number} spins - Number of full rotations (default: 5)
 * @returns {number} Target rotation in degrees
 */
export function calculateTargetRotation(winner, items, spins = 5) {
    const angles = calculateSectorAngles(items);
    const winnerIndex = items.findIndex(item => item.id === winner.id);

    if (winnerIndex === -1) {
        throw new Error('Winner not found in items array');
    }

    const winnerAngle = angles[winnerIndex].center;

    // Calculate rotation needed to position winner at top (90 degrees)
    // We need to rotate such that winnerAngle ends up at 90 degrees
    const targetRotation = (360 * spins) + (360 - winnerAngle);

    return targetRotation;
}

/**
 * Spin the wheel
 * @param {Object} config - Configuration object
 * @param {HTMLElement} svgElement - SVG element containing the wheel
 * @param {Function} onComplete - Callback function when spin completes
 * @param {Object} options - Options for spin
 * @returns {Promise} Promise that resolves with winning item
 */
export function spinWheel(config, svgElement, onComplete, options = {}) {
    return new Promise((resolve, reject) => {
        if (isSpinning) {
            reject(new Error('Wheel is already spinning'));
            return;
        }

        if (config.items.length < 2) {
            reject(new Error('Need at least 2 items to spin'));
            return;
        }

        isSpinning = true;

        const {
            spins = 5,
            duration = 4000,
            easing = 'cubic-bezier(0.17, 0.67, 0.12, 0.99)'
        } = options;

        try {
            // Determine winner using weighted random
            const winner = weightedRandom(config.items);

            // Calculate target rotation
            const targetRotation = calculateTargetRotation(winner, config.items, spins);
            const finalRotation = currentRotation + targetRotation;

            // Apply CSS transition for smooth animation
            const wheelGroup = svgElement.querySelector('#wheel-container');
            if (wheelGroup) {
                wheelGroup.style.transition = `transform ${duration}ms ${easing}`;
                wheelGroup.style.transform = `rotate(${finalRotation}deg)`;
                // Note: transform-origin should already be set by renderWheel()
            }

            // Update current rotation
            currentRotation = finalRotation;

            // Wait for animation to complete
            setTimeout(() => {
                isSpinning = false;

                // Remove transition after animation completes
                if (wheelGroup) {
                    wheelGroup.style.transition = '';
                }

                // Call completion callback
                if (typeof onComplete === 'function') {
                    onComplete(winner);
                }

                resolve(winner);
            }, duration);

        } catch (error) {
            isSpinning = false;
            reject(error);
        }
    });
}

/**
 * Update center circle text
 * @param {string} text - Text to display
 * @param {SVGSVGElement} svgElement - SVG element
 */
export function updateCenterText(text, svgElement) {
    const centerText = svgElement.querySelector('text[dominant-baseline="middle"]');
    if (centerText) {
        centerText.textContent = text;
    }
}

/**
 * Show result in center circle
 * @param {Object} winner - Winning item
 * @param {SVGSVGElement} svgElement - SVG element
 */
export function showResult(winner, svgElement) {
    updateCenterText(winner.label, svgElement);

    // Add highlight effect to winner sector
    const wheelGroup = svgElement.querySelector('#wheel-container');
    if (wheelGroup) {
        const sectors = wheelGroup.querySelectorAll('g > g');
        const angles = calculateSectorAngles([{ id: winner.id }]);

        sectors.forEach((sector, index) => {
            const path = sector.querySelector('path');
            if (path) {
                // Flash effect
                setTimeout(() => {
                    path.style.filter = 'brightness(1.3)';
                    setTimeout(() => {
                        path.style.filter = 'brightness(1)';
                    }, 200);
                }, index * 100);
            }
        });
    }
}

/**
 * Reset center circle text
 * @param {string} text - Default text
 * @param {SVGSVGElement} svgElement - SVG element
 */
export function resetCenterText(text, svgElement) {
    updateCenterText(text, svgElement);
}
