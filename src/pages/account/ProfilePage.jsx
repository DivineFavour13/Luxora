import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AccountNav from '../../components/AccountNav.jsx';
import { getCurrentUser, getUserProfile, saveUserProfile } from '../../utils/storage.js';
import { showNotification } from '../../utils/notifications.js';

const defaultAvatar = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2272%22 height=%2272%22%3E%3Crect fill=%22%23f0f0f0%22 width=%2272%22 height=%2272%22 rx=%2236%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.35em%22 font-family=%22Arial%22 font-size=%2214%22 fill=%22%23999%22%3EUser%3C/text%3E%3C/svg%3E';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    countryCode: '+234',
    phone: '',
    dob: '',
    photo: ''
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setProfile(getUserProfile(user));
  }, [navigate]);

  const handlePhoto = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((p) => ({ ...p, photo: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) return;
    const ok = saveUserProfile(user, profile);
    if (ok) showNotification('Profile updated', 'success');
    else showNotification('Failed to save profile', 'error');
  };

  return (
    <main>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <i className="fas fa-chevron-right"></i>
          <Link to="/account">Account Settings</Link>
          <i className="fas fa-chevron-right"></i>
          <span>Profile</span>
        </div>

        <div className="account-header">
          <h1><i className="fas fa-user"></i> Profile</h1>
          <p className="account-subtitle">Basic details and personal info.</p>
        </div>

        <div className="account-grid">
          <AccountNav />

          <section className="account-content">
            <div className="card">
              <div className="card-header">
                <h3>Profile Information</h3>
                <span className="card-hint">Basic details</span>
              </div>

              <form id="profile-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="section-title">Profile Picture</label>
                  <div className="profile-photo">
                    <img id="profile-photo-preview" alt="Profile photo" src={profile.photo || defaultAvatar} />
                    <input type="file" id="profile-photo" accept="image/*" onChange={(e) => handlePhoto(e.target.files?.[0])} />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="profile-name">Full Name</label>
                    <input className="form-control" type="text" id="profile-name" required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="profile-email">Email Address</label>
                    <input className="form-control" type="email" id="profile-email" required value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="profile-country-code">Country Code</label>
                    <select className="form-control" id="profile-country-code" value={profile.countryCode} onChange={(e) => setProfile({ ...profile, countryCode: e.target.value })}>
                      <option value="+234">+234 (NG)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (AU)</option>
                      <option value="+91">+91 (IN)</option>
                      <option value="+81">+81 (JP)</option>
                      <option value="+49">+49 (DE)</option>
                      <option value="+33">+33 (FR)</option>
                      <option value="+27">+27 (ZA)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="profile-phone">Phone Number</label>
                    <input className="form-control" type="tel" id="profile-phone" required value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                  </div>
                  <div className="form-group full">
                    <label htmlFor="profile-dob">Date of Birth (optional)</label>
                    <input className="form-control" type="date" id="profile-dob" value={profile.dob || ''} onChange={(e) => setProfile({ ...profile, dob: e.target.value })} />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    <i className="fas fa-save"></i> Save Changes
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
