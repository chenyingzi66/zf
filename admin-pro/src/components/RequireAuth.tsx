/**
 * 未登录守卫。模版本身没有路由守卫,这里补上:
 * 无 token 访问业务页 → 跳 /login;已登录访问 /login → 跳首页。
 */
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { isAuthenticated } from '../api';

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  if (isAuthenticated()) return <Navigate to="/" replace />;
  return <>{children}</>;
}
