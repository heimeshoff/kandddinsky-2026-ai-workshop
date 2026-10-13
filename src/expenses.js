import { parseAmount } from './money.js';

const KEY = 'budget.expenses';

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
  return {
    defaultDate: () => isoDate(today),
    add({ amount, category, date, note }) {
      const cents = parseAmount(amount);
      if (cents === null || cents === 0) return { ok: false, error: 'Enter an amount above 0 with at most 2 decimals.' };
      if (typeof category !== 'string' || category.trim() === '') return { ok: false, error: 'Choose a category.' };
      if (!validDate(date)) return { ok: false, error: 'Enter a date.' };
      const clean = String(note ?? '').trim();
      const expense = { cents, category, date };
      if (clean !== '') expense.note = clean;
      storage.setItem(KEY, JSON.stringify([...load(), expense]));
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
    // Spent per given category name in the month; categories without expenses get 0.
    spentByCategory: (month, names) => names.map((name) => ({
      name,
      cents: inMonth(month).filter((e) => e.category === name).reduce((s, e) => s + e.cents, 0),
    })),
    spentCents: (month) => inMonth(month).reduce((s, e) => s + e.cents, 0),
  };
}
