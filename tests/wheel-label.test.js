import test from 'node:test';
import assert from 'node:assert/strict';
import { getLabelRotation } from '../src/wheel.js';

test('labels on the upper half keep their angle', () => {
    assert.equal(getLabelRotation(0), 0);
    assert.equal(getLabelRotation(45), 45);
    assert.equal(getLabelRotation(90), 90);
    assert.equal(getLabelRotation(300), 300);
    assert.equal(getLabelRotation(315), 315);
});

test('labels on the lower half are flipped 180 degrees to stay upright', () => {
    assert.equal(getLabelRotation(120), 300);
    assert.equal(getLabelRotation(180), 0);
    assert.equal(getLabelRotation(200), 20);
});

test('rotation is normalized for out-of-range angles', () => {
    assert.equal(getLabelRotation(360), 0);
    assert.equal(getLabelRotation(-45), 315);
    assert.equal(getLabelRotation(450), 90);
});
