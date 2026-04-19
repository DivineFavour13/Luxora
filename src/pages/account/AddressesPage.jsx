import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AccountNav from '../../components/AccountNav.jsx';
import { getCurrentUser, getUserAddresses, saveUserAddresses } from '../../utils/storage.js';
import { showNotification } from '../../utils/notifications.js';

export default function AddressesPage() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    id: '',
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    country: '',
    postal: '',
    isDefaultShipping: false,
    isDefaultBilling: false
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setList(getUserAddresses(user));
  }, [navigate]);

  const resetForm = () => {
    setForm({
      id: '',
      name: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: '',
      postal: '',
      isDefaultShipping: false,
      isDefaultBilling: false
    });
  };

  const saveAddress = (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;
    if (!form.name || !form.phone || !form.line1 || !form.city || !form.state || !form.country || !form.postal) {
      showNotification('Please fill all required fields', 'error');
      return;
    }
    let updated = list.filter(a => a.id !== form.id);
    const payload = {
      ...form,
      id: form.id || Date.now()
    };
    if (payload.isDefaultShipping) {
      updated = updated.map(a => ({ ...a, isDefaultShipping: false }));
    }
    if (payload.isDefaultBilling) {
      updated = updated.map(a => ({ ...a, isDefaultBilling: false }));
    }
    updated = [payload, ...updated];
    saveUserAddresses(user, updated);
    setList(updated);
    resetForm();
    showNotification('Address saved', 'success');
  };

  const setDefault = (id, type) => {
    const user = getCurrentUser();
    if (!user) return;
    const updated = list.map(a => ({
      ...a,
      isDefaultShipping: type === 'ship' ? a.id === id : a.isDefaultShipping,
      isDefaultBilling: type === 'bill' ? a.id === id : a.isDefaultBilling
    }));
    saveUserAddresses(user, updated);
    setList(updated);
  };

  const removeAddress = (id) => {
    if (!confirm('Delete this address?')) return;
    const user = getCurrentUser();
    if (!user) return;
    const updated = list.filter(a => a.id !== id);
    saveUserAddresses(user, updated);
    setList(updated);
  };

  const editAddress = (addr) => {
    setForm({ ...addr });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <i className="fas fa-chevron-right"></i>
          <Link to="/account">Account Settings</Link>
          <i className="fas fa-chevron-right"></i>
          <span>Addresses</span>
        </div>

        <div className="account-header">
          <h1><i className="fas fa-map-marker-alt"></i> Addresses</h1>
          <p className="account-subtitle">Manage shipping and billing addresses.</p>
        </div>

        <div className="account-grid">
          <AccountNav />

          <section className="account-content">
            <div className="card">
              <div className="card-header">
                <h3>Address Management</h3>
                <span className="card-hint">Shipping & Billing</span>
              </div>

              <form id="address-form" onSubmit={saveAddress}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="address-name">Full Name</label>
                    <input className="form-control" type="text" id="address-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address-phone">Phone Number</label>
                    <input className="form-control" type="tel" id="address-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                  </div>
                  <div className="form-group full">
                    <label htmlFor="address-line1">Address Line 1</label>
                    <input className="form-control" type="text" id="address-line1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required />
                  </div>
                  <div className="form-group full">
                    <label htmlFor="address-line2">Address Line 2 (optional)</label>
                    <input className="form-control" type="text" id="address-line2" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address-city">City</label>
                    <input className="form-control" type="text" id="address-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address-state">State</label>
                    <input className="form-control" type="text" id="address-state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address-country">Country</label>
                    <input className="form-control" type="text" id="address-country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address-postal">Postal Code</label>
                    <input className="form-control" type="text" id="address-postal" value={form.postal} onChange={(e) => setForm({ ...form, postal: e.target.value })} required />
                  </div>
                  <div className="form-group full">
                    <label className="inline-row">
                      <input type="checkbox" checked={form.isDefaultShipping} onChange={(e) => setForm({ ...form, isDefaultShipping: e.target.checked })} />
                      <span>Set as default shipping address</span>
                    </label>
                  </div>
                  <div className="form-group full">
                    <label className="inline-row">
                      <input type="checkbox" checked={form.isDefaultBilling} onChange={(e) => setForm({ ...form, isDefaultBilling: e.target.checked })} />
                      <span>Set as default billing address</span>
                    </label>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    <i className="fas fa-save"></i> Save Address
                  </button>
                  <button type="button" id="address-cancel" className="btn-outline" onClick={resetForm}>Cancel</button>
                </div>
              </form>
            </div>

            <div className="card" style={{ marginTop: '1rem' }}>
              <div className="card-header">
                <h3>Saved Addresses</h3>
                <span className="card-hint">Cards view</span>
              </div>
              <div id="address-cards" className="address-cards">
                {list.length === 0 ? (
                  <div className="coming-soon">No addresses saved yet.</div>
                ) : list.map(a => (
                  <div className="address-card" key={a.id}>
                    <div><strong>{a.name}</strong> · {a.phone}</div>
                    <div>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</div>
                    <div>{a.city}, {a.state}, {a.country} {a.postal}</div>
                    <div>
                      {a.isDefaultShipping ? <span className="badge primary">Default Shipping</span> : null}
                      {a.isDefaultBilling ? <span className="badge primary">Default Billing</span> : null}
                    </div>
                    <div className="card-actions">
                      <button className="btn-outline" onClick={() => editAddress(a)}>Edit</button>
                      <button className="btn-outline" onClick={() => removeAddress(a.id)}>Delete</button>
                      <button className="btn-outline" onClick={() => setDefault(a.id, 'ship')}>Set Default Shipping</button>
                      <button className="btn-outline" onClick={() => setDefault(a.id, 'bill')}>Set Default Billing</button>
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
