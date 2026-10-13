import { parseAmount, formatEur } from './money.js';

const KEY = 'budget.incomes';

export const monthOf = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const i = y * 12 + (m - 1) + delta;
  return `${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}`;
}

const NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];
export const monthLabel = (month) => {
  const [y, m] = month.split('-').map(Number);
  return `${NAMES[m - 1]} ${y}`;
};

// Income of the viewed month (starts at today's), persisted per month in the given storage.
export function createIncomeStore(storage, today = new Date()) {
  let month = monthOf(today);
  const load = () => {
    try { return JSON.parse(storage.getItem(KEY)) ?? {}; } catch { return {}; }
  };
  return {
    month: () => month,
    label: () => monthLabel(month),
    previous() { month = shiftMonth(month, -1); },
    next() { month = shiftMonth(month, 1); },
    cents: () => load()[month] ?? 0,
    display() { return formatEur(this.cents()); },
    set(text) {
      const cents = parseAmount(text);
      if (cents === null)
        return { ok: false, error: 'Enter an amount of 0 or more with at most 2 decimals, e.g. 2500,50.' };
      storage.setItem(KEY, JSON.stringify({ ...load(), [month]: cents }));
      return { ok: true };
    },
  };
}
