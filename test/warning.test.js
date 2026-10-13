import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createExpenseStore } from '../src/expenses.js';
import { createBudgetStore } from '../src/budgets.js';
import { budgetWarning } from '../src/warning.js';

const memory = () => { const m = new Map(); return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, v) }; };
const today = new Date(2026, 9, 13);
const setup = () => {
  const e = createExpenseStore(memory(), today);
  const b = createBudgetStore(memory());
  return { e, b, w: (month, names = ['Food', 'Fun']) => budgetWarning(month, names, e, b) };
};
const add = (e, cat, amt, date) => e.add({ amount: amt, category: cat, date });

test('spent over lists spent line', () => {
  const { e, b, w } = setup();
  b.set('Food', '2026-10', '400'); add(e, 'Food', '420', '2026-10-02');
  assert.deepEqual(w('2026-10'), ['Food: spent 420.00 € of 400.00 €']);
});
test('projected over lists projected line', () => {
  const { e, b, w } = setup();
  b.set('Fun', '2026-10', '400'); add(e, 'Fun', '300', '2026-10-02'); add(e, 'Fun', '450', '2026-09-02');
  assert.deepEqual(w('2026-10'), ['Fun: projected 450.00 € of 400.00 €', 'Fun: year projected 1,800.00 € of 1,200.00 €']);
});
test('equal is not over', () => {
  const { e, b, w } = setup();
  b.set('Food', '2026-10', '400'); add(e, 'Food', '400', '2026-10-02');
  assert.deepEqual(w('2026-10'), []);
});
test('spent wins over projected, listed once', () => {
  const { e, b, w } = setup();
  b.set('Food', '2026-10', '400'); add(e, 'Food', '420', '2026-10-02'); add(e, 'Food', '900', '2026-09-02');
  assert.deepEqual(w('2026-10'), ['Food: spent 420.00 € of 400.00 €', 'Food: year projected 3,600.00 € of 1,200.00 €']);
});
test('no budget never listed', () => {
  const { e, w } = setup();
  add(e, 'Food', '9000', '2026-10-02');
  assert.deepEqual(w('2026-10'), []);
});
test('past month only spent lines', () => {
  const { e, b, w } = setup();
  b.set('Food', '2026-09', '400'); b.set('Fun', '2026-09', '400');
  add(e, 'Food', '420', '2026-09-02'); add(e, 'Fun', '300', '2026-09-02'); add(e, 'Fun', '900', '2026-08-02');
  assert.deepEqual(w('2026-09'), ['Food: spent 420.00 € of 400.00 €']);
});
test('future month nothing', () => {
  const { e, b, w } = setup();
  b.set('Food', '2026-10', '100'); add(e, 'Food', '420', '2026-10-02');
  assert.deepEqual(w('2026-11'), []);
});
test('uses carried-over budget and updates on change', () => {
  const { e, b, w } = setup();
  b.set('Food', '2026-09', '400'); add(e, 'Food', '420', '2026-10-02');
  assert.equal(w('2026-10')[0], 'Food: spent 420.00 € of 400.00 €');
  b.set('Food', '2026-10', '500');
  assert.deepEqual(w('2026-10'), []);
});

// Past Jan-Sep: 2700 (avg 300). Oct spent 250 -> rest 50. Year: 2950 + 50 + 300 x 2 = 3600 vs 400 x 3.
const yearSetup = () => {
  const { e, b, w } = setup();
  b.set('Food', '2026-10', '400');
  add(e, 'Food', '2700', '2026-01-05');
  add(e, 'Food', '250', '2026-10-02');
  return { e, b, w };
};
test('year line: spent + rest + average x remaining vs year budget', () => {
  const { w } = yearSetup();
  assert.deepEqual(w('2026-10'), ['Food: year projected 3,600.00 € of 1,200.00 €']);
});
test('year line not listed when within year budget', () => {
  const { b, w } = yearSetup();
  b.set('Food', '2026-10', '2000');
  assert.deepEqual(w('2026-10'), []);
});
test('december: projected = spent + rest, no remaining months', () => {
  const e = createExpenseStore(memory(), new Date(2026, 11, 5));
  const b = createBudgetStore(memory());
  b.set('Food', '2026-12', '100'); add(e, 'Food', '500', '2026-12-02');
  assert.deepEqual(budgetWarning('2026-12', ['Food'], e, b),
    ['Food: spent 500.00 € of 100.00 €', 'Food: year projected 500.00 € of 100.00 €']);
});
test('no budget in year: no year line', () => {
  const { e, w } = setup();
  add(e, 'Food', '9000', '2026-10-02');
  assert.deepEqual(w('2026-10'), []);
});
test('month and year line both listed; updates on change', () => {
  const { e, b, w } = yearSetup();
  add(e, 'Food', '200', '2026-10-03');
  assert.equal(w('2026-10').length, 2);
  b.set('Food', '2026-10', '100000');
  assert.deepEqual(w('2026-10'), []);
});
test('year line only for current month', () => {
  const { w } = yearSetup();
  assert.deepEqual(w('2026-11'), []);
  assert.deepEqual(w('2026-09'), []);
});
