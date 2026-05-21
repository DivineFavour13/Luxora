// src/utils/currency.js
// Handles live currency conversion for LUXORA
// Rates are fetched from exchangerate-api.com (free, no API key needed)
// and cached in localStorage for 1 hour to avoid excessive requests.

const RATES_KEY = 'luxora_exchange_rates';
const CURRENCY_KEY = 'luxora_currency';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export const CURRENCY_SYMBOLS = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

// Get the currently active currency code (default: NGN)
export function getActiveCurrency() {
  return localStorage.getItem(CURRENCY_KEY) || 'NGN';
}

// Set the active currency code
export function setActiveCurrency(code) {
  localStorage.setItem(CURRENCY_KEY, code);
}

// Get the symbol for a currency code
export function getCurrencySymbol(code) {
  return CURRENCY_SYMBOLS[code] || code;
}

// Get cached exchange rates (returns null if expired or missing)
export function getStoredRates() {
  try {
    const raw = localStorage.getItem(RATES_KEY);
    if (!raw) return null;
    const { rates, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) return null;
    return rates;
  } catch {
    return null;
  }
}

// Fetch fresh rates from the API and cache them
export async function fetchRates() {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/NGN');
    if (!res.ok) throw new Error('Rate fetch failed');
    const data = await res.json();
    localStorage.setItem(RATES_KEY, JSON.stringify({
      rates: data.rates,
      timestamp: Date.now(),
    }));
    return data.rates;
  } catch {
    return null;
  }
}

// Use cached rates if fresh, otherwise fetch new ones
export async function ensureRates() {
  const cached = getStoredRates();
  if (cached) return cached;
  return fetchRates();
}

// Convert an amount from NGN to the target currency using cached rates
export function convertFromNGN(amountInNGN, toCurrency) {
  if (!toCurrency || toCurrency === 'NGN') return Number(amountInNGN || 0);
  const rates = getStoredRates();
  if (!rates || !rates[toCurrency]) return Number(amountInNGN || 0);
  return Number(amountInNGN || 0) * rates[toCurrency];
}