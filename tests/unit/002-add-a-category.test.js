const { test } = require('node:test');
const assert = require('node:assert/strict');
const Budget = require('../../app/domain.js');

test('parseAmount turns whole euros into cents', () => {
  assert.equal(Budget.parseAmount('300'), 30000);
  assert.equal(Budget.parseAmount('0'), 0);
});

test('parseAmount accepts "." and "," as decimal separator', () => {
  assert.equal(Budget.parseAmount('120.50'), 12050);
  assert.equal(Budget.parseAmount('12,5'), 1250);
  assert.equal(Budget.parseAmount('12.3'), 1230);
  assert.equal(Budget.parseAmount('0,05'), 5);
});

test('parseAmount is string-based and exact (no float artefacts)', () => {
  assert.equal(Budget.parseAmount('12.29'), 1229);
  assert.equal(Budget.parseAmount('0.29'), 29);
  assert.equal(Budget.parseAmount('1.15'), 115);
  assert.equal(Budget.parseAmount('  42.10 '), 4210);
});

test('parseAmount keeps a leading minus sign', () => {
  assert.equal(Budget.parseAmount('-10'), -1000);
});

test('parseAmount returns null for input that is not an amount', () => {
  for (const s of ['', '   ', 'abc', '12.345', '1,234.56', '1.2.3', '.', '12.', null, undefined]) {
    assert.equal(Budget.parseAmount(s), null, String(s));
  }
});

test('formatEuro prefixes the euro sign and keeps the sign in front', () => {
  assert.equal(Budget.formatEuro(30000), '€300.00');
  assert.equal(Budget.formatEuro(123456), '€1,234.56');
  assert.equal(Budget.formatEuro(-2000), '-€20.00');
  assert.equal(Budget.formatEuro(0), '€0.00');
});

test('addCategory appends a category with trimmed name, cents and a stable id', () => {
  const one = Budget.addCategory([], '  Groceries ', 30000);
  assert.equal(one.length, 1);
  assert.equal(one[0].name, 'Groceries');
  assert.equal(one[0].budgeted, 30000);
  assert.equal(typeof one[0].id, 'string');

  const two = Budget.addCategory(one, 'Eating out', 12050);
  assert.deepEqual(two.map((c) => c.name), ['Groceries', 'Eating out']);
  assert.equal(two[0].id, one[0].id);
  assert.notEqual(two[1].id, two[0].id);
});

test('addCategory does not mutate the given list', () => {
  const list = Object.freeze([]);
  const next = Budget.addCategory(list, 'Transport', 0);
  assert.equal(list.length, 0);
  assert.equal(next.length, 1);
});

test('addCategory ids stay unique even after gaps', () => {
  const list = [{ id: 'c1', name: 'A', budgeted: 0 }, { id: 'c5', name: 'B', budgeted: 0 }];
  const next = Budget.addCategory(list, 'C', 0);
  assert.equal(new Set(next.map((c) => c.id)).size, 3);
});
