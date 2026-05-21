import { getActiveCurrency, getCurrencySymbol, convertFromNGN } from './currency.js';

export function formatCurrency(amountInNGN) {
  try {
    const currency = getActiveCurrency();
    const symbol = getCurrencySymbol(currency);
    const converted = convertFromNGN(Number(amountInNGN || 0), currency);

    if (currency === 'NGN') {
      return `${symbol}${converted.toLocaleString()}`;
    }

    return `${symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } catch {
    return `₦${amountInNGN || 0}`;
  }
}