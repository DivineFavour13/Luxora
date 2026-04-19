import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AccountNav from '../../components/AccountNav.jsx';
import { getCurrentUser, getUserPayments, saveUserPayments } from '../../utils/storage.js';
import { showNotification } from '../../utils/notifications.js';

export default function PaymentsPage() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState({ id: '', name: '', number: '', exp: '', cvv: '', isDefault: false });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setCards(getUserPayments(user));
  }, [navigate]);

  const detectBrand = (num) => {
    const n = String(num).replace(/\D/g, '');
    if (/^4/.test(n)) return 'Visa';
    if (/^5[1-5]/.test(n)) return 'Mastercard';
    if (/^3[47]/.test(n)) return 'Amex';
    return 'Card';
  };

  const resetForm = () => setForm({ id: '', name: '', number: '', exp: '', cvv: '', isDefault: false });

  const saveCard = (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;
    const number = form.number.trim().replace(/\s+/g, '');
    const [mm, yy] = form.exp.split('/');
    if (!form.name.trim() || !number || !mm || !yy || !form.cvv.trim()) {
      showNotification('Please fill all card fields', 'error');
      return;
    }
    if (number.replace(/\D/g, '').length < 12) {
      showNotification('Enter a valid card number', 'error');
      return;
    }
    let updated = cards.filter(c => c.id !== form.id);
    const card = {
      id: form.id || Date.now(),
      name: form.name.trim(),
      brand: detectBrand(number),
      last4: number.slice(-4),
      expMonth: mm,
      expYear: yy,
      isDefault: form.isDefault
    };
    if (card.isDefault) {
      updated = updated.map(c => ({ ...c, isDefault: false }));
    }
    updated = [card, ...updated];
    saveUserPayments(user, updated);
    setCards(updated);
    resetForm();
    showNotification('Card saved', 'success');
  };

  const setDefault = (id) => {
    const user = getCurrentUser();
    if (!user) return;
    const updated = cards.map(c => ({ ...c, isDefault: c.id === id }));
    saveUserPayments(user, updated);
    setCards(updated);
  };

  const removeCard = (id) => {
    if (!confirm('Remove this card?')) return;
    const user = getCurrentUser();
    if (!user) return;
    const updated = cards.filter(c => c.id !== id);
    saveUserPayments(user, updated);
    setCards(updated);
  };

  return (
    <main>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <i className="fas fa-chevron-right"></i>
          <Link to="/account">Account Settings</Link>
          <i className="fas fa-chevron-right"></i>
          <span>Payment Methods</span>
        </div>

        <div className="account-header">
          <h1><i className="fas fa-credit-card"></i> Payment Methods</h1>
          <p className="account-subtitle">Manage your saved cards and default method.</p>
        </div>

        <div className="account-grid">
          <AccountNav />

          <section className="account-content">
            <div className="card">
              <div className="card-header">
                <h3>Add New Card</h3>
                <span className="card-hint">Saved locally</span>
              </div>

              <form id="payment-form" onSubmit={saveCard}>
                <div className="form-grid">
                  <div className="form-group full">
                    <label htmlFor="card-name">Cardholder Name</label>
                    <input className="form-control" type="text" id="card-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="form-group full">
                    <label htmlFor="card-number">Card Number</label>
                    <input className="form-control" type="text" id="card-number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="card-exp">Expiry (MM/YY)</label>
                    <input className="form-control" type="text" id="card-exp" value={form.exp} onChange={(e) => setForm({ ...form, exp: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="card-cvv">CVV</label>
                    <input className="form-control" type="password" id="card-cvv" value={form.cvv} onChange={(e) => setForm({ ...form, cvv: e.target.value })} required />
                  </div>
                  <div className="form-group full">
                    <label className="inline-row">
                      <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
                      <span>Set as default payment method</span>
                    </label>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    <i className="fas fa-save"></i> Save Card
                  </button>
                  <button type="button" id="card-cancel" className="btn-outline" onClick={resetForm}>Cancel</button>
                </div>
              </form>
            </div>

            <div className="card" style={{ marginTop: '1rem' }}>
              <div className="card-header">
                <h3>Saved Cards</h3>
                <span className="card-hint">Masked</span>
              </div>
              <div id="payment-cards" className="payment-cards">
                {cards.length === 0 ? (
                  <div className="coming-soon">No cards saved yet.</div>
                ) : cards.map(c => (
                  <div className="payment-card" key={c.id}>
                    <div><strong>{c.brand}</strong> · **** {c.last4}</div>
                    <div>Cardholder: {c.name}</div>
                    <div>Expiry: {c.expMonth}/{c.expYear}</div>
                    <div>{c.isDefault ? <span className="badge primary">Default</span> : null}</div>
                    <div className="card-actions">
                      <button className="btn-outline" onClick={() => removeCard(c.id)}>Remove</button>
                      <button className="btn-outline" onClick={() => setDefault(c.id)}>Set Default</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
