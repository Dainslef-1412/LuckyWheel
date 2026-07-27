import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getTotalWeight,
    normalizeAngle,
    weightedRandom,
    generateId,
    truncateText,
    calculatePointOnCircle
} from '../src/utils.js';

test('getTotalWeight sums weights and tolerates missing ones', () => {
    assert.equal(getTotalWeight([{ weight: 1 }, { weight: 3 }]), 4);
    assert.equal(getTotalWeight([{ weight: 2 }, {}]), 2);
    assert.equal(getTotalWeight([]), 0);
});

test('normalizeAngle folds any angle into [0, 360)', () => {
    assert.equal(normalizeAngle(0), 0);
    assert.equal(normalizeAngle(360), 0);
    assert.equal(normalizeAngle(450), 90);
    assert.equal(normalizeAngle(-90), 270);
    assert.equal(normalizeAngle(-4000), normalizeAngle(-4000 + 360 * 12));
});

test('weightedRandom always returns one of the given items', () => {
    const items = [{ id: 'a', weight: 1 }, { id: 'b', weight: 5 }];
    for (let i = 0; i < 500; i++) {
        assert.ok(items.includes(weightedRandom(items)));
    }
});

test('weightedRandom respects the weight ratio', () => {
    // 1:3 split, so 'b' should win roughly three quarters of the time.
    const items = [{ id: 'a', weight: 1 }, { id: 'b', weight: 3 }];
    const runs = 20000;
    let b = 0;

    for (let i = 0; i < runs; i++) {
        if (weightedRandom(items).id === 'b') b++;
    }

    const share = b / runs;
    assert.ok(share > 0.72 && share < 0.78, `expected ~0.75, got ${share.toFixed(3)}`);
});

test('weightedRandom never returns a zero-weight item', () => {
    const items = [{ id: 'zero', weight: 0 }, { id: 'one', weight: 1 }];
    for (let i = 0; i < 500; i++) {
        assert.equal(weightedRandom(items).id, 'one');
    }
});

test('generateId produces distinct ids', () => {
    const ids = new Set(Array.from({ length: 1000 }, generateId));
    assert.equal(ids.size, 1000);
});

test('truncateText only shortens text past the limit', () => {
    assert.equal(truncateText('短', 5), '短');
    assert.equal(truncateText('12345', 5), '12345');
    assert.equal(truncateText('1234567890', 5), '12...');
    assert.equal(truncateText('1234567890', 5).length, 5);
});

test('calculatePointOnCircle puts zero degrees at the top and runs clockwise', () => {
    const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

    const top = calculatePointOnCircle(250, 250, 200, 0);
    near(top.x, 250);
    near(top.y, 50);

    const right = calculatePointOnCircle(250, 250, 200, 90);
    near(right.x, 450);
    near(right.y, 250);
});
