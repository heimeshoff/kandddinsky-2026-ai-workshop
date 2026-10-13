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
  assert.deepEqual(w('2026-10'), ['Fun: projected 450.00 € of 400.00 €']);
});
test('equal is not over', () => {
  const { e, b, w } = setup();
  b.set('Food', '2026-10', '400'); add(e, 'Food', '400', '2026-10-02');
  assert.deepEqual(w('2026-10'), []);
});
test('spent wins over projected, listed once', () => {
  const { e, b, w } = setup();
  b.set('Food', '2026-10', '400'); add(e, 'Food', '420', '2026-10-02'); add(e, 'Food', '900', '2026-09-02');
  assert.deepEqual(w('2026-10'), ['Food: spent 420.00 € of 400.00 €']);
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
  assert.equal(w('2026-10').length, 1);
  b.set('Food', '2026-10', '500');
  assert.deepEqual(w('2026-10'), []);
});
