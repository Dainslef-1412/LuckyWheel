/**
 * Main application entry point
 */

import { generateId, debounce, weightedRandom } from './utils.js';
import { assignColors, getThemeNames } from './themes.js';
import { renderWheel, calculateSectorAngles } from './wheel.js';
import { exportWheel } from './export.js';

// Application state
const state = {
    config: {
        title: '我的转盘',
        theme: 'forest',
        items: [
            { id: generateId(), label: '选项A', weight: 1 },
            { id: generateId(), label: '选项B', weight: 1 },
            { id: generateId(), label: '选项C', weight: 1 }
        ]
    },
    isSpinning: false,
    currentRotation: 0
};

// DOM elements
let elements = {};

/**
 * Initialize application
 */
function init() {
    // Cache DOM elements
    cacheElements();

    // Render initial state
    renderOptionsList();
    renderThemeSelector();
    updateWheelPreview();

    // Setup event listeners
    setupEventListeners();

    console.log('Wheel generator initialized');
}

/**
 * Cache DOM elements
 */
function cacheElements() {
    elements = {
        titleInput: document.getElementById('title-input'),
        themeSelector: document.getElementById('theme-selector'),
        optionsList: document.getElementById('options-list'),
        addOptionBtn: document.getElementById('add-option'),
        exportBtn: document.getElementById('export-btn'),
        previewWheel: document.getElementById('preview-wheel'),
        spinBtn: document.getElementById('spin-btn'),
        resultDisplay: document.getElementById('result-display')
    };
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Title input
    elements.titleInput.addEventListener('input', debounce((e) => {
        state.config.title = e.target.value;
        updateWheelPreview();
    }, 300));

    // Theme selector
    elements.themeSelector.addEventListener('click', (e) => {
        const themeOption = e.target.closest('.theme-option');
        if (themeOption) {
            const theme = themeOption.dataset.theme;
            selectTheme(theme);
        }
    });

    // Add option button
    elements.addOptionBtn.addEventListener('click', addOption);

    // Export button
    elements.exportBtn.addEventListener('click', handleExport);

    // Spin button
    elements.spinBtn.addEventListener('click', handleSpin);

    // Options list event delegation
    elements.optionsList.addEventListener('input', debounce(handleOptionInput, 300));
    elements.optionsList.addEventListener('click', handleOptionClick);
}

/**
 * Select theme
 * @param {string} themeName - Theme name
 */
function selectTheme(themeName) {
    state.config.theme = themeName;

    // Update UI
    const themeOptions = elements.themeSelector.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.classList.toggle('active', option.dataset.theme === themeName);
    });

    updateWheelPreview();
}

/**
 * Render theme selector
 */
function renderThemeSelector() {
    const themes = getThemeNames();

    elements.themeSelector.innerHTML = themes.map(theme => {
        const isActive = theme === state.config.theme ? 'active' : '';
        const themeNames = {
            forest: '森林',
            ocean: '海洋',
            sunset: '夕阳',
            berry: '浆果',
            fresh: '清新'
        };
        return `<div class="theme-option ${isActive}" data-theme="${theme}">${themeNames[theme]}</div>`;
    }).join('');
}

/**
 * Render options list
 */
function renderOptionsList() {
    elements.optionsList.innerHTML = state.config.items.map((item, index) => `
        <div class="option-item" data-id="${item.id}">
            <input
                type="text"
                value="${item.label}"
                placeholder="选项 ${index + 1}"
                data-field="label"
                data-id="${item.id}"
            >
            <input
                type="number"
                value="${item.weight}"
                min="1"
                placeholder="权重"
                data-field="weight"
                data-id="${item.id}"
            >
            <button
                type="button"
                class="btn btn-danger"
                data-action="remove"
                data-id="${item.id}"
            >×</button>
        </div>
    `).join('');
}

/**
 * Add new option
 */
function addOption() {
    if (state.config.items.length >= 20) {
        alert('最多只能添加 20 个选项');
        return;
    }

    const newItem = {
        id: generateId(),
        label: `选项${state.config.items.length + 1}`,
        weight: 1
    };

    state.config.items.push(newItem);
    renderOptionsList();
    updateWheelPreview();
}

/**
 * Handle option input
 * @param {Event} e - Input event
 */
function handleOptionInput(e) {
    const target = e.target;
    const id = target.dataset.id;
    const field = target.dataset.field;

    if (!id || !field) return;

    const item = state.config.items.find(item => item.id === id);
    if (!item) return;

    let value = target.value;

    if (field === 'weight') {
        value = parseInt(value, 10) || 1;
        if (value < 1) value = 1;
    }

    item[field] = value;
    updateWheelPreview();
}

/**
 * Handle option click
 * @param {Event} e - Click event
 */
function handleOptionClick(e) {
    const target = e.target;

    if (target.dataset.action === 'remove') {
        const id = target.dataset.id;

        if (state.config.items.length <= 2) {
            alert('最少需要 2 个选项');
            return;
        }

        state.config.items = state.config.items.filter(item => item.id !== id);
        renderOptionsList();
        updateWheelPreview();
    }
}

/**
 * Update wheel preview
 */
function updateWheelPreview() {
    // Assign colors based on theme
    const itemsWithColors = assignColors(state.config.items, state.config.theme);

    const config = {
        ...state.config,
        items: itemsWithColors
    };

    renderWheel(config, elements.previewWheel, {
        centerX: 250,
        centerY: 250,
        radius: 200,
        showPointer: true
    });
}

/**
 * Handle export
 */
async function handleExport() {
    try {
        // Validate
        if (state.config.items.length < 2) {
            alert('最少需要 2 个选项');
            return;
        }

        // Assign colors
        const itemsWithColors = assignColors(state.config.items, state.config.theme);

        const configToExport = {
            ...state.config,
            items: itemsWithColors
        };

        // Export
        await exportWheel(configToExport);

        // Show success message
        alert('转盘文件已生成！您可以在浏览器中打开它，无需联网。');
    } catch (error) {
        console.error('Export error:', error);
        alert('导出失败，请重试');
    }
}

/**
 * Handle spin button click
 */
function handleSpin() {
    if (state.isSpinning) return;
    if (state.config.items.length < 2) {
        alert('至少需要 2 个选项才能旋转');
        return;
    }

    state.isSpinning = true;
    elements.spinBtn.disabled = true;
    elements.resultDisplay.classList.remove('placeholder', 'show');
    elements.resultDisplay.textContent = '🎰 旋转中...';
    elements.resultDisplay.classList.add('show');

    // Determine winner using weighted random
    const winner = weightedRandom(state.config.items);

    // Calculate angles to find winner position
    const angles = calculateSectorAngles(state.config.items);
    const winnerIndex = state.config.items.findIndex(item => item.id === winner.id);
    const winnerAngle = angles[winnerIndex].center;

    // Calculate rotation (5 spins + positioning)
    const spins = 5;
    const targetRotation = (360 * spins) + (360 - winnerAngle);
    const finalRotation = state.currentRotation + targetRotation;

    // Apply animation
    const wheelGroup = elements.previewWheel.querySelector('#wheel-container');
    if (wheelGroup) {
        // Set transform origin to center of wheel (250, 250)
        wheelGroup.style.transformOrigin = '250px 250px';
        wheelGroup.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
        wheelGroup.style.transform = `rotate(${finalRotation}deg)`;
    }

    // Update center text
    const centerText = elements.previewWheel.querySelector('text[dominant-baseline="middle"]');
    if (centerText) {
        centerText.textContent = '旋转中...';
    }

    // Show result after animation
    setTimeout(() => {
        state.isSpinning = false;
        state.currentRotation = finalRotation;
        elements.spinBtn.disabled = false;

        // Update center text with winner
        if (centerText) {
            centerText.textContent = winner.label;
        }

        // Show result
        elements.resultDisplay.innerHTML = `🎉 恭喜！结果是：<strong>${winner.label}</strong>`;
    }, 4000);
}

/**
 * Get current config
 * @returns {Object} Current configuration
 */
export function getConfig() {
    return { ...state.config };
}

/**
 * Set config
 * @param {Object} config - New configuration
 */
export function setConfig(config) {
    state.config = { ...config };
    renderOptionsList();
    renderThemeSelector();
    updateWheelPreview();
}

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
