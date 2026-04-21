/**
 * Preset manager for built-in and user-defined wheel configurations
 */

import { BUILTIN_PRESETS } from './presets.js';

export class PresetManager {
    constructor() {
        this.userStorageKey = 'zhuanpan-user-presets';
        this.builtinOverrideStorageKey = 'zhuanpan-builtin-preset-overrides';
        this.hiddenBuiltinStorageKey = 'zhuanpan-hidden-builtin-presets';
        this.userPresets = this.loadJSON(this.userStorageKey, []);
        this.builtinOverrides = this.loadJSON(this.builtinOverrideStorageKey, {});
        this.hiddenBuiltinIds = this.loadJSON(this.hiddenBuiltinStorageKey, []);
    }

    loadJSON(storageKey, fallbackValue) {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error(`Error loading ${storageKey}:`, error);
        }

        return fallbackValue;
    }

    persistJSON(storageKey, value, errorMessage) {
        try {
            localStorage.setItem(storageKey, JSON.stringify(value));
        } catch (error) {
            console.error(`Error saving ${storageKey}:`, error);
            throw new Error(errorMessage);
        }
    }

    isBuiltinPresetId(id) {
        return BUILTIN_PRESETS.some(preset => preset.id === id);
    }

    getVisibleBuiltinPresets() {
        return BUILTIN_PRESETS
            .filter(preset => !this.hiddenBuiltinIds.includes(preset.id))
            .map(preset => {
                const override = this.builtinOverrides[preset.id];
                return override ? { ...preset, ...override } : { ...preset };
            });
    }

    saveUserPresets(presets) {
        this.userPresets = presets;
        this.persistJSON(this.userStorageKey, presets, '无法保存预设，可能是存储空间已满');
    }

    saveBuiltinOverrides(overrides) {
        this.builtinOverrides = overrides;
        this.persistJSON(this.builtinOverrideStorageKey, overrides, '无法保存默认预设修改');
    }

    saveHiddenBuiltinIds(ids) {
        this.hiddenBuiltinIds = ids;
        this.persistJSON(this.hiddenBuiltinStorageKey, ids, '无法保存默认预设删除状态');
    }

    savePreset(preset) {
        if (!preset.id) {
            preset.id = Date.now().toString();
        }

        if (!preset.createdAt) {
            preset.createdAt = new Date().toISOString();
        }

        if (this.isBuiltinPresetId(preset.id)) {
            const nextOverrides = {
                ...this.builtinOverrides,
                [preset.id]: preset
            };
            this.saveBuiltinOverrides(nextOverrides);

            if (this.hiddenBuiltinIds.includes(preset.id)) {
                this.saveHiddenBuiltinIds(this.hiddenBuiltinIds.filter(id => id !== preset.id));
            }

            return preset;
        }

        const existingIndex = this.userPresets.findIndex(entry => entry.id === preset.id);
        const nextUserPresets = [...this.userPresets];

        if (existingIndex >= 0) {
            nextUserPresets[existingIndex] = preset;
        } else {
            nextUserPresets.push(preset);
        }

        this.saveUserPresets(nextUserPresets);
        return preset;
    }

    deletePreset(id) {
        if (this.getAllPresets().length <= 1) {
            throw new Error('最少需要保留 1 个预设');
        }

        if (this.isBuiltinPresetId(id)) {
            if (this.hiddenBuiltinIds.includes(id)) {
                return false;
            }

            this.saveHiddenBuiltinIds([...this.hiddenBuiltinIds, id]);
            return true;
        }

        const initialLength = this.userPresets.length;
        const nextUserPresets = this.userPresets.filter(preset => preset.id !== id);

        if (nextUserPresets.length < initialLength) {
            this.saveUserPresets(nextUserPresets);
            return true;
        }

        return false;
    }

    getAllPresets() {
        return [...this.getVisibleBuiltinPresets(), ...this.userPresets];
    }

    getPresetById(id) {
        return this.getAllPresets().find(preset => preset.id === id) || null;
    }

    getUserPresets() {
        return [...this.userPresets];
    }

    getBuiltinPresets() {
        return [...this.getVisibleBuiltinPresets()];
    }

    getPresetsByCategory(category) {
        return this.getAllPresets().filter(preset => preset.category === category);
    }

    getCategories() {
        const categories = new Set(this.getAllPresets().map(preset => preset.category));
        return Array.from(categories);
    }

    exportUserPresets() {
        return JSON.stringify(this.userPresets, null, 2);
    }

    importUserPresets(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (!Array.isArray(imported)) {
                throw new Error('Invalid format: expected array');
            }

            const nextUserPresets = [...this.userPresets];
            let importCount = 0;

            imported.forEach(preset => {
                nextUserPresets.push({
                    ...preset,
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                    importedAt: new Date().toISOString()
                });
                importCount++;
            });

            this.saveUserPresets(nextUserPresets);
            return importCount;
        } catch (error) {
            console.error('Error importing user presets:', error);
            throw new Error('导入失败：' + error.message);
        }
    }

    clearAllUserPresets() {
        this.saveUserPresets([]);
    }

    getStorageInfo() {
        try {
            const userData = localStorage.getItem(this.userStorageKey);
            const overrideData = localStorage.getItem(this.builtinOverrideStorageKey);
            const hiddenData = localStorage.getItem(this.hiddenBuiltinStorageKey);
            const sizeInBytes = new Blob([
                userData || '',
                overrideData || '',
                hiddenData || ''
            ]).size;

            return {
                count: this.getAllPresets().length,
                sizeInBytes,
                sizeInKB: (sizeInBytes / 1024).toFixed(2),
                maxSize: '5-10MB',
                available: true
            };
        } catch (error) {
            return {
                count: this.getAllPresets().length,
                sizeInBytes: 0,
                sizeInKB: '0',
                maxSize: 'Unknown',
                available: false
            };
        }
    }
}
