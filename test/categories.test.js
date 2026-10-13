import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCategoryStore } from '../src/categories.js';

const memory = () => { const m = new Map(); return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, v) }; };

test('no categories at start', () => assert.deepEqual(createCategoryStore(memory()).list(), []));
test('add Food, then Rent', () => {
  const s = createCategoryStore(memory());
  assert.deepEqual(s.add('Food'), { ok: true });
  assert.deepEqual(s.list(), ['Food']);
  s.add('Rent');
  assert.deepEqual(s.list(), ['Food', 'Rent']);
});
test('empty or whitespace is rejected', () => {
  const s = createCategoryStore(memory());
  for (const bad of ['', '   ', undefined]) {
    const r = s.add(bad);
    assert.equal(r.ok, false);
    assert.ok(r.error);
  }
  assert.deepEqual(s.list(), []);
});
test('duplicates are rejected, case-insensitive and trimmed', () => {
  const s = createCategoryStore(memory());
  s.add('Food');
  for (const dup of ['food', ' Food ', 'FOOD']) {
    const r = s.add(dup);
    assert.equal(r.ok, false);
    assert.ok(r.error);
  }
  assert.deepEqual(s.list(), ['Food']);
});
test('name is trimmed', () => {
  const s = createCategoryStore(memory());
  s.add('  Rent  ');
  assert.deepEqual(s.list(), ['Rent']);
});
test('survives reload', () => {
  const st = memory();
  createCategoryStore(st).add('Food');
  assert.deepEqual(createCategoryStore(st).list(), ['Food']);
});
test('corrupt storage falls back to empty', () => {
  const st = memory(); st.setItem('budget.categories', '{oops');
  assert.deepEqual(createCategoryStore(st).list(), []);
});
