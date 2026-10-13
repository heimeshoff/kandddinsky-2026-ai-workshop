import { parseAmount, formatEur } from './money.js';

const KEY = 'budget.incomes';

export const monthOf = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

// Income of the current month, persisted per month in the given storage.
export function createIncomeStore(storage, today = new Date()) {
  const month = monthOf(today);
  const load = () => {
    try { return JSON.parse(storage.getItem(KEY)) ?? {}; } catch { return {}; }
  };
  return {
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
