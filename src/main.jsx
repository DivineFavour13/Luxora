import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { initializeStorage, saveProducts } from './utils/storage.js';

import './styles/style.css';
import './styles/home.css';
import './styles/cart.css';
import './styles/login.css';
import './styles/flash-sales.css';
import './styles/product.css';
import './styles/admin.css';
import './styles/notifications.css';
import './styles/modals.css';
import './styles/responsive.css';
import './styles/wishlist.css';
import './styles/account.css';
import './styles/brand-store.css';
import './styles/features.css';

initializeStorage();

// Preload exchange rates
import('./utils/currency.js').then(({ ensureRates }) => ensureRates());

// Fetch products from MongoDB and sync to localStorage
fetch('http://localhost:3001/api/products')
  .then(r => r.json())
  .then(apiProducts => {
    if (Array.isArray(apiProducts) && apiProducts.length > 0) {
      // Normalize: add numeric id for frontend compatibility
      const normalized = apiProducts.map((p, index) => ({
        ...p,
        id: index + 1,
      }));
      saveProducts(normalized);
      console.log(`✅ Synced ${normalized.length} products from backend`);
    }
  })
  .catch(() => {
    console.warn('⚠️ Could not reach backend — using local product data');
  });

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);