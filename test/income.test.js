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

test('opens on current month label', () =>
  assert.equal(createIncomeStore(memory(), today).label(), 'October 2026'));
test('previous / next month', () => {
  const s = createIncomeStore(memory(), today);
  s.previous(); assert.equal(s.label(), 'September 2026');
  s.next(); s.next(); assert.equal(s.label(), 'November 2026');
});
test('year wraps both ways', () => {
  const s = createIncomeStore(memory(), new Date(2026, 11, 5));
  assert.equal(s.label(), 'December 2026');
  s.next(); assert.equal(s.label(), 'January 2027');
  s.previous(); s.previous(); s.previous(); s.previous(); s.previous(); s.previous(); s.previous(); s.previous(); s.previous(); s.previous(); s.previous(); s.previous();
  assert.equal(s.label(), 'January 2026');
  s.previous(); assert.equal(s.label(), 'December 2025');
});
test('each month has its own income', () => {
  const st = memory();
  const s = createIncomeStore(st, today);
  s.set('2500'); s.previous(); s.set('2000');
  assert.equal(s.display(), '2,000.00 €');
  s.next(); assert.equal(s.display(), '2,500.00 €');
  s.next(); assert.equal(s.display(), '2,500.00 €');
});
test('reload shows current month again', () => {
  const st = memory();
  const s = createIncomeStore(st, today);
  s.previous(); s.set('2000');
  const r = createIncomeStore(st, today);
  assert.equal(r.label(), 'October 2026');
  r.previous(); assert.equal(r.display(), '2,000.00 €');
});

const sep = () => { const st = memory(); const s = createIncomeStore(st, new Date(2026, 8, 1)); s.set('2500'); return { st, s }; };
test('carries over to October and November', () => {
  const { s } = sep();
  s.next(); assert.equal(s.display(), '2,500.00 €');
  s.next(); assert.equal(s.display(), '2,500.00 €');
});
test('changing October leaves September, changes November', () => {
  const { s } = sep();
  s.next(); s.set('2700');
  s.previous(); assert.equal(s.display(), '2,500.00 €');
  s.next(); s.next(); assert.equal(s.display(), '2,700.00 €');
});
test('no carry-over backwards', () => {
  const s = createIncomeStore(memory(), new Date(2026, 9, 1));
  s.set('2500'); s.previous();
  assert.equal(s.display(), '0.00 €');
});
test('0 carries over', () => {
  const { s } = sep();
  s.next(); s.next(); s.set('0');
  assert.equal(s.display(), '0.00 €');
  s.next(); assert.equal(s.display(), '0.00 €');
});
test('carry-over survives reload', () => {
  const { st, s } = sep();
  s.next(); s.set('2700');
  const r = createIncomeStore(st, new Date(2026, 8, 1));
  assert.equal(r.display(), '2,500.00 €');
  r.next(); r.next(); assert.equal(r.display(), '2,700.00 €');
});
