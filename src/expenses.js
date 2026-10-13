import { parseAmount, formatEur } from './money.js';

const KEY = 'budget.expenses';
const INCOME_KEY = 'budget.incomes';

const pad = (n) => String(n).padStart(2, '0');
export const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const validDate = (d) => {
  if (typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const t = new Date(`${d}T00:00:00Z`);
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === d;
};

// Expenses persisted in the given storage; each belongs to the month of its date.
export function createExpenseStore(storage, today = new Date()) {
  const load = () => {
    try {
      const v = JSON.parse(storage.getItem(KEY));
      return Array.isArray(v) ? v : [];
    } catch { return []; }
  };
  const inMonth = (month) => load().filter((e) => e.date.slice(0, 7) === month);
  const sortedEntries = (month) => load()
    .map((e, i) => [e, i])
    .filter(([e]) => e.date.slice(0, 7) === month)
    .sort(([a, i], [b, j]) => (a.date < b.date ? 1 : a.date > b.date ? -1 : i - j));
  const build = ({ amount, category, date, note }) => {
    const cents = parseAmount(amount);
    if (cents === null || cents === 0) return { ok: false, error: 'Enter an amount above 0 with at most 2 decimals.' };
    if (typeof category !== 'string' || category.trim() === '') return { ok: false, error: 'Choose a category.' };
    if (!validDate(date)) return { ok: false, error: 'Enter a date.' };
    const clean = String(note ?? '').trim();
    const expense = { cents, category, date };
    if (clean !== '') expense.note = clean;
    return { ok: true, expense };
  };
  return {
    defaultDate: () => isoDate(today),
    add(fields) {
      const r = build(fields);
      if (!r.ok) return r;
      storage.setItem(KEY, JSON.stringify([...load(), r.expense]));
      return { ok: true };
    },
    // Replaces exactly one expense: the one at `position` in list(month). Invalid input leaves it unchanged.
    update(month, position, fields) {
      const hit = sortedEntries(month)[position];
      if (!hit) return { ok: false, error: 'Expense not found.' };
      const r = build(fields);
      if (!r.ok) return r;
      const all = load();
      all[hit[1]] = r.expense;
      storage.setItem(KEY, JSON.stringify(all));
      return { ok: true };
    },
    // Newest date first; same date keeps entry order.
    list: (month) => sortedEntries(month).map(([e]) => e),
    // Removes exactly one expense: the one at `position` in list(month).
    remove(month, position) {
      const hit = sortedEntries(month)[position];
      if (!hit) return { ok: false };
      const all = load();
      all.splice(hit[1], 1);
      storage.setItem(KEY, JSON.stringify(all));
      return { ok: true };
    },
    countByCategory: (name) => load().filter((e) => e.category === name).length,
    // Deletes all expenses of the category, in every month.
    removeByCategory(name) {
      storage.setItem(KEY, JSON.stringify(load().filter((e) => e.category !== name)));
      return { ok: true };
    },
    // Spent per given category name in the month; categories without expenses get 0.
    spentByCategory: (month, names) => names.map((name) => ({
      name,
      cents: inMonth(month).filter((e) => e.category === name).reduce((s, e) => s + e.cents, 0),
    })),
    // Average spent per category over past months (before today's month), relative to today.
    // First past month = earliest month with an expense or own income. No past month: display "–".
    averageByCategory(names) {
      const current = isoDate(today).slice(0, 7);
      let incomes = {};
      try { incomes = JSON.parse(storage.getItem(INCOME_KEY)) ?? {}; } catch { /* none */ }
      const all = load();
      const first = [...all.map((e) => e.date.slice(0, 7)), ...Object.keys(incomes)].sort()[0];
      const count = first === undefined || first >= current ? 0
        : (Number(current.slice(0, 4)) - Number(first.slice(0, 4))) * 12 + Number(current.slice(5)) - Number(first.slice(5));
      return names.map((name) => {
        if (count === 0) return { name, cents: null, display: '–' };
        const total = all.filter((e) => e.category === name && e.date.slice(0, 7) < current && e.date.slice(0, 7) >= first)
          .reduce((s, e) => s + e.cents, 0);
        const cents = total / count;
        return { name, cents, display: formatEur(Math.round(cents)) };
      });
    },
    // Current month: projected balance = income - spent - expected rest. Past month: left = income - spent.
    // Future month: "–". Expected rest per category = max(0, average - spent this month).
    balance(month, names, incomeCents) {
      const current = isoDate(today).slice(0, 7);
      if (month > current) return { kind: 'none', cents: null, display: '–' };
      const spent = this.spentCents(month);
      let rest = 0;
      if (month === current) {
        const avg = this.averageByCategory(names);
        const by = this.spentByCategory(month, names);
        rest = names.reduce((s, _, i) => s + (avg[i].cents === null ? 0 : Math.max(0, avg[i].cents - by[i].cents)), 0);
      }
      const cents = Math.round(incomeCents - spent - rest);
      const display = (cents < 0 ? '-' : '') + formatEur(Math.abs(cents));
      return { kind: month === current ? 'projected' : 'left', cents, display, ...(cents < 0 && { negative: true }) };
    },
    spentCents: (month) => inMonth(month).reduce((s, e) => s + e.cents, 0),
  };
}
