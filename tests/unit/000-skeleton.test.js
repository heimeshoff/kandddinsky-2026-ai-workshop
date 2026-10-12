const { test } = require('node:test');
const assert = require('node:assert/strict');
const Budget = require('../../app/domain.js');

test('formatCents formats integer cents with thousands separator', () => {
  assert.equal(Budget.formatCents(123456), '1,234.56');
  assert.equal(Budget.formatCents(5), '0.05');
  assert.equal(Budget.formatCents(0), '0.00');
});

test('formatCents keeps the sign of negative amounts', () => {
  assert.equal(Budget.formatCents(-1999), '-19.99');
});

test('formatCents rejects non-integer input', () => {
  assert.throws(() => Budget.formatCents(1.5), TypeError);
});
