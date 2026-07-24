import test from 'node:test';
import assert from 'node:assert/strict';

// Minimal localStorage polyfill so PresetManager can run under node.
class FakeStorage {
    constructor() { this.map = new Map(); }
    getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
    setItem(k, v) { this.map.set(k, String(v)); }
    removeItem(k) { this.map.delete(k); }
}

global.localStorage = new FakeStorage();

const { PresetManager } = await import('../src/preset-manager.js');

test('saveLastConfig / loadLastConfig round-trips the working config', () => {
    const manager = new PresetManager();
    assert.equal(manager.loadLastConfig(), null);

    const payload = {
        config: {
            title: '今晚吃什么',
            theme: 'sunset',
            items: [
                { id: 'a', label: '火锅', weight: 2 },
                { id: 'b', label: '烧烤', weight: 1 }
            ]
        },
        presetId: 'dinner'
    };

    manager.saveLastConfig(payload);
    assert.deepEqual(manager.loadLastConfig(), payload);
});

test('clearLastConfig removes the saved config', () => {
    const manager = new PresetManager();
    manager.saveLastConfig({ config: { title: 'x', theme: 'forest', items: [] }, presetId: null });
    assert.notEqual(manager.loadLastConfig(), null);

    manager.clearLastConfig();
    assert.equal(manager.loadLastConfig(), null);
});

test('saveLastConfig never throws even when storage fails', () => {
    const manager = new PresetManager();
    const original = global.localStorage.setItem;
    global.localStorage.setItem = () => { throw new Error('quota exceeded'); };

    assert.doesNotThrow(() => manager.saveLastConfig({ config: {}, presetId: null }));

    global.localStorage.setItem = original;
});
