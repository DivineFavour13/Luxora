export function formatCurrency(amount, currency = '₦') {
  try {
    return `${currency}${Number(amount || 0).toLocaleString()}`;
  } catch {
    return `${currency}${amount || 0}`;
  }
}
