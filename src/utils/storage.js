// storage.js - FIXED with password hashing and proper security
import products from '../data/products-data.js';

// Storage keys
const PRODUCTS_KEY = 'luxora_products';
const PRODUCTS_VERSION_KEY = 'luxora_products_version';
const CART_KEY = 'luxora_cart';
const USER_KEY = 'luxora_user';
const USERS_KEY = 'luxora_users';
const WISHLIST_KEY = 'luxora_wishlist';
const RECENTLY_VIEWED_KEY = 'luxora_recently_viewed';
const ORDERS_KEY = 'luxora_orders';
const SETTINGS_KEY = 'luxora_settings';
const USER_DATA_KEY = 'luxora_user_data';
const PRODUCT_DATA_VERSION = '2026-04-19-1';

// ==================== PASSWORD HASHING ====================
// Simple hash function for demo purposes (in production use bcrypt or similar)
function hashPassword(password) {
  let hash = 0;
  const salt = 'luxora_secret_salt_2024';
  const combined = password + salt;
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return hash.toString(36);
}

function verifyPassword(password, hashedPassword) {
  return hashPassword(password) === hashedPassword;
}

function verifyAdminPermission() {
  const user = getCurrentUser(); // This uses your existing function to get the logged-in user
  if (!user || user.role !== 'admin') {
    if (typeof showNotification === 'function') {
      showNotification("Permission denied: Administrative privileges required.", "error");
    }
    return false;
  }
  return true;
}

// ==================== PRODUCT MANAGEMENT ====================
function getProducts() {
  try {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    if (typeof products !== 'undefined' && products.length > 0) {
      saveProducts(products);
      return products;
    }
    
    return [];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}

function saveProducts(products) {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('productsUpdated'));
    return true;
  } catch (error) {
    console.error('Error saving products:', error);
    return false;
  }
}

function getProductById(id) {
  const products = getProducts();
  return products.find(product => product.id === parseInt(id));
}

function updateProduct(id, updates) {
  if (!verifyAdminPermission()) return false;

  const products = getProducts();
  const index = products.findIndex(product => product.id === parseInt(id));
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    return saveProducts(products);
  }
  return false;
}

function deleteProduct(id) {
  if (!verifyAdminPermission()) return false;

  const products = getProducts();
  const filteredProducts = products.filter(product => product.id !== parseInt(id));
  return saveProducts(filteredProducts);
}

// ==================== CART MANAGEMENT ====================
function getCart() {
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error getting cart:', error);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    return true;
  } catch (error) {
    console.error('Error saving cart:', error);
    return false;
  }
}

function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }
  
  return saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart();
  const filteredCart = cart.filter(item => item.id !== parseInt(productId));
  return saveCart(filteredCart);
}

function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.id === parseInt(productId));
  
  if (item) {
    if (quantity <= 0) {
      return removeFromCart(productId);
    } else {
      item.quantity = quantity;
      return saveCart(cart);
    }
  }
  return false;
}

function clearCart() {
  return saveCart([]);
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}

// ==================== USER MANAGEMENT (SECURE) ====================
function getCurrentUser() {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

function setCurrentUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('userUpdated'));
    // Restore user-specific session data (cart, wishlist, history)
    restoreUserSessionData(user);
    return true;
  } catch (error) {
    console.error('Error setting current user:', error);
    return false;
  }
}

function setCurrentUserNoRestore(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('userUpdated'));
    return true;
  } catch (error) {
    console.error('Error setting current user:', error);
    return false;
  }
}

function logout() {
  try {
    const user = getCurrentUser();
    if (user) {
      saveUserSessionData(user);
    }
    clearSessionData();
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event('userUpdated'));
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
}

function getUsers() {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Error saving users:', error);
    return false;
  }
}

function updateUserByEmail(email, updates) {
  const users = getUsers();
  const idx = users.findIndex(u => u.email?.toLowerCase() === email?.toLowerCase());
  if (idx === -1) return false;
  users[idx] = { ...users[idx], ...updates };
  return saveUsers(users);
}

function addUser(user) {
  const users = getUsers();
  
  // Check if user already exists
  if (users.find(u => u.email.toLowerCase() === user.email.toLowerCase())) {
    return false;
  }
  
  const newUser = {
    id: Date.now(),
    name: user.name,
    email: user.email,
    countryCode: user.countryCode || '',
    phone: user.phone || '',
    password: hashPassword(user.password), 
    role: 'user', 
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  return saveUsers(users);
}

// FIXED: Verify password using hash
function authenticateUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return null;
  }
  
  // Verify hashed password
  if (verifyPassword(password, user.password)) {
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
}

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function findUserByPhone(phone) {
  const target = normalizePhone(phone);
  if (!target) return null;

  const users = getUsers();
  return users.find(u => {
    const storedPhone = normalizePhone(u.phone);
    const storedCombined = normalizePhone(`${u.countryCode || ''}${u.phone || ''}`);
    return target === storedPhone || target === storedCombined;
  }) || null;
}

function authenticateUserByPhone(phone, password) {
  const user = findUserByPhone(phone);
  if (!user) return null;
  if (verifyPassword(password, user.password)) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
}

function authenticateUserByIdentifier(identifier, password) {
  const id = String(identifier || '').trim();
  if (!id) return null;
  if (id.includes('@')) {
    return authenticateUser(id, password);
  }
  return authenticateUserByPhone(id, password);
}

// ==================== USER PROFILE ====================
function getUserProfile(user) {
  if (!user) return null;
  const profile = {
    name: user.name || '',
    email: user.email || '',
    countryCode: user.countryCode || '',
    phone: user.phone || '',
    dob: '',
    photo: ''
  };
  const map = getUserDataMap();
  const key = getUserStorageKey(user);
  if (!key || !map[key]?.profile) return profile;
  return { ...profile, ...map[key].profile };
}

function saveUserProfile(user, profile) {
  const key = getUserStorageKey(user);
  if (!key) return false;
  const map = getUserDataMap();
  const existing = map[key] || {};
  map[key] = {
    ...existing,
    profile: { ...(existing.profile || {}), ...profile },
    savedAt: new Date().toISOString()
  };
  const ok = saveUserDataMap(map);
  if (ok) {
    // Keep users list + current user in sync
    if (profile.name || profile.email || profile.phone || profile.countryCode) {
      updateUserByEmail(user.email, {
        name: profile.name || user.name,
        email: profile.email || user.email,
        phone: profile.phone || user.phone,
        countryCode: profile.countryCode || user.countryCode
      });
      const updatedUser = {
        ...user,
        name: profile.name || user.name,
        email: profile.email || user.email,
        phone: profile.phone || user.phone,
        countryCode: profile.countryCode || user.countryCode
      };
      setCurrentUserNoRestore(updatedUser);
    }
  }
  return ok;
}

// ==================== WISHLIST MANAGEMENT ====================
function getWishlist() {
  try {
    const wishlist = localStorage.getItem(WISHLIST_KEY);
    return wishlist ? JSON.parse(wishlist) : [];
  } catch (error) {
    console.error('Error getting wishlist:', error);
    return [];
  }
}

function saveWishlist(wishlist) {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    window.dispatchEvent(new Event('wishlistUpdated'));
    return true;
  } catch (error) {
    console.error('Error saving wishlist:', error);
    return false;
  }
}

function addToWishlist(product) {
  const wishlist = getWishlist();
  const exists = wishlist.find(item => item.id === product.id);
  
  if (!exists) {
    wishlist.push(product);
    return saveWishlist(wishlist);
  }
  return false;
}

function removeFromWishlist(productId) {
  const wishlist = getWishlist();
  const filteredWishlist = wishlist.filter(item => item.id !== parseInt(productId));
  return saveWishlist(filteredWishlist);
}

function isInWishlist(productId) {
  const wishlist = getWishlist();
  return wishlist.some(item => item.id === parseInt(productId));
}

// ==================== RECENTLY VIEWED ====================
function getRecentlyViewed() {
  try {
    const recentlyViewed = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return recentlyViewed ? JSON.parse(recentlyViewed) : [];
  } catch (error) {
    console.error('Error getting recently viewed:', error);
    return [];
  }
}

function saveRecentlyViewed(recentlyViewed) {
  try {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed));
    return true;
  } catch (error) {
    console.error('Error saving recently viewed:', error);
    return false;
  }
}

function addToRecentlyViewed(product) {
  const recentlyViewed = getRecentlyViewed();
  const filtered = recentlyViewed.filter(item => item.id !== product.id);
  filtered.unshift(product);
  const limited = filtered.slice(0, 10);
  return saveRecentlyViewed(limited);
}

// ==================== USER SESSION DATA ====================
function getUserStorageKey(user) {
  if (!user) return null;
  if (user.email) return `email:${String(user.email).toLowerCase()}`;
  if (user.id != null) return `id:${user.id}`;
  return null;
}

function getUserDataMap() {
  try {
    const raw = localStorage.getItem(USER_DATA_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Error getting user data map:', error);
    return {};
  }
}

function saveUserDataMap(map) {
  try {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(map));
    return true;
  } catch (error) {
    console.error('Error saving user data map:', error);
    return false;
  }
}

function saveUserSessionData(user) {
  const key = getUserStorageKey(user);
  if (!key) return false;
  const map = getUserDataMap();
  const existing = map[key] || {};
  map[key] = {
    ...existing,
    cart: getCart(),
    wishlist: getWishlist(),
    recentlyViewed: getRecentlyViewed(),
    savedAt: new Date().toISOString()
  };
  return saveUserDataMap(map);
}

function restoreUserSessionData(user) {
  const key = getUserStorageKey(user);
  if (!key) return false;
  const map = getUserDataMap();
  const data = map[key];

  if (data) {
    saveCart(Array.isArray(data.cart) ? data.cart : []);
    saveWishlist(Array.isArray(data.wishlist) ? data.wishlist : []);
    saveRecentlyViewed(Array.isArray(data.recentlyViewed) ? data.recentlyViewed : []);
  } else {
    clearSessionData();
  }

  return true;
}

function clearSessionData() {
  saveCart([]);
  saveWishlist([]);
  saveRecentlyViewed([]);
}

function getDefaultUserPreferences() {
  let currency = 'NGN';
  try {
    if (typeof getSettings === 'function') {
      currency = getSettings()?.currency || currency;
    }
  } catch (e) {
    // ignore and use default
  }
  return {
    currency,
    emailNotifications: true,
    smsUpdates: false,
    newsletter: false
  };
}

function getUserPreferences(user) {
  const key = getUserStorageKey(user);
  if (!key) return getDefaultUserPreferences();
  const map = getUserDataMap();
  const existing = map[key]?.preferences || {};
  return { ...getDefaultUserPreferences(), ...existing };
}

function saveUserPreferences(user, prefs) {
  const key = getUserStorageKey(user);
  if (!key) return false;
  const map = getUserDataMap();
  const existing = map[key] || {};
  map[key] = {
    ...existing,
    preferences: { ...getDefaultUserPreferences(), ...prefs },
    savedAt: new Date().toISOString()
  };
  return saveUserDataMap(map);
}

// ==================== USER SECURITY ====================
function getUserSecuritySettings(user) {
  const key = getUserStorageKey(user);
  if (!key) return { twoFactor: false };
  const map = getUserDataMap();
  return { twoFactor: false, ...(map[key]?.security || {}) };
}

function saveUserSecuritySettings(user, security) {
  const key = getUserStorageKey(user);
  if (!key) return false;
  const map = getUserDataMap();
  const existing = map[key] || {};
  map[key] = {
    ...existing,
    security: { ...(existing.security || {}), ...security },
    savedAt: new Date().toISOString()
  };
  return saveUserDataMap(map);
}

function changeUserPassword(user, oldPassword, newPassword) {
  if (!user || !user.email) return false;
  const users = getUsers();
  const found = users.find(u => u.email?.toLowerCase() === user.email.toLowerCase());
  if (!found) return false;
  if (!verifyPassword(oldPassword, found.password)) return false;
  found.password = hashPassword(newPassword);
  return saveUsers(users);
}

// ==================== LOGIN ACTIVITY ====================
function getUserLoginHistory(user) {
  const key = getUserStorageKey(user);
  if (!key) return [];
  const map = getUserDataMap();
  const list = map[key]?.loginHistory || [];
  return Array.isArray(list) ? list : [];
}

function addLoginActivity(user, activity) {
  const key = getUserStorageKey(user);
  if (!key) return false;
  const map = getUserDataMap();
  const existing = map[key] || {};
  const history = Array.isArray(existing.loginHistory) ? existing.loginHistory : [];
  history.unshift(activity);
  map[key] = { ...existing, loginHistory: history.slice(0, 10), savedAt: new Date().toISOString() };
  return saveUserDataMap(map);
}

// ==================== ADDRESSES ====================
function getUserAddresses(user) {
  const key = getUserStorageKey(user);
  if (!key) return [];
  const map = getUserDataMap();
  const list = map[key]?.addresses || [];
  return Array.isArray(list) ? list : [];
}

function saveUserAddresses(user, addresses) {
  const key = getUserStorageKey(user);
  if (!key) return false;
  const map = getUserDataMap();
  const existing = map[key] || {};
  map[key] = { ...existing, addresses: addresses || [], savedAt: new Date().toISOString() };
  return saveUserDataMap(map);
}

// ==================== PAYMENTS ====================
function getUserPayments(user) {
  const key = getUserStorageKey(user);
  if (!key) return [];
  const map = getUserDataMap();
  const list = map[key]?.payments || [];
  return Array.isArray(list) ? list : [];
}

function saveUserPayments(user, payments) {
  const key = getUserStorageKey(user);
  if (!key) return false;
  const map = getUserDataMap();
  const existing = map[key] || {};
  map[key] = { ...existing, payments: payments || [], savedAt: new Date().toISOString() };
  return saveUserDataMap(map);
}

// ==================== ORDERS MANAGEMENT ====================
function getOrders() {
  try {
    const orders = localStorage.getItem(ORDERS_KEY);
    return orders ? JSON.parse(orders) : [];
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
}

function saveOrders(orders) {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return true;
  } catch (error) {
    console.error('Error saving orders:', error);
    return false;
  }
}

function createOrder(orderData) {
  const orders = getOrders();
  const newOrder = {
    id: generateOrderId(),
    ...orderData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  return saveOrders(orders) ? newOrder : null;
}

function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const order = orders.find(order => order.id === orderId);
  
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return saveOrders(orders);
  }
  return false;
}

function generateOrderId() {
  return 'ORD-' + Date.now().toString().slice(-6);
}

// ==================== SETTINGS ====================
function getSettings() {
  try {
    const settings = localStorage.getItem(SETTINGS_KEY);
    return settings ? JSON.parse(settings) : getDefaultSettings();
  } catch (error) {
    console.error('Error getting settings:', error);
    return getDefaultSettings();
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

function getDefaultSettings() {
  return {
    siteName: 'LUXORA',
    siteDescription: 'Your No.1 Online Shopping Destination',
    contactEmail: 'contact@luxora.com',
    currency: 'NGN',
    currencySymbol: '₦',
    emailNotifications: true,
    smsNotifications: true,
    dailyReports: false,
    theme: 'light',
    language: 'en'
  };
}

// ==================== UTILITY FUNCTIONS ====================
function clearAllData() {
  try {
    localStorage.removeItem(PRODUCTS_KEY);
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(WISHLIST_KEY);
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
    localStorage.removeItem(ORDERS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
}

function exportData() {
  try {
    const data = {
      products: getProducts(),
      users: getUsers().map(u => ({ ...u, password: '[ENCRYPTED]' })), // Don't export passwords
      orders: getOrders(),
      settings: getSettings(),
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
}

function importData(jsonData) {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.products) saveProducts(data.products);
    if (data.orders) saveOrders(data.orders);
    if (data.settings) saveSettings(data.settings);
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}

function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}

// ==================== INITIALIZATION ====================
function initializeStorage() {
  if (!isStorageAvailable()) {
    console.warn('LocalStorage is not available');
    return false;
  }

  // 1. Initialize products and refresh bundled catalog changes when the data version changes.
  const storedProducts = getProducts();
  if (typeof products !== 'undefined' && Array.isArray(products) && products.length > 0) {
    const storedVersion = localStorage.getItem(PRODUCTS_VERSION_KEY);
    if (!storedProducts || storedProducts.length === 0) {
      // No stored products yet: seed from file
      saveProducts(products);
      localStorage.setItem(PRODUCTS_VERSION_KEY, PRODUCT_DATA_VERSION);
    } else if (storedVersion !== PRODUCT_DATA_VERSION) {
      const sourceIds = new Set(products.map(p => p.id));
      const customProducts = storedProducts.filter(p => !sourceIds.has(p.id));
      saveProducts([...products, ...customProducts]);
      localStorage.setItem(PRODUCTS_VERSION_KEY, PRODUCT_DATA_VERSION);
    } else {
      // Merge: append any products from file that are not in storage by id
      const existingIds = new Set(storedProducts.map(p => p.id));
      const toAdd = products.filter(p => !existingIds.has(p.id));
      if (toAdd.length > 0) {
        saveProducts([...storedProducts, ...toAdd]);
      }
    }
  }

  // 2. Initialize default users (SECURE METHOD)
  const users = getUsers();
  if (users.length === 0) {
    const initialAdmin = {
      id: 1,
      name: 'Admin',
      email: 'admin@luxora.com',
      password: hashPassword('admin123'),
      role: 'admin',
      joinedDate: new Date().toISOString()
    };
    
    const initialUser = {
      id: 2,
      name: 'Test User',
      email: 'user@luxora.com',
      password: hashPassword('user123'),
      role: 'user',
      joinedDate: new Date().toISOString()
    };

    // Save directly to localStorage to establish the initial admin
    localStorage.setItem(USERS_KEY, JSON.stringify([initialAdmin, initialUser]));
  }

  // 3. Initialize other storage keys if they don't exist
  if (!localStorage.getItem(SETTINGS_KEY)) {
    saveSettings(getDefaultSettings());
  }
  if (!localStorage.getItem(CART_KEY)) {
    saveCart([]);
  }
  if (!localStorage.getItem(WISHLIST_KEY)) {
    saveWishlist([]);
  }
  if (!localStorage.getItem(RECENTLY_VIEWED_KEY)) {
    saveRecentlyViewed([]);
  }
  if (!localStorage.getItem(ORDERS_KEY)) {
    saveOrders([]);
  }

  return true;
}

// Auto-initialize (kept your existing timeout logic)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    initializeStorage();
  }, 50);
}

export {
  getProducts,
  saveProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getCart,
  saveCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  getCartTotal,
  getCartItemCount,
  getCurrentUser,
  setCurrentUser,
  setCurrentUserNoRestore,
  logout,
  getUsers,
  saveUsers,
  addUser,
  authenticateUser,
  authenticateUserByPhone,
  authenticateUserByIdentifier,
  getWishlist,
  saveWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  getRecentlyViewed,
  saveRecentlyViewed,
  addToRecentlyViewed,
  getOrders,
  saveOrders,
  createOrder,
  updateOrderStatus,
  getSettings,
  saveSettings,
  getDefaultSettings,
  clearAllData,
  exportData,
  importData,
  isStorageAvailable,
  initializeStorage,
  getUserPreferences,
  saveUserPreferences,
  getUserProfile,
  saveUserProfile,
  getUserSecuritySettings,
  saveUserSecuritySettings,
  changeUserPassword,
  getUserLoginHistory,
  addLoginActivity,
  getUserAddresses,
  saveUserAddresses,
  getUserPayments,
  saveUserPayments
};

// ==================== REVIEWS ====================
const REVIEWS_KEY = 'luxora_reviews';

function getReviews() {
  try { return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '{}'); } catch { return {}; }
}

function getProductReviews(productId) {
  const all = getReviews();
  return all[String(productId)] || [];
}

function addProductReview(productId, review) {
  const all = getReviews();
  const key = String(productId);
  const existing = all[key] || [];
  const newReview = { ...review, id: Date.now(), createdAt: new Date().toISOString() };
  all[key] = [newReview, ...existing];
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event('reviewsUpdated'));
  return newReview;
}

function hasUserReviewed(productId, userEmail) {
  const reviews = getProductReviews(productId);
  return reviews.some(r => r.userEmail === userEmail);
}

// ==================== PROMO CODES (admin-managed) ====================
const PROMO_CODES_KEY = 'luxora_promo_codes';

const DEFAULT_PROMOS = [
  { code: 'WELCOME10', type: 'percentage', value: 10, description: '10% off your order', minOrderValue: 5000, maxDiscount: 10000, active: true },
  { code: 'SAVE5000',  type: 'fixed',      value: 5000, description: '₦5,000 off your order', minOrderValue: 25000, active: true },
  { code: 'FREESHIP',  type: 'shipping',   value: 0,    description: 'Free shipping',           minOrderValue: 0,     active: true },
];

function getPromoCodes() {
  try {
    const stored = localStorage.getItem(PROMO_CODES_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(PROMO_CODES_KEY, JSON.stringify(DEFAULT_PROMOS));
    return DEFAULT_PROMOS;
  } catch { return DEFAULT_PROMOS; }
}

function savePromoCodes(codes) {
  try { localStorage.setItem(PROMO_CODES_KEY, JSON.stringify(codes)); return true; } catch { return false; }
}

// ==================== NEWSLETTER ====================
const NEWSLETTER_KEY = 'luxora_newsletter';

function getNewsletterSubscribers() {
  try { return JSON.parse(localStorage.getItem(NEWSLETTER_KEY) || '[]'); } catch { return []; }
}

function addNewsletterSubscriber(email) {
  const list = getNewsletterSubscribers();
  if (list.find(e => e.email === email)) return false;
  list.push({ email, subscribedAt: new Date().toISOString() });
  localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(list));
  return true;
}

export {
  getReviews, getProductReviews, addProductReview, hasUserReviewed,
  getPromoCodes, savePromoCodes,
  getNewsletterSubscribers, addNewsletterSubscriber,
};
