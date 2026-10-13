import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAmount, formatEur } from '../src/money.js';

test('parses plain, dot and comma amounts to cents', () => {
  assert.equal(parseAmount('2500'), 250000);
  assert.equal(parseAmount('2500.5'), 250050);
  assert.equal(parseAmount('2500,50'), 250050);
  assert.equal(parseAmount(' 0 '), 0);
});
test('rejects negative, text, empty, >2 decimals', () => {
  for (const s of ['-10', 'abc', '', '  ', '1.234', '1,234', '1e3', '.5', '5.', null, undefined])
    assert.equal(parseAmount(s), null, String(s));
});
test('formats cents', () => {
  assert.equal(formatEur(0), '0.00 €');
  assert.equal(formatEur(250000), '2,500.00 €');
  assert.equal(formatEur(123456789), '1,234,567.89 €');
  assert.equal(formatEur(5), '0.05 €');
});
