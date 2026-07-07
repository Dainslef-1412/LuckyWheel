import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSectorAngles } from '../src/wheel.js';
import { calculateTargetRotation } from '../src/spin.js';

const items = [
    { id: 'a', label: 'A', weight: 1 },
    { id: 'b', label: 'B', weight: 3 },
    { id: 'c', label: 'C', weight: 2 }
];

function normalizeRotation(rotation) {
    return ((rotation % 360) + 360) % 360;
}

function winnerCenter(item) {
    const angles = calculateSectorAngles(items);
    const index = items.findIndex(entry => entry.id === item.id);
    return angles[index].center;
}

function assertWinnerLandsAtPointer(winner, rotation) {
    const finalAngle = normalizeRotation(winnerCenter(winner) + rotation);
    assert.ok(
        finalAngle < 0.000001 || Math.abs(finalAngle - 360) < 0.000001,
        `expected ${winner.id} to land at pointer, got final angle ${finalAngle}`
    );
}

test('calculateTargetRotation aligns winners across repeated spins', () => {
    let rotation = 0;
    const winners = [items[0], items[1], items[2], items[0]];

    winners.forEach(winner => {
        const nextRotation = calculateTargetRotation(winner, items, 5, rotation);

        assert.ok(nextRotation > rotation);
        assertWinnerLandsAtPointer(winner, nextRotation);

        rotation = nextRotation;
    });
});

test('calculateTargetRotation can restart from a visually reset wheel', () => {
    const staleRotation = calculateTargetRotation(items[2], items, 5, 0);
    assertWinnerLandsAtPointer(items[2], staleRotation);

    const resetRotation = 0;
    const nextRotation = calculateTargetRotation(items[1], items, 5, resetRotation);

    assertWinnerLandsAtPointer(items[1], nextRotation);
});

test('calculateTargetRotation rejects winners outside the item list', () => {
    assert.throws(
        () => calculateTargetRotation({ id: 'missing', label: 'Missing', weight: 1 }, items, 5, 0),
        /Winner not found/
    );
});

test('calculateTargetRotation preserves the legacy third-argument spins API', () => {
    const rotation = calculateTargetRotation(items[0], items, 3);

    assert.equal(Math.floor(rotation / 360), 3);
    assertWinnerLandsAtPointer(items[0], rotation);
});
