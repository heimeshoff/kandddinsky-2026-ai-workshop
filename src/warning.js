import { formatEur } from './money.js';

// Budget warning lines for the viewed month. Spent-over wins over projected-over.
// Past month: spent only. Future month: none. Categories without budget never listed.
export function budgetWarning(month, names, expenses, budgets) {
  const spent = expenses.spentByCategory(month, names);
  const proj = expenses.projectedByCategory(month, names);
  const lines = [];
  names.forEach((name, i) => {
    const budget = budgets.cents(name, month);
    if (budget === null || budget === undefined) return;
    const s = spent.find((x) => x.name === name)?.cents ?? 0;
    const p = proj[i].cents;
    if (proj[i].display === '–') return;
    if (s > budget) lines.push(`${name}: spent ${formatEur(s)} of ${formatEur(budget)}`);
    else if (p !== null && p > budget) lines.push(`${name}: projected ${formatEur(p)} of ${formatEur(budget)}`);
  });
  return lines;
}
