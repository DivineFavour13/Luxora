import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { initializeStorage } from './utils/storage.js';

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

initializeStorage();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
