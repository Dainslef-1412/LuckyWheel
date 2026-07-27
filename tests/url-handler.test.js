import test from 'node:test';
import assert from 'node:assert/strict';

import { encodeConfigToURL, decodeConfigFromSearch } from '../src/url-handler.js';

const config = {
    title: '今晚吃什么',
    theme: 'forest',
    items: [
        { id: 'a', label: '火锅', weight: 3 },
        { id: 'b', label: '烧烤', weight: 2 },
        { id: 'c', label: '日料', weight: 1 }
    ]
};

test('a shared config survives the encode/decode round trip', () => {
    assert.deepEqual(decodeConfigFromSearch(encodeConfigToURL(config)), config);
});

test('round trip preserves labels with characters that need escaping', () => {
    const tricky = {
        title: 'a&b <c> "d" \'e\' 中文 🎉',
        theme: 'ocean',
        items: [
            { id: 'x', label: '<img src=x onerror=alert(1)>', weight: 1 },
            { id: 'y', label: '100% / 50+50', weight: 1 }
        ]
    };

    assert.deepEqual(decodeConfigFromSearch(encodeConfigToURL(tricky)), tricky);
});

test('encoded parameter survives being parsed out of a full URL', () => {
    const url = new URL('https://example.com/' + encodeConfigToURL(config));

    assert.deepEqual(decodeConfigFromSearch(url.search), config);
});

test('decoding returns null instead of throwing on missing or broken input', () => {
    assert.equal(decodeConfigFromSearch(''), null);
    assert.equal(decodeConfigFromSearch('?other=1'), null);
    assert.equal(decodeConfigFromSearch('?config='), null);
    assert.equal(decodeConfigFromSearch('?config=not-base64!!'), null);
    assert.equal(decodeConfigFromSearch('?config=' + btoa('not json')), null);
});
