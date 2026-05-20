# LUXORA — Luxury E-Commerce Platform

A full-stack luxury fashion e-commerce web application built with React and Node.js. LUXORA offers a premium shopping experience with product browsing, cart management, user authentication, and order tracking.

---

## 🌟 Features

- Browse 50+ luxury fashion products across multiple categories
- Filter by category, search by name or brand
- Add to cart, apply promo codes, and checkout
- User registration and login (JWT-based authentication)
- Order placement and order history
- Wishlist, recently viewed, and flash sales
- PWA-ready (installable on mobile and desktop)
- Dark/light mode support
- Admin panel for managing products and orders
- Fully responsive design

---

## 🗂 Project Structure

```
Luxora/
├── src/                        # React frontend
│   ├── components/             # Reusable UI components
│   ├── pages/                  # Page components
│   │   ├── account/            # Account settings pages
│   │   ├── CartPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── HomePage.jsx
│   │   └── ...
│   ├── utils/
│   │   ├── api.js              # Backend API client
│   │   ├── storage.js          # localStorage helpers
│   │   ├── format.js           # Currency/date formatters
│   │   └── notifications.js    # Toast notifications
│   └── data/
│       └── products.js         # Product catalogue
├── luxora-backend/             # Express REST API
│   ├── routes/
│   │   ├── auth.js             # Register & login
│   │   ├── products.js         # Product listing
│   │   ├── orders.js           # Order placement & history
│   │   └── users.js            # User profile
│   ├── middleware/
│   │   └── auth.js             # JWT verification
│   ├── db/
│   │   └── index.js            # lowdb setup & seed
│   ├── server.js               # Express entry point
│   ├── .env.example
│   └── package.json
├── public/                     # Static assets
├── index.html
├── vite.config.js
└── package.json
```

---

## 🚀 Getting Started

You need **two terminals** — one for the frontend and one for the backend.

### Prerequisites

- Node.js v18 or higher
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/DivineFavour13/Luxora.git
cd Luxora
```

---

### 2. Set Up the Backend

```bash
cd luxora-backend
npm install
cp .env.example .env
```

Open `.env` and set your JWT secret:

```
PORT=3001
JWT_SECRET=your_secret_key_here
```

Start the backend:

```bash
npm run dev
```

The backend will start at `http://localhost:3001`. The database (`luxora-data.json`) is created automatically on first run and seeded with 12 sample products.

---

### 3. Set Up the Frontend

Open a **new terminal** in the root `Luxora/` folder:

```bash
npm install
npm run dev
```

The frontend will start at `http://localhost:5173`.

---

## 🔌 API Reference

Base URL: `http://localhost:3001/api`

### Auth (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create a new account |
| POST | `/auth/login` | Login and receive a JWT token |

**Request body (register):**
```json
{
  "name": "Amara Lagos",
  "email": "amara@email.com",
  "password": "secret123"
}
```

**Response:**
```json
{
  "token": "<jwt>",
  "user": { "id": 1, "name": "Amara Lagos", "email": "amara@email.com" }
}
```

---

### Products (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all products |
| GET | `/products?category=bags` | Filter by category |
| GET | `/products?search=velvet` | Search by name or brand |
| GET | `/products/:id` | Get single product |
| GET | `/products/categories/list` | Get all categories |

---

### Orders (Protected — requires `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Place an order |
| GET | `/orders` | Get current user's orders |
| GET | `/orders/:id` | Get single order |

**Place order body:**
```json
{
  "items": [
    { "productId": 1, "name": "Velvet Noir Handbag", "price": 285000, "quantity": 1 }
  ]
}
```

---

### Users (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user profile |

---

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite
- **React Router v6** for navigation
- **Tailwind CSS** for styling
- **localStorage** for cart, wishlist, and session persistence
- **PWA** with service worker and manifest

### Backend
- **Node.js** + **Express**
- **lowdb** — lightweight JSON file database (no setup required)
- **bcryptjs** — password hashing
- **jsonwebtoken** — JWT authentication
- **cors** — cross-origin resource sharing
- **nodemon** — auto-restart in development

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@luxora.com | admin123 |
| User | user@luxora.com | user123 |

---

## 📦 Available Scripts

### Frontend (`/`)
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend (`/luxora-backend`)
```bash
npm run dev      # Start with nodemon (auto-restart)
npm start        # Start without auto-restart
```

---

## 📁 Environment Variables

Create a `.env` file in `/luxora-backend` based on `.env.example`:

```
PORT=3001
JWT_SECRET=your_super_secret_key
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

---

## 👤 Author

**Divine Favour**
Frontend Wizards Program — Stage 4