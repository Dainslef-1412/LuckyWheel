/**
 * Theme presets for the wheel generator
 */

// Each palette is a cohesive, same-family sweep (6 stops) so neighbouring
// sectors read as one set instead of a clashing rainbow. Label contrast is
// handled per-sector by getContrastText, so lighter stops are safe to include.
export const THEMES = {
    forest: {
        name: '森林',
        colors: ['#1f6f43', '#2e8b57', '#3fa66b', '#6bbf59', '#a7d06a', '#4c7a34'],
        background: '#12241a',
        text: '#ffffff',
        accent: '#3fa66b'
    },
    ocean: {
        name: '海洋',
        colors: ['#023e8a', '#0466c8', '#0582ca', '#0096c7', '#00b4d8', '#48cae4'],
        background: '#022b57',
        text: '#ffffff',
        accent: '#0096c7'
    },
    sunset: {
        name: '夕阳',
        colors: ['#6a1b9a', '#b5179e', '#d81159', '#f3722c', '#f8961e', '#f9c74f'],
        background: '#2a1633',
        text: '#ffffff',
        accent: '#f3722c'
    },
    berry: {
        name: '浆果',
        colors: ['#5b164e', '#7b2661', '#9d2b6b', '#c9184a', '#d81159', '#a4508b'],
        background: '#1e0f1c',
        text: '#ffffff',
        accent: '#c9184a'
    },
    fresh: {
        name: '清新',
        colors: ['#0b7a75', '#0fa3a3', '#12b886', '#20c997', '#38d9a9', '#52b788'],
        background: '#0c2a29',
        text: '#ffffff',
        accent: '#12b886'
    }
};

/**
 * Get theme by name
 * @param {string} themeName - Name of the theme
 * @returns {Object} Theme object
 */
export function getTheme(themeName) {
    return THEMES[themeName] || THEMES.forest;
}

/**
 * Get all theme names
 * @returns {Array} Array of theme names
 */
export function getThemeNames() {
    return Object.keys(THEMES);
}

/**
 * Pick a readable label color (dark or white) for a given background fill,
 * based on its relative luminance so text stays legible on every sector.
 * @param {string} hexColor - Background color as #rgb or #rrggbb
 * @returns {string} '#ffffff' for dark fills, a dark ink for light fills
 */
export function getContrastText(hexColor) {
    const hex = String(hexColor || '').replace('#', '');
    const full = hex.length === 3
        ? hex.split('').map(c => c + c).join('')
        : hex.padEnd(6, '0').slice(0, 6);

    const toLinear = (channel) => {
        const c = parseInt(channel, 16) / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    const luminance =
        0.2126 * toLinear(full.slice(0, 2)) +
        0.7152 * toLinear(full.slice(2, 4)) +
        0.0722 * toLinear(full.slice(4, 6));

    return luminance > 0.45 ? '#2d241b' : '#ffffff';
}

/**
 * Assign colors to items based on theme, avoiding identical colors on
 * neighbouring sectors — including the wrap-around seam between last and first.
 * @param {Array} items - Array of items
 * @param {string} themeName - Name of the theme
 * @returns {Array} Items with assigned colors
 */
export function assignColors(items, themeName) {
    const theme = getTheme(themeName);
    const colors = theme.colors;

    const result = [];
    items.forEach((item, index) => {
        let color = colors[index % colors.length];
        const prevColor = index > 0 ? result[index - 1].color : null;
        if (color === prevColor) {
            color = colors[(index + 1) % colors.length];
        }
        result.push({ ...item, color });
    });

    // Fix the seam: the last sector sits next to the first one.
    const last = result.length - 1;
    if (result.length > 2 && result[last].color === result[0].color) {
        const alt = colors.find(c => c !== result[0].color && c !== result[last - 1].color);
        if (alt) result[last].color = alt;
    }

    return result;
}

/**
 * Apply theme CSS variables to element
 * @param {string} themeName - Name of the theme
 * @param {HTMLElement} element - Element to apply theme to
 */
export function applyThemeCSS(themeName, element = document.documentElement) {
    const theme = getTheme(themeName);

    element.style.setProperty('--theme-background', theme.background);
    element.style.setProperty('--theme-text', theme.text);
    element.style.setProperty('--theme-accent', theme.accent);

    theme.colors.forEach((color, index) => {
        element.style.setProperty(`--theme-color-${index}`, color);
    });
}

/**
 * Get CSS for theme
 * @param {string} themeName - Name of the theme
 * @returns {string} CSS string
 */
export function getThemeCSS(themeName) {
    const theme = getTheme(themeName);
    const colorsCSS = theme.colors.map((color, index) =>
        `    --theme-color-${index}: ${color};`
    ).join('\n');

    return `
    --theme-background: ${theme.background};
    --theme-text: ${theme.text};
    --theme-accent: ${theme.accent};
${colorsCSS}`;
}
