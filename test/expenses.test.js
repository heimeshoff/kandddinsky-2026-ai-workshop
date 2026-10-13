import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createExpenseStore } from '../src/expenses.js';

const memory = () => { const m = new Map(); return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, v) }; };
const today = new Date(2026, 9, 13);
const mk = (st = memory()) => createExpenseStore(st, today);

test('date prefilled with today', () => assert.equal(mk().defaultDate(), '2026-10-13'));
test('records with amount, category, date, note', () => {
  const s = mk();
  assert.deepEqual(s.add({ amount: '54.20', category: 'Food', date: '2026-10-05', note: 'groceries' }), { ok: true });
  assert.deepEqual(s.list('2026-10'), [{ cents: 5420, category: 'Food', date: '2026-10-05', note: 'groceries' }]);
});
test('comma decimal works', () => {
  const s = mk();
  s.add({ amount: '54,20', category: 'Food', date: '2026-10-05' });
  assert.equal(s.list('2026-10')[0].cents, 5420);
});
test('no note is recorded without note', () => {
  const s = mk();
  s.add({ amount: '5', category: 'Food', date: '2026-10-05', note: '  ' });
  assert.equal('note' in s.list('2026-10')[0], false);
});
test('spent sums the month', () => {
  const s = mk();
  s.add({ amount: '54.20', category: 'Food', date: '2026-10-05' });
  s.add({ amount: '800', category: 'Rent', date: '2026-10-01' });
  assert.equal(s.spentCents('2026-10'), 85420);
});
test('expense belongs to the month of its date', () => {
  const s = mk();
  s.add({ amount: '10', category: 'Food', date: '2026-09-30' });
  assert.deepEqual(s.list('2026-10'), []);
  assert.equal(s.spentCents('2026-10'), 0);
  assert.equal(s.list('2026-09').length, 1);
  assert.equal(s.spentCents('2026-09'), 1000);
});
test('no expenses: spent 0', () => assert.equal(mk().spentCents('2026-10'), 0));
test('newest date first', () => {
  const s = mk();
  s.add({ amount: '1', category: 'Food', date: '2026-10-02' });
  s.add({ amount: '2', category: 'Food', date: '2026-10-09' });
  assert.deepEqual(s.list('2026-10').map((e) => e.date), ['2026-10-09', '2026-10-02']);
});
test('survives reload', () => {
  const st = memory();
  mk(st).add({ amount: '5', category: 'Food', date: '2026-10-05' });
  assert.equal(mk(st).list('2026-10').length, 1);
});
test('corrupt storage falls back to empty', () => {
  const st = memory(); st.setItem('budget.expenses', '{oops');
  assert.deepEqual(mk(st).list('2026-10'), []);
});
