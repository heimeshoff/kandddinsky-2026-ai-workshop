import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createIncomeStore, monthOf } from '../src/income.js';

const memory = () => { const m = new Map(); return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, v) }; };
const today = new Date(2026, 9, 13);

test('monthOf', () => assert.equal(monthOf(today), '2026-10'));

test('no income ever entered shows 0.00 €', () => {
  assert.equal(createIncomeStore(memory(), today).display(), '0.00 €');
});
test('entering 2500 shows 2,500.00 €', () => {
  const s = createIncomeStore(memory(), today);
  assert.deepEqual(s.set('2500'), { ok: true });
  assert.equal(s.display(), '2,500.00 €');
});
test('survives reload', () => {
  const st = memory();
  createIncomeStore(st, today).set('2500');
  assert.equal(createIncomeStore(st, today).display(), '2,500.00 €');
});
test('invalid input errors and keeps income', () => {
  const st = memory();
  const s = createIncomeStore(st, today);
  s.set('2500');
  for (const bad of ['-10', 'abc', '', '1.234']) {
    const r = s.set(bad);
    assert.equal(r.ok, false);
    assert.ok(r.error);
    assert.equal(s.display(), '2,500.00 €');
  }
  assert.equal(createIncomeStore(st, today).display(), '2,500.00 €');
});
test('entering 0 shows 0.00 €', () => {
  const s = createIncomeStore(memory(), today);
  s.set('2500'); s.set('0');
  assert.equal(s.display(), '0.00 €');
});
test('corrupt storage falls back to 0', () => {
  const st = memory(); st.setItem('budget.incomes', '{oops');
  assert.equal(createIncomeStore(st, today).display(), '0.00 €');
});
