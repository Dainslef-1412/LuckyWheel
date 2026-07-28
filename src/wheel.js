/**
 * SVG rendering engine for the wheel
 */

import { degToRad, getTotalWeight, calculatePointOnCircle, truncateText, normalizeAngle } from './utils.js';

const CENTER_TEXT_ID = 'center-text';
const CENTER_TEXT_MAX_FONT_SIZE = 16;
const CENTER_TEXT_MIN_FONT_SIZE = 9;
const CENTER_TEXT_MAX_CHARS = 10;
const CJK_PATTERN = /[\u2E80-\u9FFF\uF900-\uFAFF\uFF00-\uFF60]/;

/**
 * Generate SVG path for a wheel sector
 * @param {number} centerX - Center X coordinate
 * @param {number} centerY - Center Y coordinate
 * @param {number} radius - Radius of the wheel
 * @param {number} startAngle - Start angle in degrees
 * @param {number} endAngle - End angle in degrees
 * @returns {string} SVG path command
 */
export function generateSectorPath(centerX, centerY, radius, startAngle, endAngle) {
    const startRad = degToRad(startAngle - 90); // -90 to start from top
    const endRad = degToRad(endAngle - 90);

    const start = calculatePointOnCircle(centerX, centerY, radius, startAngle);
    const end = calculatePointOnCircle(centerX, centerY, radius, endAngle);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY}
            L ${start.x} ${start.y}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}
            Z`;
}

/**
 * Calculate angle ranges for each item based on weights
 * @param {Array} items - Array of items with weight property
 * @returns {Array} Array of angle ranges for each item
 */
export function calculateSectorAngles(items) {
    const totalWeight = getTotalWeight(items);
    let currentAngle = 0;

    return items.map(item => {
        const sectorAngle = (item.weight / totalWeight) * 360;
        const angles = {
            start: currentAngle,
            end: currentAngle + sectorAngle,
            center: currentAngle + sectorAngle / 2
        };
        currentAngle += sectorAngle;
        return angles;
    });
}

/**
 * Calculate the absolute rotation that stops the winning sector under the pointer
 *
 * The wheel keeps the offset left by earlier spins, so the alignment step is
 * measured from that offset rather than from zero. Ignoring it makes every spin
 * after the first stop on a different sector than the announced winner.
 *
 * @param {number} currentRotation - Rotation the wheel already carries, in degrees
 * @param {number} winnerAngle - Center angle of the winning sector, in degrees
 * @param {number} spins - Number of full rotations to add
 * @returns {number} Absolute target rotation in degrees, always greater than currentRotation
 */
export function calculateSpinRotation(currentRotation, winnerAngle, spins = 5) {
    const currentOffset = normalizeAngle(currentRotation);
    const alignToWinner = normalizeAngle((360 - winnerAngle) - currentOffset);

    return currentRotation + (360 * spins) + alignToWinner;
}

/**
 * Create SVG element for a sector
 * @param {Object} item - Item object with label, weight, color
 * @param {Object} angleRange - Angle range object
 * @param {number} index - Index of the item
 * @param {Object} options - Options for rendering
 * @returns {SVGSVGElement} SVG group element
 */
export function createSectorElement(item, angleRange, index, options = {}) {
    const {
        centerX = 250,
        centerY = 250,
        radius = 200
    } = options;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Create sector path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = generateSectorPath(centerX, centerY, radius, angleRange.start, angleRange.end);
    path.setAttribute('d', d);
    path.setAttribute('fill', item.color || '#ccc');
    path.setAttribute('stroke', '#fff');
    path.setAttribute('stroke-width', '2');
    g.appendChild(path);

    // Add label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const labelRadius = radius * 0.67; // Position at 2/3 of radius
    const labelPoint = calculatePointOnCircle(centerX, centerY, labelRadius, angleRange.center);

    text.setAttribute('x', labelPoint.x);
    text.setAttribute('y', labelPoint.y);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', '#fff');
    text.setAttribute('font-size', '14');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('transform', `rotate(${angleRange.center}, ${labelPoint.x}, ${labelPoint.y})`);

    // Truncate text if too long
    const truncatedLabel = truncateText(item.label, 15);
    text.textContent = truncatedLabel;

    g.appendChild(text);

    return g;
}

/**
 * Create center circle element
 * @param {Object} config - Configuration object
 * @param {Object} options - Options for rendering
 * @returns {SVGSVGElement} SVG group element
 */
export function createCenterCircle(config, options = {}) {
    const {
        centerX = 250,
        centerY = 250,
        innerRadius = 50
    } = options;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Outer circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', centerX);
    circle.setAttribute('cy', centerY);
    circle.setAttribute('r', innerRadius);
    circle.setAttribute('fill', '#fff');
    circle.setAttribute('stroke', '#333');
    circle.setAttribute('stroke-width', '3');
    g.appendChild(circle);

    // Center text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('id', CENTER_TEXT_ID);
    text.setAttribute('x', centerX);
    text.setAttribute('y', centerY);
    text.setAttribute('data-role', 'center-text');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', '#333');
    text.setAttribute('font-weight', 'bold');
    g.appendChild(text);

    applyCenterText(text, config.title || '开始', innerRadius);

    return g;
}

/**
 * Pick a font size that keeps center text inside the center circle
 * @param {string} label - Text to display
 * @param {number} innerRadius - Radius of the center circle
 * @returns {number} Font size in user units
 */
export function centerTextFontSize(label, innerRadius = 50) {
    const text = String(label ?? '');
    if (!text) return CENTER_TEXT_MAX_FONT_SIZE;

    // CJK glyphs are roughly one em wide, latin glyphs roughly 0.6em.
    const widthInEm = [...text].reduce(
        (sum, char) => sum + (CJK_PATTERN.test(char) ? 1 : 0.6),
        0
    );
    const usableWidth = innerRadius * 1.8;

    return Math.max(
        CENTER_TEXT_MIN_FONT_SIZE,
        Math.min(CENTER_TEXT_MAX_FONT_SIZE, usableWidth / widthInEm)
    );
}

/**
 * Write text into the center circle, scaling it to fit
 * @param {SVGTextElement} textElement - Center text element
 * @param {string} label - Text to display
 * @param {number} innerRadius - Radius of the center circle
 */
function applyCenterText(textElement, label, innerRadius) {
    const shown = truncateText(String(label ?? ''), CENTER_TEXT_MAX_CHARS);
    textElement.textContent = shown;
    textElement.setAttribute('font-size', centerTextFontSize(shown, innerRadius).toFixed(2));
}

/**
 * Update the center circle text of a rendered wheel
 * @param {SVGSVGElement} svgElement - SVG element containing the wheel
 * @param {string} label - Text to display
 * @param {Object} options - Options for rendering
 */
export function setCenterText(svgElement, label, options = {}) {
    const { innerRadius = 50 } = options;
    const textElement = svgElement.querySelector(`#${CENTER_TEXT_ID}`);
    if (textElement) {
        applyCenterText(textElement, label, innerRadius);
    }
}

/**
 * Create pointer element
 * @param {Object} options - Options for rendering
 * @returns {SVGSVGElement} SVG group element
 */
export function createPointer(options = {}) {
    const {
        centerX = 250,
        centerY = 250,
        radius = 200,
        pointerSize = 20
    } = options;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Triangle pointer at top
    const pointer = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const points = [
        { x: centerX, y: centerY - radius - pointerSize },
        { x: centerX - pointerSize / 2, y: centerY - radius - pointerSize * 2 },
        { x: centerX + pointerSize / 2, y: centerY - radius - pointerSize * 2 }
    ];

    pointer.setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' '));
    pointer.setAttribute('fill', '#ff4444');
    pointer.setAttribute('stroke', '#fff');
    pointer.setAttribute('stroke-width', '2');

    g.appendChild(pointer);

    return g;
}

/**
 * Render complete wheel
 * @param {Object} config - Configuration object with title, theme, items
 * @param {SVGSVGElement} svgElement - SVG element to render into
 * @param {Object} options - Options for rendering
 */
export function renderWheel(config, svgElement, options = {}) {
    const {
        centerX = 250,
        centerY = 250,
        radius = 200,
        showPointer = true
    } = options;

    // Clear existing content
    while (svgElement.firstChild) {
        svgElement.removeChild(svgElement.firstChild);
    }

    // Calculate angles
    const angles = calculateSectorAngles(config.items);

    // Create wheel group
    const wheelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    wheelGroup.setAttribute('id', 'wheel-container');
    // Set transform origin to center of wheel for proper rotation
    wheelGroup.style.transformOrigin = `${centerX}px ${centerY}px`;

    // Render sectors
    config.items.forEach((item, index) => {
        const sector = createSectorElement(item, angles[index], index, {
            centerX,
            centerY,
            radius
        });
        wheelGroup.appendChild(sector);
    });

    svgElement.appendChild(wheelGroup);

    // Add center circle
    const centerCircle = createCenterCircle(config, {
        centerX,
        centerY,
        innerRadius: 50
    });
    svgElement.appendChild(centerCircle);

    // Add pointer
    if (showPointer) {
        const pointer = createPointer({
            centerX,
            centerY,
            radius
        });
        svgElement.appendChild(pointer);
    }
}
