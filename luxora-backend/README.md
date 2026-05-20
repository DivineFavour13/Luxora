# LUXORA Backend

REST API for the LUXORA luxury e-commerce platform, built with Node.js, Express, and SQLite.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then edit JWT_SECRET
npm run dev            # development (auto-restarts)
npm start              # production
```

The SQLite database (`luxora.db`) is created automatically on first run and seeded with 12 sample products.

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login, get JWT |

**Register / Login body:**
```json
{ "name": "Amara", "email": "amara@email.com", "password": "secret123" }
```

**Response:**
```json
{ "token": "<jwt>", "user": { "id": 1, "name": "Amara", "email": "amara@email.com" } }
```

---

### Products (public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | All products |
| GET | `/api/products?category=bags` | Filter by category |
| GET | `/api/products?search=velvet` | Search by name/brand |
| GET | `/api/products/:id` | Single product |
| GET | `/api/products/categories/list` | All categories |

---

### Orders (protected — requires `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place an order |
| GET | `/api/orders` | My order history |
| GET | `/api/orders/:id` | Single order detail |

**Place order body:**
```json
{
  "items": [
    { "productId": 1, "quantity": 1 },
    { "productId": 4, "quantity": 2 }
  ]
}
```

---

### Users (protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | My profile |

---

## Connecting to the Frontend

In your React app, set the base URL:

```js
// src/api/client.js
const BASE_URL = "http://localhost:5000/api";

export async function fetchProducts(filters = {}) {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${BASE_URL}/products?${params}`);
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function placeOrder(items, token) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });
  return res.json();
}
```

---

## Project Structure

```
backend/
├── server.js          # Entry point
├── db/
│   └── index.js       # SQLite setup + seed
├── middleware/
│   └── auth.js        # JWT verification
├── routes/
│   ├── auth.js        # /api/auth
│   ├── products.js    # /api/products
│   ├── orders.js      # /api/orders
│   └── users.js       # /api/users
├── .env.example
└── package.json
```
