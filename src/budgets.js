import { parseAmount, formatEur } from './money.js';

const KEY = 'budget.budgets';

// Budgets per category: { [category]: { [month]: cents | null } }. null = removed from that month on.
// A month without its own setting uses the latest earlier setting; never flows backwards.
export function createBudgetStore(storage) {
  const load = () => {
    try {
      const v = JSON.parse(storage.getItem(KEY));
      return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
    } catch { return {}; }
  };
  const save = (all) => storage.setItem(KEY, JSON.stringify(all));
  const put = (category, month, value) => {
    const all = load();
    save({ ...all, [category]: { ...(all[category] ?? {}), [month]: value } });
  };
  const cents = (category, month) => {
    const settings = load()[category] ?? {};
    const latest = Object.keys(settings).filter((k) => k <= month).sort().pop();
    return latest === undefined ? null : settings[latest];
  };
  return {
    cents,
    display: (category, month) => {
      const c = cents(category, month);
      return c === null ? 'no budget' : formatEur(c);
    },
    set(category, month, text) {
      const c = parseAmount(text);
      if (c === null || c <= 0)
        return { ok: false, error: 'Enter an amount above 0 with at most 2 decimals, e.g. 400,00.' };
      put(category, month, c);
      return { ok: true };
    },
    remove(category, month) {
      put(category, month, null);
      return { ok: true };
    },
    rename(oldName, newName) {
      const all = load();
      if (!(oldName in all) || oldName === newName) return;
      const { [oldName]: settings, ...rest } = all;
      save({ ...rest, [newName]: settings });
    },
    removeCategory(name) {
      const { [name]: _gone, ...rest } = load();
      save(rest);
    },
  };
}
