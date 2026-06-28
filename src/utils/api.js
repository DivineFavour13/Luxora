// LUXORA API Client

const BASE_URL = 'https://luxora-7uwx.onrender.com/api';

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
export async function apiLogin(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}
export async function apiRegister(name, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

// --- Products (public) ---
export async function apiGetProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/products${query ? '?' + query : ''}`);
  return res.json();
}

// --- Products (admin) ---
export async function apiAdminAddProduct(data) {
  const res = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function apiAdminUpdateProduct(mongoId, data) {
  const res = await fetch(`${BASE_URL}/products/${mongoId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function apiAdminDeleteProduct(mongoId) {
  const res = await fetch(`${BASE_URL}/products/${mongoId}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
}

// --- Orders (user) ---
export async function apiCreateOrder(items) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
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

// --- Orders (admin) ---
export async function apiAdminGetAllOrders() {
  const res = await fetch(`${BASE_URL}/orders/all`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
}
export async function apiAdminUpdateOrderStatus(mongoId, status) {
  const res = await fetch(`${BASE_URL}/orders/${mongoId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

// --- Users (admin) ---
export async function apiAdminGetAllUsers() {
  const res = await fetch(`${BASE_URL}/users/all`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
}

// --- Payments ---
export async function apiCreatePaymentIntent(amountNGN) {
  const res = await fetch(`${BASE_URL}/payments/create-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ amount: amountNGN }),
  });
  return res.json();
}