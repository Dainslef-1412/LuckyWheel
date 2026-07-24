/**
 * SVG rendering engine for the wheel
 */

import { degToRad, getTotalWeight, calculatePointOnCircle, truncateText } from './utils.js';
import { getContrastText, getTheme } from './themes.js';

const SVGNS = 'http://www.w3.org/2000/svg';

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
 * Calculate the rotation (in degrees) for a sector label so it never renders
 * upside down. Labels whose sector center falls on the lower half of the wheel
 * are flipped by 180° to keep the text upright and readable.
 * @param {number} centerAngle - Sector center angle in degrees
 * @returns {number} Rotation in degrees to apply to the label
 */
export function getLabelRotation(centerAngle) {
    const normalized = ((centerAngle % 360) + 360) % 360;
    const rotation = normalized > 90 && normalized < 270 ? normalized + 180 : normalized;
    return rotation % 360;
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
    text.setAttribute('fill', getContrastText(item.color));
    text.setAttribute('font-size', '15');
    text.setAttribute('font-weight', '700');
    text.setAttribute('letter-spacing', '0.5');
    text.setAttribute('transform', `rotate(${getLabelRotation(angleRange.center)}, ${labelPoint.x}, ${labelPoint.y})`);

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

    const accent = getTheme(config.theme).accent;
    const g = document.createElementNS(SVGNS, 'g');

    // Soft halo so the hub lifts off the sectors
    const halo = document.createElementNS(SVGNS, 'circle');
    halo.setAttribute('cx', centerX);
    halo.setAttribute('cy', centerY);
    halo.setAttribute('r', innerRadius + 6);
    halo.setAttribute('fill', 'rgba(0, 0, 0, 0.12)');
    g.appendChild(halo);

    // Hub with a subtle radial gradient and a theme-tinted ring
    const circle = document.createElementNS(SVGNS, 'circle');
    circle.setAttribute('cx', centerX);
    circle.setAttribute('cy', centerY);
    circle.setAttribute('r', innerRadius);
    circle.setAttribute('fill', 'url(#hub-gradient)');
    circle.setAttribute('stroke', accent);
    circle.setAttribute('stroke-width', '4');
    g.appendChild(circle);

    // Center text
    const text = document.createElementNS(SVGNS, 'text');
    text.setAttribute('x', centerX);
    text.setAttribute('y', centerY);
    text.setAttribute('data-role', 'center-text');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', '#2d241b');
    text.setAttribute('font-size', '16');
    text.setAttribute('font-weight', '800');
    text.textContent = config.title || '开始';
    g.appendChild(text);

    return g;
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

    const g = document.createElementNS(SVGNS, 'g');

    // Downward teardrop pointer overlapping the rim, so it reads as "landing here"
    const tipY = centerY - radius + 6;
    const baseY = centerY - radius - pointerSize;
    const halfW = pointerSize * 0.62;

    const pointer = document.createElementNS(SVGNS, 'path');
    pointer.setAttribute('d', [
        `M ${centerX} ${tipY}`,
        `L ${centerX - halfW} ${baseY}`,
        `Q ${centerX} ${baseY - pointerSize * 0.5} ${centerX + halfW} ${baseY}`,
        'Z'
    ].join(' '));
    pointer.setAttribute('fill', '#e5383b');
    pointer.setAttribute('stroke', '#fff');
    pointer.setAttribute('stroke-width', '2.5');
    pointer.setAttribute('stroke-linejoin', 'round');

    // Small cap where the pointer meets the rim
    const cap = document.createElementNS(SVGNS, 'circle');
    cap.setAttribute('cx', centerX);
    cap.setAttribute('cy', baseY - 1);
    cap.setAttribute('r', pointerSize * 0.34);
    cap.setAttribute('fill', '#e5383b');
    cap.setAttribute('stroke', '#fff');
    cap.setAttribute('stroke-width', '2');

    g.appendChild(pointer);
    g.appendChild(cap);

    return g;
}

/**
 * Create SVG <defs> (gradients) and a static outer bezel ring that frames
 * the wheel like a physical prize wheel.
 */
function createWheelFrame(options = {}) {
    const {
        centerX = 250,
        centerY = 250,
        radius = 200,
        rimWidth = 9
    } = options;

    const frag = document.createDocumentFragment();

    const defs = document.createElementNS(SVGNS, 'defs');
    const grad = document.createElementNS(SVGNS, 'radialGradient');
    grad.setAttribute('id', 'hub-gradient');
    grad.setAttribute('cx', '50%');
    grad.setAttribute('cy', '38%');
    grad.setAttribute('r', '65%');
    [['0%', '#ffffff'], ['100%', '#f4e9d8']].forEach(([offset, color]) => {
        const stop = document.createElementNS(SVGNS, 'stop');
        stop.setAttribute('offset', offset);
        stop.setAttribute('stop-color', color);
        grad.appendChild(stop);
    });
    defs.appendChild(grad);
    frag.appendChild(defs);

    // Bezel: a soft cream ring just outside the sectors
    const bezel = document.createElementNS(SVGNS, 'circle');
    bezel.setAttribute('cx', centerX);
    bezel.setAttribute('cy', centerY);
    bezel.setAttribute('r', radius + rimWidth);
    bezel.setAttribute('fill', '#fdf3e6');
    bezel.setAttribute('stroke', 'rgba(103, 70, 38, 0.18)');
    bezel.setAttribute('stroke-width', '1.5');
    frag.appendChild(bezel);

    return frag;
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

    // Static frame (defs + bezel ring) rendered behind the rotating sectors
    svgElement.appendChild(createWheelFrame({ centerX, centerY, radius }));

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

/**
 * Update wheel rotation
 * @param {number} rotation - Rotation in degrees
 * @param {SVGSVGElement} svgElement - SVG element
 */
export function updateWheelRotation(rotation, svgElement) {
    const wheelGroup = svgElement.querySelector('#wheel-container');
    if (wheelGroup) {
        wheelGroup.setAttribute('transform', `rotate(${rotation}, 250, 250)`);
    }
}

/**
 * Get wheel rotation
 * @param {SVGSVGElement} svgElement - SVG element
 * @returns {number} Current rotation in degrees
 */
export function getWheelRotation(svgElement) {
    const wheelGroup = svgElement.querySelector('#wheel-container');
    if (wheelGroup) {
        const transform = wheelGroup.getAttribute('transform');
        const match = transform?.match(/rotate\((\d+)/);
        return match ? parseInt(match[1], 10) : 0;
    }
    return 0;
}
