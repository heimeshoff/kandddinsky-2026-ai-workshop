const KEY = 'budget.categories';

// Categories exist for all months; unique case-insensitively, stored trimmed.
export function createCategoryStore(storage) {
  const load = () => {
    try {
      const v = JSON.parse(storage.getItem(KEY));
      return Array.isArray(v) ? v : [];
    } catch { return []; }
  };
  return {
    list: () => load(),
    add(name) {
      const clean = String(name ?? '').trim();
      if (clean === '') return { ok: false, error: 'Enter a category name.' };
      const list = load();
      if (list.some((c) => c.toLowerCase() === clean.toLowerCase()))
        return { ok: false, error: `Category "${clean}" already exists.` };
      storage.setItem(KEY, JSON.stringify([...list, clean]));
      return { ok: true };
    },
    remove(name) {
      const list = load();
      if (!list.includes(name)) return { ok: false };
      storage.setItem(KEY, JSON.stringify(list.filter((c) => c !== name)));
      return { ok: true };
    },
  };
}
