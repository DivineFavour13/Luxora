import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header.jsx';
import { ensureNotificationContainer } from '../utils/notifications.js';

export default function Layout() {
  const location = useLocation();

  useEffect(() => {
    ensureNotificationContainer();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
