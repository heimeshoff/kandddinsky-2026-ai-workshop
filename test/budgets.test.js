import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBudgetStore } from '../src/budgets.js';

const memory = () => { const m = new Map(); return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, v) }; };

test('no budgets: no budget', () => assert.equal(createBudgetStore(memory()).cents('Food', '2026-10'), null));
test('set in October shows in October', () => {
  const s = createBudgetStore(memory());
  assert.deepEqual(s.set('Food', '2026-10', '400'), { ok: true });
  assert.equal(s.cents('Food', '2026-10'), 40000);
  assert.equal(s.display('Food', '2026-10'), '400.00 €');
});
test('carries over forward, never backwards', () => {
  const s = createBudgetStore(memory());
  s.set('Food', '2026-10', '400');
  assert.equal(s.cents('Food', '2026-11'), 40000);
  assert.equal(s.cents('Food', '2026-12'), 40000);
  assert.equal(s.cents('Food', '2027-03'), 40000);
  assert.equal(s.cents('Food', '2026-09'), null);
  assert.equal(s.display('Food', '2026-09'), 'no budget');
  assert.equal(s.cents('Rent', '2026-10'), null);
});
test('new setting in December overrides from then on', () => {
  const s = createBudgetStore(memory());
  s.set('Food', '2026-10', '400');
  s.set('Food', '2026-12', '350');
  assert.deepEqual([s.cents('Food', '2026-10'), s.cents('Food', '2026-11'), s.cents('Food', '2026-12'), s.cents('Food', '2027-01')],
    [40000, 40000, 35000, 35000]);
});
test('removal in December ends budget from then on', () => {
  const s = createBudgetStore(memory());
  s.set('Food', '2026-10', '400');
  assert.deepEqual(s.remove('Food', '2026-12'), { ok: true });
  assert.deepEqual([s.cents('Food', '2026-11'), s.cents('Food', '2026-12'), s.cents('Food', '2027-05')], [40000, null, null]);
  s.set('Food', '2027-02', '100');
  assert.equal(s.cents('Food', '2027-03'), 10000);
});
test('invalid amounts rejected, budget unchanged', () => {
  const s = createBudgetStore(memory());
  s.set('Food', '2026-10', '400');
  for (const bad of ['0', '0.00', '-5', '1.234', 'abc', '']) {
    const r = s.set('Food', '2026-11', bad);
    assert.equal(r.ok, false);
    assert.ok(r.error);
  }
  assert.equal(s.cents('Food', '2026-11'), 40000);
});
test('survives reload, incl. removal', () => {
  const st = memory();
  const s = createBudgetStore(st);
  s.set('Food', '2026-10', '400'); s.remove('Food', '2026-12');
  const t = createBudgetStore(st);
  assert.deepEqual([t.cents('Food', '2026-09'), t.cents('Food', '2026-11'), t.cents('Food', '2026-12')], [null, 40000, null]);
});
test('rename keeps budgets, delete removes them', () => {
  const s = createBudgetStore(memory());
  s.set('Food', '2026-10', '400');
  s.rename('Food', 'Groceries');
  assert.equal(s.cents('Groceries', '2026-11'), 40000);
  assert.equal(s.cents('Food', '2026-11'), null);
  s.removeCategory('Groceries');
  assert.equal(s.cents('Groceries', '2026-11'), null);
});
test('corrupt storage falls back to no budget', () => {
  const st = memory(); st.setItem('budget.budgets', '{oops');
  assert.equal(createBudgetStore(st).cents('Food', '2026-10'), null);
});
