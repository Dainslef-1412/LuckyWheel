import test from 'node:test';
import assert from 'node:assert/strict';

import {
    calculateSectorAngles,
    calculateSpinRotation,
    generateSectorPath,
    centerTextFontSize
} from '../src/wheel.js';
import { normalizeAngle } from '../src/utils.js';

/**
 * Independent oracle: which sector sits under the pointer at a given rotation.
 * The pointer is at the top of the wheel, which is angle 0.
 */
function sectorUnderPointer(angles, rotation) {
    const offset = normalizeAngle(rotation);

    for (let i = 0; i < angles.length; i++) {
        const start = normalizeAngle(angles[i].start + offset);
        const end = normalizeAngle(angles[i].end + offset);

        if (start < end) {
            if (start <= 0 && 0 < end) return i;
        } else if (start <= 0 || 0 < end) {
            // Sector wraps past 360.
            return i;
        }
    }

    return -1;
}

test('calculateSectorAngles splits 360 degrees by weight', () => {
    const angles = calculateSectorAngles([{ weight: 1 }, { weight: 1 }, { weight: 2 }]);

    assert.deepEqual(angles.map(a => a.start), [0, 90, 180]);
    assert.deepEqual(angles.map(a => a.end), [90, 180, 360]);
    assert.deepEqual(angles.map(a => a.center), [45, 135, 270]);
});

test('calculateSectorAngles leaves no gaps and covers the full circle', () => {
    const items = Array.from({ length: 7 }, (_, i) => ({ weight: i + 1 }));
    const angles = calculateSectorAngles(items);

    assert.equal(angles[0].start, 0);
    assert.ok(Math.abs(angles.at(-1).end - 360) < 1e-9);

    for (let i = 1; i < angles.length; i++) {
        assert.equal(angles[i].start, angles[i - 1].end, `gap before sector ${i}`);
    }
});

test('calculateSpinRotation lands the winner under the pointer on the first spin', () => {
    const angles = calculateSectorAngles([{ weight: 1 }, { weight: 1 }, { weight: 2 }]);

    for (let i = 0; i < angles.length; i++) {
        const rotation = calculateSpinRotation(0, angles[i].center);
        assert.equal(sectorUnderPointer(angles, rotation), i);
    }
});

// Regression: the rotation used to be measured from zero rather than from the
// offset the wheel already carried, so every spin after the first stopped on a
// different sector than the announced winner.
test('calculateSpinRotation stays correct across consecutive spins', () => {
    const angles = calculateSectorAngles([{ weight: 1 }, { weight: 1 }, { weight: 2 }]);
    const picks = [2, 0, 1, 2, 2, 0];
    let rotation = 0;

    for (const winner of picks) {
        rotation = calculateSpinRotation(rotation, angles[winner].center);
        assert.equal(
            sectorUnderPointer(angles, rotation),
            winner,
            `spin for sector ${winner} landed elsewhere`
        );
    }
});

test('calculateSpinRotation holds for random wheels over many spins', () => {
    for (let trial = 0; trial < 200; trial++) {
        const count = 2 + Math.floor(Math.random() * 7);
        const items = Array.from({ length: count }, () => ({
            weight: 1 + Math.floor(Math.random() * 9)
        }));
        const angles = calculateSectorAngles(items);
        let rotation = 0;

        for (let spin = 0; spin < 12; spin++) {
            const winner = Math.floor(Math.random() * count);
            const next = calculateSpinRotation(rotation, angles[winner].center);

            assert.ok(next > rotation, 'wheel must not spin backwards');
            assert.equal(sectorUnderPointer(angles, next), winner);

            rotation = next;
        }
    }
});

test('calculateSpinRotation adds the requested number of full turns', () => {
    const rotation = calculateSpinRotation(0, 45, 3);

    assert.ok(rotation >= 360 * 3);
    assert.ok(rotation < 360 * 4);
});

test('generateSectorPath sets the large-arc flag only past 180 degrees', () => {
    const small = generateSectorPath(250, 250, 200, 0, 90);
    const large = generateSectorPath(250, 250, 200, 0, 270);

    assert.match(small, /A 200 200 0 0 1/);
    assert.match(large, /A 200 200 0 1 1/);
});

test('centerTextFontSize shrinks long labels and stays within bounds', () => {
    const short = centerTextFontSize('火锅');
    const long = centerTextFontSize('选项一二三四五六七八');

    assert.equal(short, 16);
    assert.ok(long < short);
    assert.ok(long >= 9);
    assert.equal(centerTextFontSize(''), 16);
});

test('centerTextFontSize treats latin text as narrower than CJK', () => {
    assert.ok(centerTextFontSize('abcdefgh') > centerTextFontSize('一二三四五六七八'));
});
