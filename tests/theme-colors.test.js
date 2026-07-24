import test from 'node:test';
import assert from 'node:assert/strict';
import { getContrastText, assignColors } from '../src/themes.js';

test('getContrastText picks white on dark fills, dark ink on light fills', () => {
    assert.equal(getContrastText('#1f6f43'), '#ffffff'); // deep green
    assert.equal(getContrastText('#023e8a'), '#ffffff'); // deep blue
    assert.equal(getContrastText('#f9c74f'), '#2d241b'); // light gold
    assert.equal(getContrastText('#a7d06a'), '#2d241b'); // light green
    assert.equal(getContrastText('#ffffff'), '#2d241b'); // white
    assert.equal(getContrastText('#000000'), '#ffffff'); // black
});

test('getContrastText tolerates shorthand and missing hash', () => {
    assert.equal(getContrastText('fff'), '#2d241b');
    assert.equal(getContrastText('#000'), '#ffffff');
});

test('assignColors never repeats a color on adjacent sectors', () => {
    for (const count of [2, 3, 5, 6, 7, 8, 12, 13, 19, 20]) {
        const items = Array.from({ length: count }, (_, i) => ({ id: String(i), label: `x${i}`, weight: 1 }));
        const colored = assignColors(items, 'sunset');

        for (let i = 1; i < colored.length; i++) {
            assert.notEqual(colored[i].color, colored[i - 1].color, `adjacent clash at ${count} items, index ${i}`);
        }
        // Seam: last sector is adjacent to the first
        if (count > 2) {
            assert.notEqual(colored[count - 1].color, colored[0].color, `seam clash at ${count} items`);
        }
    }
});
