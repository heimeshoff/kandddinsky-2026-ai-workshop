import { formatEur } from './money.js';

// Budget warning lines for the viewed month. Spent-over wins over projected-over.
// Past month: spent only. Future month: none. Categories without budget never listed.
export function budgetWarning(month, names, expenses, budgets) {
  const spent = expenses.spentByCategory(month, names);
  const proj = expenses.projectedByCategory(month, names);
  const avg = expenses.averageByCategory(names);
  const year = month.slice(0, 4);
  const months = Array.from({ length: 12 }, (_, k) => `${year}-${String(k + 1).padStart(2, '0')}`);
  const lines = [];
  names.forEach((name, i) => {
    const s = spent[i].cents;
    const p = proj[i].cents;
    const budget = budgets.cents(name, month);
    if (budget !== null && budget !== undefined && proj[i].display !== '–') {
      if (s > budget) lines.push(`${name}: spent ${formatEur(s)} of ${formatEur(budget)}`);
      else if (p !== null && p > budget) lines.push(`${name}: projected ${formatEur(p)} of ${formatEur(budget)}`);
    }
    // Year line: only for the current month (projected cents exist only there).
    if (p === null) return;
    const yearBudget = months.reduce((sum, m) => sum + (budgets.cents(name, m) ?? 0), 0);
    if (yearBudget === 0) return;
    const upTo = months.filter((m) => m <= month);
    const yearSpent = upTo.reduce((sum, m) => sum + expenses.spentByCategory(m, [name])[0].cents, 0);
    const remaining = 12 - upTo.length;
    const yearProjected = Math.round(yearSpent + (p - s) + (avg[i].cents ?? 0) * remaining);
    if (yearProjected > yearBudget)
      lines.push(`${name}: year projected ${formatEur(yearProjected)} of ${formatEur(yearBudget)}`);
  });
  return lines;
}
