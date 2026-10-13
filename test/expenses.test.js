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
test('spent per category sums the month, zero for none', () => {
  const s = mk();
  s.add({ amount: '54.20', category: 'Food', date: '2026-10-05' });
  s.add({ amount: '30', category: 'Food', date: '2026-10-06' });
  s.add({ amount: '800', category: 'Rent', date: '2026-10-01' });
  s.add({ amount: '9', category: 'Insurance', date: '2026-09-30' });
  assert.deepEqual(s.spentByCategory('2026-10', ['Food', 'Rent', 'Insurance']),
    [{ name: 'Food', cents: 8420 }, { name: 'Rent', cents: 80000 }, { name: 'Insurance', cents: 0 }]);
  assert.equal(s.spentByCategory('2026-09', ['Food'])[0].cents, 0);
});

const bad = (input) => {
  const s = mk();
  const r = s.add(input);
  assert.equal(r.ok, false);
  assert.ok(r.error);
  assert.deepEqual(s.list('2026-10'), []);
  assert.equal(s.spentCents('2026-10'), 0);
};
const base = { amount: '5', category: 'Food', date: '2026-10-05' };
for (const amount of ['0', '-5', 'abc', '', '12.345', '0.00']) {
  test(`rejects amount "${amount}"`, () => bad({ ...base, amount }));
}
test('rejects missing category', () => bad({ ...base, category: '' }));
test('rejects missing date', () => bad({ ...base, date: '' }));
test('rejects invalid date', () => bad({ ...base, date: '2026-13-45' }));
test('future date allowed', () => assert.equal(mk().add({ ...base, date: '2030-01-01' }).ok, true));
test('rejected input leaves existing data unchanged', () => {
  const s = mk();
  s.add(base);
  s.add({ ...base, amount: '0' });
  assert.equal(s.list('2026-10').length, 1);
  assert.equal(s.spentCents('2026-10'), 500);
});
test('delete removes the chosen expense; spent updates', () => {
  const s = mk();
  s.add({ amount: '54.20', category: 'Food', date: '2026-10-05' });
  s.add({ amount: '800', category: 'Rent', date: '2026-10-01' });
  assert.deepEqual(s.remove('2026-10', 0), { ok: true });
  assert.deepEqual(s.list('2026-10').map((e) => e.cents), [80000]);
  assert.equal(s.spentCents('2026-10'), 80000);
});
test('delete one of two identical expenses leaves one', () => {
  const s = mk();
  for (let i = 0; i < 2; i++) s.add({ amount: '5', category: 'Food', date: '2026-10-05', note: 'x' });
  s.remove('2026-10', 1);
  assert.equal(s.list('2026-10').length, 1);
});
test('delete persists across reload', () => {
  const st = memory();
  mk(st).add({ amount: '5', category: 'Food', date: '2026-10-05' });
  mk(st).remove('2026-10', 0);
  assert.deepEqual(mk(st).list('2026-10'), []);
});
test('delete with unknown position changes nothing', () => {
  const s = mk();
  s.add({ amount: '5', category: 'Food', date: '2026-10-05' });
  assert.deepEqual(s.remove('2026-10', 3), { ok: false });
  assert.equal(s.list('2026-10').length, 1);
});

const food = (s, d, a) => s.add({ amount: a, category: 'Food', date: d });
test('average over past months, gaps count as 0', () => {
  const s = mk(); food(s, '2026-07-10', '300'); food(s, '2026-09-10', '330');
  assert.equal(s.averageByCategory(['Food'])[0].display, '210.00 €');
});
test('only current month data: average is dash', () => {
  const s = mk(); food(s, '2026-10-02', '50');
  assert.deepEqual(s.averageByCategory(['Food']).map((a) => a.display), ['–']);
});
test('current month does not change average', () => {
  const s = mk(); food(s, '2026-09-10', '330'); const before = s.averageByCategory(['Food'])[0].display;
  food(s, '2026-10-02', '999');
  assert.equal(s.averageByCategory(['Food'])[0].display, before);
});
test('category without past expenses averages 0.00', () => {
  const s = mk(); food(s, '2026-09-10', '330');
  assert.equal(s.averageByCategory(['Food', 'Rent'])[1].display, '0.00 €');
});
test('average rounds to 2 decimals for display', () => {
  const s = mk(); food(s, '2026-07-10', '100');
  assert.equal(s.averageByCategory(['Food'])[0].display, '33.33 €');
});
test('own income month starts the past months', () => {
  const st = memory(); st.setItem('budget.incomes', JSON.stringify({ '2026-08': 100 }));
  const s = mk(st); food(s, '2026-09-10', '60');
  assert.equal(s.averageByCategory(['Food'])[0].display, '30.00 €');
});
