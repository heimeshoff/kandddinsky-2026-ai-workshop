import { parseAmount } from './money.js';

const KEY = 'budget.expenses';

const pad = (n) => String(n).padStart(2, '0');
export const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Expenses persisted in the given storage; each belongs to the month of its date.
export function createExpenseStore(storage, today = new Date()) {
  const load = () => {
    try {
      const v = JSON.parse(storage.getItem(KEY));
      return Array.isArray(v) ? v : [];
    } catch { return []; }
  };
  const inMonth = (month) => load().filter((e) => e.date.slice(0, 7) === month);
  return {
    defaultDate: () => isoDate(today),
    add({ amount, category, date, note }) {
      const cents = parseAmount(amount);
      if (cents === null || cents === 0) return { ok: false, error: 'Enter an amount above 0 with at most 2 decimals.' };
      const clean = String(note ?? '').trim();
      const expense = { cents, category, date };
      if (clean !== '') expense.note = clean;
      storage.setItem(KEY, JSON.stringify([...load(), expense]));
      return { ok: true };
    },
    // Newest date first; same date keeps entry order.
    list: (month) => inMonth(month)
      .map((e, i) => [e, i])
      .sort(([a, i], [b, j]) => (a.date < b.date ? 1 : a.date > b.date ? -1 : i - j))
      .map(([e]) => e),
    spentCents: (month) => inMonth(month).reduce((s, e) => s + e.cents, 0),
  };
}
