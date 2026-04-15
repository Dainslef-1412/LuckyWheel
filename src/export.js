/**
 * Export system for generating standalone HTML files
 */

import { minifyCSS, minifyJS } from './utils.js';

/**
 * Read template file
 * @returns {Promise<string>} Template content
 */
async function readTemplate() {
    try {
        const response = await fetch('/template.html');
        return await response.text();
    } catch (error) {
        console.error('Error reading template:', error);
        throw error;
    }
}

/**
 * Read CSS file
 * @returns {Promise<string>} CSS content
 */
async function readCSS() {
    try {
        const response = await fetch('/src/export-styles.css');
        return await response.text();
    } catch (error) {
        console.error('Error reading CSS:', error);
        return '';
    }
}

/**
 * Read JavaScript source files
 * @returns {Promise<string>} Combined JavaScript content
 */
async function readJS() {
    try {
        const files = [
            '/src/utils.js',
            '/src/themes.js',
            '/src/wheel.js',
            '/src/spin.js',
            '/src/standalone.js'
        ];

        const contents = await Promise.all(
            files.map(async file => {
                try {
                    const response = await fetch(file);
                    return await response.text();
                } catch (error) {
                    console.warn(`Warning: Could not read ${file}:`, error);
                    return '';
                }
            })
        );

        // Remove export statements for standalone
        return contents.join('\n')
            .replace(/export\s+const\s+/g, 'const ')
            .replace(/export\s+function\s+/g, 'function ')
            .replace(/export\s*\{/g, '');
    } catch (error) {
        console.error('Error reading JS:', error);
        return '';
    }
}

/**
 * Generate standalone HTML
 * @param {Object} config - Configuration object
 * @returns {Promise<string>} Complete HTML string
 */
export async function generateStandaloneHTML(config) {
    try {
        // Read template
        const template = await readTemplate();

        // Serialize config
        const configJSON = JSON.stringify(config);

        // Read and process assets
        const css = await readCSS();
        const js = await readJS();

        // Minify
        const minifiedCSS = minifyCSS(css);
        const minifiedJS = minifyJS(js);

        // Inject into template
        const html = template
            .replace(/{{TITLE}}/g, config.title || '我的转盘')
            .replace('{{CONFIG}}', configJSON)
            .replace('{{CSS}}', minifiedCSS)
            .replace('{{JS}}', minifiedJS);

        return html;
    } catch (error) {
        console.error('Error generating HTML:', error);
        throw error;
    }
}

/**
 * Download HTML file
 * @param {string} html - HTML content
 * @param {string} filename - Filename for download
 */
export function downloadHTML(html, filename) {
    try {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'wheel.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading HTML:', error);
        throw error;
    }
}

/**
 * Export wheel as HTML file
 * @param {Object} config - Configuration object
 * @param {string} filename - Filename for download
 * @returns {Promise<void>}
 */
export async function exportWheel(config, filename) {
    try {
        const html = await generateStandaloneHTML(config);
        const defaultFilename = `${config.title || 'wheel'}.html`
            .replace(/[<>:"/\\|?*]/g, '-')
            .replace(/\s+/g, '_');
        downloadHTML(html, filename || defaultFilename);
    } catch (error) {
        console.error('Error exporting wheel:', error);
        throw error;
    }
}

/**
 * Generate filename from config
 * @param {Object} config - Configuration object
 * @returns {string} Generated filename
 */
export function generateFilename(config) {
    const title = config.title || 'wheel';
    return title
        .replace(/[<>:"/\\|?*]/g, '-')
        .replace(/\s+/g, '_') + '.html';
}
