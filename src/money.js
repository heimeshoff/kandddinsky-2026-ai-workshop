// Amounts are integer cents (EUR).
export function parseAmount(text) {
  if (typeof text !== 'string') return null;
  const m = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(text.trim());
  if (!m) return null;
  return Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0') || 0);
}

export function formatEur(cents) {
  const euros = String(Math.floor(cents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${euros}.${String(cents % 100).padStart(2, '0')} €`;
}
