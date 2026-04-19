import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  authenticateUserByIdentifier,
  addUser,
  setCurrentUser,
  addLoginActivity
} from '../utils/storage.js';
import { showNotification } from '../utils/notifications.js';

function EyeIcon({ closed = false }) {
  return closed ? (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M3 4.3 19.7 21l1.4-1.4L17.8 16A13 13 0 0 0 23 12c-2.2-4.1-6.2-7-11-7-1.7 0-3.3.4-4.8 1.1L4.4 3zM9.6 8.2A4 4 0 0 1 15.8 14zM5.8 7.3A13.3 13.3 0 0 0 1 12c2.2 4.1 6.2 7 11 7 1.7 0 3.4-.4 4.9-1.1l-1.6-1.6a7 7 0 0 1-9.5-9.5" fill="currentColor" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M12 5c4.8 0 8.8 2.9 11 7-2.2 4.1-6.2 7-11 7S3.2 16.1 1 12c2.2-4.1 6.2-7 11-7zm0 2C8.4 7 5.3 9 3.4 12 5.3 15 8.4 17 12 17s6.7-2 8.6-5C18.7 9 15.6 7 12 7zm0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" fill="currentColor" />
    </svg>
  );
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [reg, setReg] = useState({
    name: '',
    email: '',
    countryCode: '+234',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('rememberMe') === 'true';
    const savedEmail = localStorage.getItem('savedEmail') || '';
    if (saved && savedEmail) {
      setIdentifier(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => {
    const digits = String(phone || '').replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  };
  const validatePassword = (pass) => pass.length >= 6;

  const setError = (key, message) => setErrors((prev) => ({ ...prev, [key]: message }));
  const setSuccessField = (key, on) => setSuccess((prev) => ({ ...prev, [key]: !!on }));
  const clearError = (key) => setErrors((prev) => {
    const next = { ...prev };
    delete next[key];
    return next;
  });

  const handleLogin = (e) => {
    e.preventDefault();
    let valid = true;
    if (!identifier.trim()) {
      setError('identifier', 'Email or phone is required');
      valid = false;
    } else if (identifier.includes('@') && !validateEmail(identifier.trim())) {
      setError('identifier', 'Please enter a valid email');
      valid = false;
    } else if (!identifier.includes('@') && !validatePhone(identifier.trim())) {
      setError('identifier', 'Please enter a valid phone number');
      valid = false;
    } else {
      clearError('identifier');
    }
    if (!password) {
      setError('password', 'Password is required');
      valid = false;
    } else if (!validatePassword(password)) {
      setError('password', 'Password must be at least 6 characters');
      valid = false;
    } else {
      clearError('password');
    }
    if (!valid) {
      showNotification('Please fill in all required fields correctly', 'error');
      return;
    }

    setIsSubmitting(true);
    const user = authenticateUserByIdentifier(identifier.trim(), password);
    if (!user) {
      showNotification('Invalid email/phone or password', 'error');
      setIsSubmitting(false);
      return;
    }
    setCurrentUser(user);
    addLoginActivity?.(user, { at: new Date().toISOString(), device: navigator.userAgent || 'Unknown device' });

    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('savedEmail', identifier.trim());
    } else {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('savedEmail');
    }

    showNotification('Login successful! Redirecting...', 'success');
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/');
    }, 1000);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    let valid = true;

    if (!reg.name.trim()) { setError('reg_name', 'Name is required'); valid = false; } else clearError('reg_name');
    if (!reg.email.trim()) { setError('reg_email', 'Email is required'); valid = false; }
    else if (!validateEmail(reg.email.trim())) { setError('reg_email', 'Please enter a valid email'); valid = false; }
    else clearError('reg_email');

    if (!reg.phone.trim()) { setError('reg_phone', 'Phone number is required'); valid = false; }
    else if (!validatePhone(reg.phone.trim())) { setError('reg_phone', 'Enter a valid phone number'); valid = false; }
    else clearError('reg_phone');

    if (!reg.password.trim()) { setError('reg_password', 'Password is required'); valid = false; }
    else if (!validatePassword(reg.password.trim())) { setError('reg_password', 'Password must be at least 6 characters'); valid = false; }
    else clearError('reg_password');

    if (!reg.confirmPassword.trim()) { setError('reg_confirm', 'Please confirm your password'); valid = false; }
    else if (reg.confirmPassword !== reg.password) { setError('reg_confirm', 'Passwords do not match'); valid = false; }
    else clearError('reg_confirm');

    if (!reg.terms) {
      showNotification('Please agree to the Terms of Service', 'error');
      valid = false;
    }
    if (!valid) {
      showNotification('Please fill in all required fields correctly', 'error');
      return;
    }

    setIsSubmitting(true);
    const added = addUser({
      name: reg.name.trim(),
      email: reg.email.toLowerCase().trim(),
      countryCode: reg.countryCode,
      phone: reg.phone.trim(),
      password: reg.password
    });
    if (!added) {
      showNotification('An account with this email already exists.', 'error');
      setIsSubmitting(false);
      return;
    }

    const user = {
      name: reg.name.trim(),
      email: reg.email.toLowerCase().trim(),
      countryCode: reg.countryCode,
      phone: reg.phone.trim(),
      role: 'user'
    };
    setCurrentUser(user);
    addLoginActivity?.(user, { at: new Date().toISOString(), device: navigator.userAgent || 'Unknown device' });
    showNotification('Account created successfully! Redirecting...', 'success');
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/');
    }, 1000);
  };

  const fillDemo = () => {
    if (isLogin) {
      setIdentifier('admin@luxora.com');
      setPassword('admin123');
      showNotification('Demo credentials filled!', 'success');
    } else {
      const demoNames = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown'];
      const randomName = demoNames[Math.floor(Math.random() * demoNames.length)];
      const randomEmail = `demo${Date.now()}@luxora.com`;
      setReg({
        name: randomName,
        email: randomEmail,
        countryCode: '+234',
        phone: '8012345678',
        password: 'demo123',
        confirmPassword: 'demo123',
        terms: true
      });
      showNotification('Demo account data filled! Click "Create Account" to proceed.', 'info');
    }
  };

  const groupClass = (key) => `form-group ${errors[key] ? 'error' : ''} ${success[key] && !errors[key] ? 'success' : ''}`;

  return (
    <main>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2 id="form-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p id="form-subtitle">{isLogin ? 'Sign in to your LUXORA account' : 'Join LUXORA and start shopping'}</p>
          </div>

          {isLogin ? (
            <form id="login-form" className="auth-form" onSubmit={handleLogin}>
              <div className={groupClass('identifier')}>
                <label htmlFor="email">Email or Phone Number</label>
                <div className="input-group">
                  <i className="fas fa-user"></i>
                  <input
                    type="text"
                    id="email"
                    name="identifier"
                    placeholder="Enter your email or phone number"
                    required
                    value={identifier}
                    onChange={(e) => {
                      const value = e.target.value;
                      setIdentifier(value);
                      if (!value.trim()) return;
                      if ((value.includes('@') && validateEmail(value.trim())) || (!value.includes('@') && validatePhone(value.trim()))) {
                        clearError('identifier');
                        setSuccessField('identifier', true);
                      }
                    }}
                    onBlur={() => {
                      if (!identifier.trim()) setError('identifier', 'Email or phone is required');
                      else if (identifier.includes('@') && !validateEmail(identifier.trim())) setError('identifier', 'Please enter a valid email');
                      else if (!identifier.includes('@') && !validatePhone(identifier.trim())) setError('identifier', 'Please enter a valid phone number');
                      else {
                        clearError('identifier');
                        setSuccessField('identifier', true);
                      }
                    }}
                  />
                </div>
                {errors.identifier ? <div className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.identifier}</div> : null}
              </div>

              <div className={groupClass('password')}>
                <label htmlFor="password">Password</label>
                <div className="input-group">
                  <i className="fas fa-lock"></i>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validatePassword(e.target.value)) {
                        clearError('password');
                        setSuccessField('password', true);
                      }
                    }}
                    onBlur={() => {
                      if (!password) setError('password', 'Password is required');
                      else if (!validatePassword(password)) setError('password', 'Password must be at least 6 characters');
                      else {
                        clearError('password');
                        setSuccessField('password', true);
                      }
                    }}
                  />
                  <button type="button" className="password-toggle" id="password-toggle" aria-label={showLoginPassword ? 'Hide password' : 'Show password'} onClick={() => setShowLoginPassword((v) => !v)}>
                    <EyeIcon closed={showLoginPassword} />
                  </button>
                </div>
                {errors.password ? <div className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.password}</div> : null}
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); showNotification('Password reset feature coming soon! Please contact support.', 'info'); }}>
                  Forgot Password?
                </a>
              </div>

              <button type="submit" className="btn-primary btn-full" disabled={isSubmitting}>
                <span className="btn-text" style={{ display: isSubmitting ? 'none' : 'inline' }}>Sign In</span>
                <i className="fas fa-spinner fa-spin btn-loading" style={{ display: isSubmitting ? 'inline-block' : 'none' }}></i>
              </button>

              <div className="demo-info" onClick={fillDemo} style={{ cursor: 'pointer' }}>
                <p><i className="fas fa-info-circle"></i> Demo Credentials:</p>
                <p>Admin: admin@luxora.com | User: user@luxora.com</p>
                <p>Password: admin123 or user123</p>
              </div>
            </form>
          ) : (
            <form id="register-form" className="auth-form" onSubmit={handleRegister}>
              <div className={groupClass('reg_name')}>
                <label htmlFor="reg-name">Full Name</label>
                <div className="input-group">
                  <i className="fas fa-user"></i>
                  <input
                    type="text"
                    id="reg-name"
                    placeholder="Enter your full name"
                    required
                    value={reg.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setReg({ ...reg, name: value });
                      if (value.trim()) {
                        clearError('reg_name');
                        setSuccessField('reg_name', true);
                      }
                    }}
                    onBlur={() => {
                      if (!reg.name.trim()) setError('reg_name', 'Name is required');
                      else {
                        clearError('reg_name');
                        setSuccessField('reg_name', true);
                      }
                    }}
                  />
                </div>
                {errors.reg_name ? <div className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.reg_name}</div> : null}
              </div>

              <div className={groupClass('reg_email')}>
                <label htmlFor="reg-email">Email Address</label>
                <div className="input-group">
                  <i className="fas fa-envelope"></i>
                  <input
                    type="email"
                    id="reg-email"
                    placeholder="Enter your email"
                    required
                    value={reg.email}
                    onChange={(e) => {
                      const value = e.target.value;
                      setReg({ ...reg, email: value });
                      if (validateEmail(value.trim())) {
                        clearError('reg_email');
                        setSuccessField('reg_email', true);
                      }
                    }}
                    onBlur={() => {
                      if (!reg.email.trim()) setError('reg_email', 'Email is required');
                      else if (!validateEmail(reg.email.trim())) setError('reg_email', 'Please enter a valid email');
                      else {
                        clearError('reg_email');
                        setSuccessField('reg_email', true);
                      }
                    }}
                  />
                </div>
                {errors.reg_email ? <div className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.reg_email}</div> : null}
              </div>

              <div className={groupClass('reg_phone')}>
                <label htmlFor="reg-phone">Phone Number</label>
                <div className="input-group phone-group">
                  <select id="reg-country-code" required value={reg.countryCode} onChange={(e) => setReg({ ...reg, countryCode: e.target.value })}>
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
                  <input
                    type="tel"
                    id="reg-phone"
                    placeholder="Phone number"
                    required
                    value={reg.phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      setReg({ ...reg, phone: value });
                      if (validatePhone(value.trim())) {
                        clearError('reg_phone');
                        setSuccessField('reg_phone', true);
                      }
                    }}
                    onBlur={() => {
                      if (!reg.phone.trim()) setError('reg_phone', 'Phone number is required');
                      else if (!validatePhone(reg.phone.trim())) setError('reg_phone', 'Enter a valid phone number');
                      else {
                        clearError('reg_phone');
                        setSuccessField('reg_phone', true);
                      }
                    }}
                  />
                </div>
                {errors.reg_phone ? <div className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.reg_phone}</div> : null}
              </div>

              <div className={groupClass('reg_password')}>
                <label htmlFor="reg-password">Password</label>
                <div className="input-group">
                  <i className="fas fa-lock"></i>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    id="reg-password"
                    placeholder="Create a password"
                    required
                    value={reg.password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setReg({ ...reg, password: value });
                      if (validatePassword(value.trim())) {
                        clearError('reg_password');
                        setSuccessField('reg_password', true);
                      }
                    }}
                    onBlur={() => {
                      if (!reg.password.trim()) setError('reg_password', 'Password is required');
                      else if (!validatePassword(reg.password.trim())) setError('reg_password', 'Password must be at least 6 characters');
                      else {
                        clearError('reg_password');
                        setSuccessField('reg_password', true);
                      }
                    }}
                  />
                  <button type="button" className="password-toggle" aria-label={showRegPassword ? 'Hide password' : 'Show password'} onClick={() => setShowRegPassword((v) => !v)}>
                    <EyeIcon closed={showRegPassword} />
                  </button>
                </div>
                {errors.reg_password ? <div className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.reg_password}</div> : null}
              </div>

              <div className={groupClass('reg_confirm')}>
                <label htmlFor="reg-confirm-password">Confirm Password</label>
                <div className="input-group">
                  <i className="fas fa-lock"></i>
                  <input
                    type={showRegConfirm ? 'text' : 'password'}
                    id="reg-confirm-password"
                    placeholder="Confirm your password"
                    required
                    value={reg.confirmPassword}
                    onChange={(e) => {
                      const value = e.target.value;
                      setReg({ ...reg, confirmPassword: value });
                      if (value && value === reg.password) {
                        clearError('reg_confirm');
                        setSuccessField('reg_confirm', true);
                      }
                    }}
                    onBlur={() => {
                      if (!reg.confirmPassword.trim()) setError('reg_confirm', 'Please confirm your password');
                      else if (reg.confirmPassword !== reg.password) setError('reg_confirm', 'Passwords do not match');
                      else {
                        clearError('reg_confirm');
                        setSuccessField('reg_confirm', true);
                      }
                    }}
                  />
                  <button type="button" className="password-toggle" aria-label={showRegConfirm ? 'Hide password' : 'Show password'} onClick={() => setShowRegConfirm((v) => !v)}>
                    <EyeIcon closed={showRegConfirm} />
                  </button>
                </div>
                {errors.reg_confirm ? <div className="error-message"><i className="fas fa-exclamation-circle"></i> {errors.reg_confirm}</div> : null}
              </div>

              <div className="form-group">
                <label className="terms-agreement">
                  <input type="checkbox" checked={reg.terms} onChange={(e) => setReg({ ...reg, terms: e.target.checked })} />
                  <span className="checkmark"></span>
                  I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                </label>
              </div>

              <button type="submit" className="btn-primary btn-full" disabled={isSubmitting}>
                <span className="btn-text" style={{ display: isSubmitting ? 'none' : 'inline' }}>Create Account</span>
                <i className="fas fa-spinner fa-spin btn-loading" style={{ display: isSubmitting ? 'inline-block' : 'none' }}></i>
              </button>
              <button type="button" className="btn-secondary btn-full demo-account-btn" disabled={isSubmitting} onClick={fillDemo} style={{ marginTop: '1rem' }}>
                <span className="btn-text">Create Demo Account</span>
              </button>
            </form>
          )}

          <div className="form-footer">
            <p id="switch-form-text">
              {isLogin ? 'Don\'t have an account? ' : 'Already have an account? '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }}>
                {isLogin ? 'Create one' : 'Sign in'}
              </a>
            </p>
          </div>

          <div className="social-login">
            <div className="divider">
              <span>Or continue with</span>
            </div>
            <div className="social-buttons">
              <button className="social-btn" data-provider="google" onClick={(e) => { e.preventDefault(); showNotification('Google login coming soon!', 'info'); }}>
                <i className="fab fa-google"></i>
                Google
              </button>
              <button className="social-btn" data-provider="facebook" onClick={(e) => { e.preventDefault(); showNotification('Facebook login coming soon!', 'info'); }}>
                <i className="fab fa-facebook"></i>
                Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
