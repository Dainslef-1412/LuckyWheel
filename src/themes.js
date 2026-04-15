/**
 * Theme presets for the wheel generator
 */

export const THEMES = {
    forest: {
        name: '森林',
        colors: ['#2d5a27', '#90be6d', '#43aa8b', '#f9c74f', '#f3722c'],
        background: '#1a1a1a',
        text: '#ffffff',
        accent: '#90be6d'
    },
    ocean: {
        name: '海洋',
        colors: ['#0077b6', '#00b4d8', '#90e0ef', '#caf0f8', '#023e8a'],
        background: '#023e8a',
        text: '#ffffff',
        accent: '#00b4d8'
    },
    sunset: {
        name: '夕阳',
        colors: ['#ff6b6b', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'],
        background: '#2d3436',
        text: '#ffffff',
        accent: '#feca57'
    },
    berry: {
        name: '浆果',
        colors: ['#c44569', '#f8b500', '#574b90', '#303952', '#e77f67'],
        background: '#1e1e2e',
        text: '#ffffff',
        accent: '#c44569'
    },
    fresh: {
        name: '清新',
        colors: ['#00b894', '#00cec9', '#0984e3', '#6c5ce7', '#fdcb6e'],
        background: '#2d3436',
        text: '#ffffff',
        accent: '#00b894'
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
 * Assign colors to items based on theme
 * @param {Array} items - Array of items
 * @param {string} themeName - Name of the theme
 * @returns {Array} Items with assigned colors
 */
export function assignColors(items, themeName) {
    const theme = getTheme(themeName);
    const colors = theme.colors;

    return items.map((item, index) => ({
        ...item,
        color: colors[index % colors.length]
    }));
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
