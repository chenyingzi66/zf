import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { LocaleProvider } from './hooks/useLocale';
import { PendingCountsProvider } from './hooks/usePendingCounts';
import { Toaster } from 'sonner';
import LegacyTextLocalizer from './components/LegacyTextLocalizer';
import { RedirectIfAuthenticated, RequireAuth } from './components/RequireAuth';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserPage from './pages/UserPage';
import HostPage from './pages/HostPage';
import HousePage from './pages/HousePage';
import OrderPage from './pages/OrderPage';
import FeedbackPage from './pages/FeedbackPage';
import BannerPage from './pages/BannerPage';
import Page403 from './pages/error/Page403';
import Page404 from './pages/error/Page404';
import Page500 from './pages/error/Page500';

/** 请求层遇到 code 401 时会派发 ao-auth-required,这里统一跳登录 */
function AuthenticationExpiryRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToLogin = () => navigate('/login', { replace: true });
    window.addEventListener('ao-auth-required', redirectToLogin);
    return () => window.removeEventListener('ao-auth-required', redirectToLogin);
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AuthenticationExpiryRedirect />
          <Toaster position="top-right" richColors />
          <LegacyTextLocalizer />
          <PendingCountsProvider>
            <Routes>
              <Route path="/login" element={<RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>} />
              <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
              <Route path="/users" element={<RequireAuth><UserPage /></RequireAuth>} />
              <Route path="/hosts" element={<RequireAuth><HostPage /></RequireAuth>} />
              <Route path="/houses" element={<RequireAuth><HousePage /></RequireAuth>} />
              <Route path="/orders" element={<RequireAuth><OrderPage /></RequireAuth>} />
              <Route path="/feedbacks" element={<RequireAuth><FeedbackPage /></RequireAuth>} />
              <Route path="/banners" element={<RequireAuth><BannerPage /></RequireAuth>} />
              <Route path="/error/403" element={<Page403 />} />
              <Route path="/error/404" element={<Page404 />} />
              <Route path="/error/500" element={<Page500 />} />
              <Route path="*" element={<Page404 />} />
            </Routes>
          </PendingCountsProvider>
        </BrowserRouter>
      </ThemeProvider>
    </LocaleProvider>
  );
}
