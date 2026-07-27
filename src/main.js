/**
 * Main application entry point
 */

import { generateId, debounce, weightedRandom } from './utils.js';
import { assignColors, getThemeNames } from './themes.js';
import { renderWheel, calculateSectorAngles, setCenterText, calculateSpinRotation } from './wheel.js';
import { PresetManager } from './preset-manager.js';
import { decodeConfigFromURL, generateShareURL, hasConfigInURL } from './url-handler.js';

const presetManager = new PresetManager();
const DEFAULT_PRESET_ID = 'dinner';
const SPIN_ROTATIONS = 5;
const SPIN_DURATION_MS = 4000;

function createDefaultConfig() {
    return {
        title: '我的转盘',
        theme: 'forest',
        items: [
            { id: generateId(), label: '选项A', weight: 1 },
            { id: generateId(), label: '选项B', weight: 1 },
            { id: generateId(), label: '选项C', weight: 1 }
        ]
    };
}

function createEditableConfig(config = {}) {
    const fallback = createDefaultConfig();
    const items = Array.isArray(config.items) && config.items.length > 0 ? config.items : fallback.items;

    return {
        title: config.title || fallback.title,
        theme: config.theme || fallback.theme,
        items: items.map((item, index) => ({
            id: item.id || generateId(),
            label: item.label || `选项${index + 1}`,
            weight: Math.max(1, parseInt(item.weight, 10) || 1)
        }))
    };
}

function cloneConfig(config) {
    return JSON.parse(JSON.stringify(config));
}

function normalizeConfigForCompare(config = {}) {
    return {
        title: config.title || '',
        theme: config.theme || 'forest',
        items: (config.items || []).map(item => ({
            label: item.label || '',
            weight: Math.max(1, parseInt(item.weight, 10) || 1)
        }))
    };
}

function areConfigsEqual(left, right) {
    return JSON.stringify(normalizeConfigForCompare(left)) === JSON.stringify(normalizeConfigForCompare(right));
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}

function setActionButton(button, title, caption) {
    button.innerHTML = `
        <span class="btn-main">${escapeHTML(title)}</span>
        <span class="btn-caption">${escapeHTML(caption)}</span>
    `;
}

const state = {
    config: createDefaultConfig(),
    isSpinning: false,
    currentRotation: 0,
    currentPresetId: null,
    isPresetDirty: false,
    baselinePresetConfig: null,
    presetFeedback: {
        type: 'info',
        text: '当前是未绑定草稿'
    }
};

let elements = {};
let presetNameModalResolver = null;

function init() {
    cacheElements();

    if (hasConfigInURL()) {
        const urlConfig = decodeConfigFromURL();
        if (urlConfig) {
            state.config = createEditableConfig(urlConfig);
            state.presetFeedback = {
                type: 'info',
                text: '已从分享链接载入当前配置'
            };
        }
    } else {
        loadInitialPreset(DEFAULT_PRESET_ID);
    }

    elements.titleInput.value = state.config.title;
    renderOptionsList();
    renderThemeSelector();
    renderPresetSelector();
    renderPresetUI();
    updateWheelPreview();
    setupEventListeners();

    console.log('Wheel generator initialized');
}

function cacheElements() {
    elements = {
        titleInput: document.getElementById('title-input'),
        themeSelector: document.getElementById('theme-selector'),
        optionsList: document.getElementById('options-list'),
        addOptionBtn: document.getElementById('add-option'),
        previewWheel: document.getElementById('preview-wheel'),
        spinBtn: document.getElementById('spin-btn'),
        resultDisplay: document.getElementById('result-display'),
        presetSelector: document.getElementById('preset-selector'),
        presetCurrent: document.getElementById('preset-current'),
        presetStatus: document.getElementById('preset-status'),
        presetSaveBtn: document.getElementById('preset-save-btn'),
        duplicatePresetBtn: document.getElementById('duplicate-preset-btn'),
        renamePresetBtn: document.getElementById('rename-preset-btn'),
        deletePresetBtn: document.getElementById('delete-preset-btn'),
        shareUrlBtn: document.getElementById('share-url-btn'),
        shareModal: document.getElementById('share-modal'),
        shareUrlInput: document.getElementById('share-url-input'),
        copyUrlBtn: document.getElementById('copy-url-btn'),
        closeModalBtn: document.getElementById('close-modal-btn'),
        shareClose: document.getElementById('share-close'),
        presetNameModal: document.getElementById('preset-name-modal'),
        presetNameTitle: document.getElementById('preset-name-title'),
        presetNameCopy: document.getElementById('preset-name-copy'),
        presetNameInput: document.getElementById('preset-name-input'),
        presetNameConfirmBtn: document.getElementById('preset-name-confirm-btn'),
        presetNameCancelBtn: document.getElementById('preset-name-cancel-btn'),
        presetNameClose: document.getElementById('preset-name-close'),
        runtimeWarning: document.getElementById('runtime-warning')
    };

    elements.runtimeWarning?.classList.add('hidden');
}

function loadInitialPreset(presetId) {
    const preset = presetManager.getPresetById(presetId);
    if (!preset) return;

    state.config = createEditableConfig(preset.config);
    state.currentPresetId = preset.id;
    state.baselinePresetConfig = normalizeConfigForCompare(preset.config);
    state.isPresetDirty = false;
    state.presetFeedback = {
        type: 'info',
        text: '已载入默认模板，可直接修改后保存副本'
    };
}

function setupEventListeners() {
    elements.titleInput.addEventListener('input', debounce((e) => {
        state.config.title = e.target.value;
        handleConfigMutation();
    }, 300));

    elements.themeSelector.addEventListener('click', (e) => {
        const themeOption = e.target.closest('.theme-option');
        if (themeOption) {
            selectTheme(themeOption.dataset.theme);
        }
    });

    elements.addOptionBtn.addEventListener('click', addOption);
    elements.spinBtn.addEventListener('click', handleSpin);
    elements.presetSelector.addEventListener('change', handlePresetSelection);
    elements.presetSaveBtn.addEventListener('click', handlePresetSave);
    elements.duplicatePresetBtn.addEventListener('click', saveAsNewPreset);
    elements.renamePresetBtn.addEventListener('click', renameCurrentPreset);
    elements.deletePresetBtn.addEventListener('click', deleteCurrentPreset);
    elements.shareUrlBtn.addEventListener('click', showShareModal);
    elements.shareClose.addEventListener('click', hideShareModal);
    elements.closeModalBtn.addEventListener('click', hideShareModal);
    elements.copyUrlBtn.addEventListener('click', copyShareURL);
    elements.presetNameConfirmBtn.addEventListener('click', submitPresetNameModal);
    elements.presetNameCancelBtn.addEventListener('click', () => closePresetNameModal(null));
    elements.presetNameClose.addEventListener('click', () => closePresetNameModal(null));
    elements.presetNameInput.addEventListener('keydown', handlePresetNameModalKeydown);
    elements.optionsList.addEventListener('input', handleOptionInput);
    elements.optionsList.addEventListener('click', handleOptionClick);
}

function handlePresetNameModalKeydown(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        submitPresetNameModal();
        return;
    }

    if (e.key === 'Escape') {
        e.preventDefault();
        closePresetNameModal(null);
    }
}

function openPresetNameModal({
    title = '保存预设',
    description = '请输入预设名称。',
    value = '',
    confirmText = '确定'
} = {}) {
    if (presetNameModalResolver) {
        closePresetNameModal(null);
    }

    elements.presetNameTitle.textContent = title;
    elements.presetNameCopy.textContent = description;
    elements.presetNameInput.value = value;
    elements.presetNameConfirmBtn.textContent = confirmText;
    elements.presetNameModal.classList.add('active');

    requestAnimationFrame(() => {
        elements.presetNameInput.focus();
        elements.presetNameInput.select();
    });

    return new Promise(resolve => {
        presetNameModalResolver = resolve;
    });
}

function closePresetNameModal(value) {
    elements.presetNameModal.classList.remove('active');

    if (presetNameModalResolver) {
        const resolve = presetNameModalResolver;
        presetNameModalResolver = null;
        resolve(value);
    }
}

function submitPresetNameModal() {
    closePresetNameModal(elements.presetNameInput.value);
}

function getCurrentPreset() {
    return state.currentPresetId ? presetManager.getPresetById(state.currentPresetId) : null;
}

function isUserPresetId(presetId) {
    return presetManager.getUserPresets().some(preset => preset.id === presetId);
}

function getCurrentPresetKind() {
    const preset = getCurrentPreset();
    if (!preset) return 'none';
    return isUserPresetId(preset.id) ? 'user' : 'builtin';
}

function getPresetSourceLabel(preset) {
    return isUserPresetId(preset.id) ? '我的预设' : '默认模板';
}

function setPresetFeedback(type, text) {
    state.presetFeedback = { type, text };
}

function syncPresetDirtyState() {
    if (!state.currentPresetId || !state.baselinePresetConfig) {
        state.isPresetDirty = false;
        return;
    }

    state.isPresetDirty = !areConfigsEqual(state.config, state.baselinePresetConfig);
}

function handleConfigMutation({ rerenderOptions = false } = {}) {
    if (rerenderOptions) {
        renderOptionsList();
    }

    updateWheelPreview();
    syncPresetDirtyState();
    renderPresetUI();
}

function hydrateFormFromState() {
    elements.titleInput.value = state.config.title;
}

function bindCurrentConfigToPreset(presetId, feedbackText) {
    const preset = presetManager.getPresetById(presetId);
    state.currentPresetId = presetId;
    state.baselinePresetConfig = normalizeConfigForCompare(preset?.config || state.config);
    state.isPresetDirty = false;
    setPresetFeedback('success', feedbackText);
}

function clearPresetBinding(feedbackText = '当前是未绑定草稿') {
    state.currentPresetId = null;
    state.baselinePresetConfig = null;
    state.isPresetDirty = false;
    setPresetFeedback('info', feedbackText);
}

function confirmDiscardPresetChanges(actionLabel = '切换') {
    if (!state.isPresetDirty) return true;

    return confirm(`当前预设有未保存修改。\n继续${actionLabel}后，这些改动不会写回原预设。\n\n确定继续吗？`);
}

function selectTheme(themeName) {
    state.config.theme = themeName;

    const themeOptions = elements.themeSelector.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.classList.toggle('active', option.dataset.theme === themeName);
    });

    handleConfigMutation();
}

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

function renderOptionsList() {
    const canRemove = state.config.items.length > 2;

    elements.optionsList.innerHTML = state.config.items.map((item, index) => `
        <div class="option-item" data-id="${item.id}">
            <div class="option-index">#${index + 1}</div>
            <label class="option-field">
                名称
                <input
                    type="text"
                    value="${escapeHTML(item.label)}"
                    placeholder="选项 ${index + 1}"
                    data-field="label"
                    data-id="${item.id}"
                >
            </label>
            <label class="option-field weight-field">
                权重
                <input
                    type="number"
                    value="${escapeHTML(item.weight)}"
                    min="1"
                    placeholder="权重"
                    data-field="weight"
                    data-id="${item.id}"
                >
            </label>
            <button
                type="button"
                class="btn btn-danger option-delete"
                data-action="remove"
                data-id="${item.id}"
                aria-label="删除 ${escapeHTML(item.label)}"
                title="${canRemove ? '删除这个选项' : '至少保留 2 个选项'}"
                ${canRemove ? '' : 'disabled'}
            >删除</button>
        </div>
    `).join('');
}

function addOption() {
    if (state.config.items.length >= 20) {
        alert('最多只能添加 20 个选项');
        return;
    }

    state.config.items.push({
        id: generateId(),
        label: `选项${state.config.items.length + 1}`,
        weight: 1
    });

    handleConfigMutation({ rerenderOptions: true });
}

function handleOptionInput(e) {
    const target = e.target;
    const id = target.dataset.id;
    const field = target.dataset.field;

    if (!id || !field) return;

    const item = state.config.items.find(entry => entry.id === id);
    if (!item) return;

    let value = target.value;

    if (field === 'weight') {
        value = Math.max(1, parseInt(value, 10) || 1);
        target.value = value;
    }

    item[field] = value;
    handleConfigMutation();
}

function handleOptionClick(e) {
    const target = e.target;

    if (target.dataset.action !== 'remove') return;

    if (state.config.items.length <= 2) {
        alert('最少需要 2 个选项');
        return;
    }

    state.config.items = state.config.items.filter(item => item.id !== target.dataset.id);
    handleConfigMutation({ rerenderOptions: true });
}

function updateWheelPreview() {
    const itemsWithColors = assignColors(state.config.items, state.config.theme);

    renderWheel({
        ...state.config,
        items: itemsWithColors
    }, elements.previewWheel, {
        centerX: 250,
        centerY: 250,
        radius: 200,
        showPointer: true
    });
}

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

    const winner = weightedRandom(state.config.items);
    const angles = calculateSectorAngles(state.config.items);
    const winnerIndex = state.config.items.findIndex(item => item.id === winner.id);
    const winnerAngle = angles[winnerIndex].center;

    const finalRotation = calculateSpinRotation(state.currentRotation, winnerAngle, SPIN_ROTATIONS);

    const wheelGroup = elements.previewWheel.querySelector('#wheel-container');
    if (wheelGroup) {
        wheelGroup.style.transformOrigin = '250px 250px';
        wheelGroup.style.transition = `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`;
        wheelGroup.style.transform = `rotate(${finalRotation}deg)`;
    }

    setCenterText(elements.previewWheel, '旋转中...');

    setTimeout(() => {
        state.isSpinning = false;
        state.currentRotation = finalRotation;
        elements.spinBtn.disabled = false;

        setCenterText(elements.previewWheel, winner.label);

        elements.resultDisplay.innerHTML = `🎉 恭喜！结果是：<strong>${escapeHTML(winner.label)}</strong>`;
    }, SPIN_DURATION_MS);
}

function getConfig() {
    return cloneConfig(state.config);
}

function renderPresetSelector() {
    const allPresets = presetManager.getAllPresets();
    const userPresets = presetManager.getUserPresets();
    const categoryGroups = {};

    allPresets.forEach(preset => {
        if (!categoryGroups[preset.category]) {
            categoryGroups[preset.category] = [];
        }
        categoryGroups[preset.category].push(preset);
    });

    elements.presetSelector.innerHTML = '<option value="">从空白转盘开始</option>';

    if (categoryGroups['生活']) {
        const group = document.createElement('optgroup');
        group.label = '生活场景';
        categoryGroups['生活'].forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.id;
            option.textContent = preset.name;
            group.appendChild(option);
        });
        elements.presetSelector.appendChild(group);
    }

    if (categoryGroups['娱乐']) {
        const group = document.createElement('optgroup');
        group.label = '娱乐场景';
        categoryGroups['娱乐'].forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.id;
            option.textContent = preset.name;
            group.appendChild(option);
        });
        elements.presetSelector.appendChild(group);
    }

    if (categoryGroups['工作']) {
        const group = document.createElement('optgroup');
        group.label = '工作场景';
        categoryGroups['工作'].forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.id;
            option.textContent = preset.name;
            group.appendChild(option);
        });
        elements.presetSelector.appendChild(group);
    }

    if (categoryGroups['决策']) {
        const group = document.createElement('optgroup');
        group.label = '决策工具';
        categoryGroups['决策'].forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.id;
            option.textContent = preset.name;
            group.appendChild(option);
        });
        elements.presetSelector.appendChild(group);
    }

    if (userPresets.length > 0) {
        const userGroup = document.createElement('optgroup');
        userGroup.label = '我的预设';
        userPresets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.id;
            option.textContent = `⭐ ${preset.name}`;
            userGroup.appendChild(option);
        });
        elements.presetSelector.appendChild(userGroup);
    }

    elements.presetSelector.value = state.currentPresetId || '';
}

function renderPresetUI() {
    renderPresetSelector();

    const preset = getCurrentPreset();
    const presetKind = getCurrentPresetKind();
    const presetLabel = preset
        ? `${preset.name} · ${getPresetSourceLabel(preset)}`
        : '空白转盘';

    let statusType = state.presetFeedback.type || 'info';
    let statusText = state.presetFeedback.text || '当前是未绑定草稿';

    if (state.isPresetDirty) {
        statusType = 'dirty';
        statusText = presetKind === 'builtin' ? '已修改模板，保存副本后可长期保留' : '已修改，未保存';
    } else if (!preset && !statusText) {
        statusText = '当前是未绑定草稿';
    } else if (!preset && statusType !== 'success') {
        statusType = 'info';
        statusText = statusText || '当前是未绑定草稿';
    } else if (presetKind === 'builtin' && statusType !== 'success') {
        statusType = 'info';
        statusText = '默认模板可直接试用，修改后建议保存副本';
    } else if (presetKind === 'user' && statusType !== 'success') {
        statusType = 'info';
        statusText = '已保存，可继续编辑或另存为新预设';
    }

    elements.presetCurrent.textContent = `当前：${presetLabel}`;
    elements.presetStatus.textContent = statusText;
    elements.presetStatus.className = `preset-status-badge ${statusType}`;

    setActionButton(elements.duplicatePresetBtn, '新增：保存副本', '把当前转盘存到“我的预设”');

    if (presetKind === 'user') {
        setActionButton(elements.presetSaveBtn, '修改：保存当前', '更新正在编辑的我的预设');
        elements.presetSaveBtn.disabled = !state.isPresetDirty;
    } else if (presetKind === 'builtin') {
        setActionButton(elements.presetSaveBtn, '修改：模板不可覆盖', '请用“新增：保存副本”保存');
        elements.presetSaveBtn.disabled = true;
    } else {
        setActionButton(elements.presetSaveBtn, '修改：暂无预设', '请先保存副本再修改');
        elements.presetSaveBtn.disabled = true;
    }

    elements.duplicatePresetBtn.disabled = false;
    elements.renamePresetBtn.disabled = presetKind !== 'user';
    elements.deletePresetBtn.disabled = presetKind !== 'user';
}

function handlePresetSelection(e) {
    const nextPresetId = e.target.value;

    if (nextPresetId === state.currentPresetId) return;

    if (!confirmDiscardPresetChanges(nextPresetId ? '切换预设' : '取消绑定')) {
        elements.presetSelector.value = state.currentPresetId || '';
        return;
    }

    if (nextPresetId) {
        loadPreset(nextPresetId);
        return;
    }

    state.config = createDefaultConfig();
    hydrateFormFromState();
    renderOptionsList();
    renderThemeSelector();
    updateWheelPreview();
    clearPresetBinding('已切换为空白转盘');
    renderPresetUI();
}

function loadPreset(presetId) {
    const preset = presetManager.getPresetById(presetId);
    if (!preset) return;

    state.config = createEditableConfig({
        ...preset.config,
        items: preset.config.items.map(item => ({
            ...item,
            id: generateId()
        }))
    });

    state.currentPresetId = presetId;
    state.baselinePresetConfig = normalizeConfigForCompare(preset.config);
    state.isPresetDirty = false;
    setPresetFeedback('info', isUserPresetId(presetId) ? '已载入用户预设' : '已载入默认预设');

    hydrateFormFromState();
    renderOptionsList();
    renderThemeSelector();
    updateWheelPreview();
    renderPresetUI();

    console.log(`Loaded preset: ${preset.name}`);
}

function buildPresetPayload({ id, name, existingPreset = null } = {}) {
    return {
        id: id || Date.now().toString(),
        name,
        description: state.config.title,
        category: existingPreset?.category || '自定义',
        createdAt: existingPreset?.createdAt || new Date().toISOString(),
        config: getConfig()
    };
}

function getDefaultNewPresetName() {
    const currentPreset = getCurrentPreset();
    if (currentPreset) {
        return `${currentPreset.name} (自定义)`;
    }
    return state.config.title || '我的预设';
}

function handlePresetSave() {
    const presetKind = getCurrentPresetKind();

    if (presetKind === 'user' || presetKind === 'builtin') {
        if (presetKind === 'builtin') {
            saveAsNewPreset();
            return;
        }
        if (!state.isPresetDirty) return;
        saveCurrentPresetChanges();
        return;
    }

    saveAsNewPreset();
}

function saveCurrentPresetChanges() {
    const currentPreset = getCurrentPreset();
    if (!currentPreset || getCurrentPresetKind() === 'none') return;

    try {
        const payload = buildPresetPayload({
            id: currentPreset.id,
            name: currentPreset.name,
            existingPreset: currentPreset
        });

        presetManager.savePreset(payload);
        bindCurrentConfigToPreset(currentPreset.id, `已保存到预设“${currentPreset.name}”`);
        renderPresetUI();
    } catch (error) {
        alert(`❌ 保存失败：${error.message}`);
    }
}

async function saveAsNewPreset() {
    try {
        const defaultName = getDefaultNewPresetName();
        const name = await openPresetNameModal({
            title: '另存为新预设',
            description: '给这份当前配置起一个名字，保存后会出现在“我的预设”里。',
            value: defaultName,
            confirmText: '保存预设'
        });
        if (!name || !name.trim()) return;

        const trimmedName = name.trim();
        const newPreset = buildPresetPayload({ name: trimmedName });
        presetManager.savePreset(newPreset);
        bindCurrentConfigToPreset(newPreset.id, `已另存为预设“${trimmedName}”`);
        renderPresetUI();
    } catch (error) {
        alert(`❌ 保存失败：${error.message}`);
    }
}

async function renameCurrentPreset() {
    const currentPreset = getCurrentPreset();
    if (!currentPreset || getCurrentPresetKind() === 'none') return;

    const nextName = await openPresetNameModal({
        title: '重命名预设',
        description: '修改这个预设的显示名称，不会影响当前配置内容。',
        value: currentPreset.name,
        confirmText: '保存名称'
    });
    if (!nextName) return;

    const trimmedName = nextName.trim();
    if (!trimmedName || trimmedName === currentPreset.name) return;

    try {
        presetManager.savePreset({
            ...currentPreset,
            name: trimmedName
        });
        setPresetFeedback('success', `预设已重命名为“${trimmedName}”`);
        renderPresetUI();
    } catch (error) {
        alert(`❌ 重命名失败：${error.message}`);
    }
}

function deleteCurrentPreset() {
    const currentPreset = getCurrentPreset();
    if (!currentPreset || getCurrentPresetKind() === 'none') return;

    const presetKind = getCurrentPresetKind();
    const presetTypeLabel = presetKind === 'builtin' ? '默认预设' : '用户预设';
    const message = state.isPresetDirty
        ? `当前${presetTypeLabel}“${currentPreset.name}”有未保存修改。\n删除后，当前页面内容会保留，但不会再绑定到这个预设。\n\n确定删除吗？`
        : `确定删除${presetTypeLabel}“${currentPreset.name}”吗？`;

    if (!confirm(message)) return;

    try {
        presetManager.deletePreset(currentPreset.id);
    } catch (error) {
        alert(`❌ 删除失败：${error.message}`);
        return;
    }

    if (state.currentPresetId === currentPreset.id) {
        clearPresetBinding('预设已删除，当前配置已变成未绑定草稿');
    } else {
        setPresetFeedback('success', `预设“${currentPreset.name}”已删除`);
    }

    renderPresetUI();
}

function showShareModal() {
    elements.shareUrlInput.value = generateShareURL(getConfig());
    elements.shareModal.classList.add('active');
}

function hideShareModal() {
    elements.shareModal.classList.remove('active');
}

async function copyShareURL() {
    try {
        await navigator.clipboard.writeText(elements.shareUrlInput.value);

        const originalText = elements.copyUrlBtn.textContent;
        elements.copyUrlBtn.textContent = '✅ 已复制';
        elements.copyUrlBtn.disabled = true;

        setTimeout(() => {
            elements.copyUrlBtn.textContent = originalText;
            elements.copyUrlBtn.disabled = false;
        }, 2000);
    } catch (error) {
        console.error('Failed to copy:', error);
        alert('复制失败，请手动复制链接');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
