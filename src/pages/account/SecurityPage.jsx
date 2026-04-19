import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AccountNav from '../../components/AccountNav.jsx';
import {
  getCurrentUser,
  getUserSecuritySettings,
  saveUserSecuritySettings,
  getUserLoginHistory,
  changeUserPassword,
  logout
} from '../../utils/storage.js';
import { showNotification } from '../../utils/notifications.js';

export default function SecurityPage() {
  const navigate = useNavigate();
  const [twoFactor, setTwoFactor] = useState(false);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ oldPass: '', newPass: '', confirm: '' });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    const sec = getUserSecuritySettings(user);
    setTwoFactor(!!sec.twoFactor);
    setHistory(getUserLoginHistory(user));
  }, [navigate]);

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!form.oldPass || !form.newPass || !form.confirm) {
      showNotification('Please fill all password fields', 'error');
      return;
    }
    if (form.newPass.length < 6) {
      showNotification('Password must be at least 6 characters', 'error');
      return;
    }
    if (form.newPass !== form.confirm) {
      showNotification('Passwords do not match', 'error');
      return;
    }
    const user = getCurrentUser();
    if (!user) return;
    const ok = changeUserPassword(user, form.oldPass, form.newPass);
    if (ok) {
      setForm({ oldPass: '', newPass: '', confirm: '' });
      showNotification('Password updated', 'success');
    } else {
      showNotification('Current password is incorrect', 'error');
    }
  };

  const toggle2FA = (checked) => {
    const user = getCurrentUser();
    if (!user) return;
    saveUserSecuritySettings(user, { twoFactor: checked });
    setTwoFactor(checked);
    showNotification('Security settings updated', 'success');
  };

  const handleLogoutAll = () => {
    if (!confirm('Logout from all devices?')) return;
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('savedEmail');
    logout();
    showNotification('Logged out from all devices', 'success');
    navigate('/login');
  };

  return (
    <main>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <i className="fas fa-chevron-right"></i>
          <Link to="/account">Account Settings</Link>
          <i className="fas fa-chevron-right"></i>
          <span>Security</span>
        </div>

        <div className="account-header">
          <h1><i className="fas fa-lock"></i> Security</h1>
          <p className="account-subtitle">Password, 2FA, and login activity.</p>
        </div>

        <div className="account-grid">
          <AccountNav />

          <section className="account-content">
            <div className="card">
              <div className="card-header">
                <h3>Security Settings</h3>
                <span className="card-hint">Protect your account</span>
              </div>

              <form id="password-form" onSubmit={handleSavePassword}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="old-password">Current Password</label>
                    <input className="form-control" type="password" id="old-password" required value={form.oldPass} onChange={(e) => setForm({ ...form, oldPass: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="new-password">New Password</label>
                    <input className="form-control" type="password" id="new-password" required value={form.newPass} onChange={(e) => setForm({ ...form, newPass: e.target.value })} />
                  </div>
                  <div className="form-group full">
                    <label htmlFor="confirm-password">Confirm New Password</label>
                    <input className="form-control" type="password" id="confirm-password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    <i className="fas fa-key"></i> Change Password
                  </button>
                </div>
              </form>

              <div className="security-block">
                <div className="toggle-row">
                  <div>
                    <h4>Two-Factor Authentication (2FA)</h4>
                    <p>Add an extra layer of security to your account.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={twoFactor} onChange={(e) => toggle2FA(e.target.checked)} />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="security-block">
                <h4 className="section-title">Login Activity</h4>
                <div className="login-history">
                  {history.length === 0 ? (
                    <div className="login-item">No login activity yet.</div>
                  ) : (
                    history.map((h, idx) => (
                      <div className="login-item" key={idx}>
                        <strong>{new Date(h.at || Date.now()).toLocaleString()}</strong> · {h.device || 'Unknown device'}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="security-block">
                <button id="logout-all" className="btn-outline" onClick={handleLogoutAll}>
                  <i className="fas fa-sign-out-alt"></i> Logout From All Devices
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
