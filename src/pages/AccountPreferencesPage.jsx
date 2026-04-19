import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AccountNav from '../components/AccountNav.jsx';
import { getCurrentUser, getUserPreferences, saveUserPreferences } from '../utils/storage.js';
import { showNotification } from '../utils/notifications.js';

export default function AccountPreferencesPage() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({
    currency: 'NGN',
    emailNotifications: true,
    smsUpdates: false,
    newsletter: false
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setPrefs(getUserPreferences(user));
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;
    const ok = saveUserPreferences(user, prefs);
    if (ok) showNotification('Preferences saved', 'success');
    else showNotification('Failed to save preferences', 'error');
  };

  return (
    <main>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <i className="fas fa-chevron-right"></i>
          <span>Account Settings</span>
        </div>

        <div className="account-header">
          <h1><i className="fas fa-user-cog"></i> Account Settings</h1>
          <p className="account-subtitle">Manage your preferences and account experience.</p>
        </div>

        <div className="account-grid">
          <AccountNav />

          <section className="account-content">
            <div className="card">
              <div className="card-header">
                <h3>Order Preferences</h3>
                <span className="card-hint">Saved per account</span>
              </div>

              <form id="preferences-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <label htmlFor="pref-currency">Preferred Currency</label>
                  <select
                    id="pref-currency"
                    className="form-control"
                    value={prefs.currency}
                    onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}
                  >
                    <option value="NGN">Nigerian Naira (NGN)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                  </select>
                </div>

                <div className="toggle-row">
                  <div>
                    <h4>Email Notifications</h4>
                    <p>Receive order updates and receipts via email.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="pref-email"
                      checked={!!prefs.emailNotifications}
                      onChange={(e) => setPrefs({ ...prefs, emailNotifications: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-row">
                  <div>
                    <h4>SMS Updates</h4>
                    <p>Get delivery status via SMS (carrier rates may apply).</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="pref-sms"
                      checked={!!prefs.smsUpdates}
                      onChange={(e) => setPrefs({ ...prefs, smsUpdates: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-row">
                  <div>
                    <h4>Newsletter</h4>
                    <p>Weekly offers, deals, and curated picks.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="pref-newsletter"
                      checked={!!prefs.newsletter}
                      onChange={(e) => setPrefs({ ...prefs, newsletter: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    <i className="fas fa-save"></i> Save Preferences
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
