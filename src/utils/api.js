// LUXORA API Client
// Place this file at: src/utils/api.js

const BASE_URL = 'http://localhost:3001/api';

// --- Token helpers ---
export function getToken() {
  return localStorage.getItem('luxora_token');
}

export function saveToken(token) {
  localStorage.setItem('luxora_token', token);
}

export function removeToken() {
  localStorage.removeItem('luxora_token');
}

// --- Auth ---
export async function apiRegister(name, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

export async function apiLogin(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// --- Orders ---
export async function apiCreateOrder(items) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ items }),
  });
  return res.json();
}

export async function apiGetOrders() {
  const res = await fetch(`${BASE_URL}/orders`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
}