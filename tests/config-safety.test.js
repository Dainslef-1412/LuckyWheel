import assert from 'node:assert/strict';
import { decodeConfigFromURL, generateShareURL, normalizeSharedConfig } from '../src/url-handler.js';

function encodePayload(payload) {
    return btoa(encodeURIComponent(JSON.stringify(payload)));
}

function withSearch(search, testFn) {
    const previousWindow = globalThis.window;
    globalThis.window = { location: { search } };

    try {
        return testFn();
    } finally {
        globalThis.window = previousWindow;
    }
}

const maliciousLabel = '"><img src=x onerror=alert(1)>';

const normalized = normalizeSharedConfig({
    title: '<script>alert(1)</script>'.repeat(10),
    theme: 'invalid-theme',
    items: [
        { label: maliciousLabel, weight: '100000' },
        { label: '', weight: '-5' },
        ...Array.from({ length: 30 }, (_, index) => ({ label: `extra ${index}`, weight: 1 }))
    ]
});

assert.equal(normalized.title.length, 80);
assert.equal(normalized.theme, 'forest');
assert.equal(normalized.items.length, 20);
assert.equal(normalized.items[0].label, maliciousLabel);
assert.equal(normalized.items[0].weight, 999);
assert.equal(normalized.items[1].label, '选项2');
assert.equal(normalized.items[1].weight, 1);

assert.equal(normalizeSharedConfig(null), null);
assert.equal(normalizeSharedConfig({ items: [{ label: 'only one', weight: 1 }] }), null);
assert.equal(normalizeSharedConfig({ items: 'not-array' }), null);

const decoded = withSearch(`?config=${encodePayload({
    title: '共享转盘',
    theme: 'berry',
    items: [
        { label: maliciousLabel, weight: 2 },
        { label: '安全文本', weight: 3 }
    ]
})}`, () => decodeConfigFromURL());

assert.deepEqual(decoded, {
    title: '共享转盘',
    theme: 'berry',
    items: [
        { label: maliciousLabel, weight: 2 },
        { label: '安全文本', weight: 3 }
    ]
});

const envelopeDecoded = withSearch(`?config=${encodePayload({
    version: 1,
    config: {
        title: '新版分享',
        theme: 'fresh',
        items: [
            { id: '\"><img src=x>', label: null, weight: 0 },
            { label: 'B', weight: 'abc' }
        ]
    }
})}`, () => decodeConfigFromURL());

assert.deepEqual(envelopeDecoded, {
    title: '新版分享',
    theme: 'fresh',
    items: [
        { label: '选项1', weight: 1 },
        { label: 'B', weight: 1 }
    ]
});

const generatedUrl = (() => {
    const previousWindow = globalThis.window;
    globalThis.window = {
        location: {
            origin: 'https://example.com',
            pathname: '/wheel'
        }
    };

    try {
        return generateShareURL({
            title: '~',
            theme: 'forest',
            items: [
                { label: 'A', weight: 1 },
                { label: 'B', weight: 1 }
            ]
        });
    } finally {
        globalThis.window = previousWindow;
    }
})();

assert.match(generatedUrl, /^https:\/\/example\.com\/wheel\?config=/);
const generatedConfig = new URL(generatedUrl).searchParams.get('config');
assert.ok(generatedConfig);
assert.deepEqual(withSearch(`?config=${generatedConfig}`, () => decodeConfigFromURL()), {
    title: '~',
    theme: 'forest',
    items: [
        { label: 'A', weight: 1 },
        { label: 'B', weight: 1 }
    ]
});

assert.equal(withSearch('?config=not-valid-base64', () => decodeConfigFromURL()), null);
assert.equal(withSearch(`?config=${'a'.repeat(12001)}`, () => decodeConfigFromURL()), null);

console.log('Config safety tests passed');
