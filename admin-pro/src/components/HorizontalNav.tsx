import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { localizeNavLabel, useLocale } from '../hooks/useLocale';
import {
  LayoutDashboardIcon,
  FileTextIcon,
  FolderIcon,
  FolderOpenIcon,
  TagIcon,
  BarChart2Icon,
  UsersIcon,
  FunnelIcon,
  ImageIcon,
  TicketIcon,
  ZapIcon,
  BellIcon,
  ShoppingCartIcon,
  ShieldIcon,
  MessageSquareIcon,
  SettingsIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  MenuIcon,
  ListIcon,
  ScrollTextIcon,
  BookOpenIcon,
  SlidersIcon,
  SparklesIcon,
} from 'lucide-react';

interface NavChild { label: string; path: string; icon: React.ReactNode; }
interface NavGroup { type: 'group'; id: string; icon: React.ReactNode; label: string; children: NavChild[]; }
interface NavLinkItem { type: 'link'; id: string; icon: React.ReactNode; label: string; path: string; }
type NavItem = NavGroup | NavLinkItem;

const NAV_ITEMS: NavItem[] = [
  { type: 'link', id: 'dashboard', icon: <LayoutDashboardIcon size={14} />, label: '数据概览', path: '/' },
  { type: 'link', id: 'users', icon: <UsersIcon size={14} />, label: '用户管理', path: '/users' },
  { type: 'link', id: 'hosts', icon: <ShieldCheckIcon size={14} />, label: '房东管理', path: '/hosts' },
  { type: 'link', id: 'houses', icon: <HomeIcon size={14} />, label: '房源管理', path: '/houses' },
  { type: 'link', id: 'orders', icon: <ClipboardListIcon size={14} />, label: '订单管理', path: '/orders' },
  { type: 'link', id: 'feedbacks', icon: <MessageSquareIcon size={14} />, label: '反馈管理', path: '/feedbacks' },
  { type: 'link', id: 'banners', icon: <ImageIcon size={14} />, label: '轮播图管理', path: '/banners' },
];

export default function HorizontalNav() {
  const { themeState } = useTheme();
  const { locale } = useLocale();
  const location = useLocation();
  const [openId, setOpenId] = useState<string | null>(null);

  const primaryColor = 'var(--primary)';

  const groupHasActive = (children: NavChild[]) =>
    children.some(c => location.pathname === c.path);

  return (
    <div data-cmp="HorizontalNav" style={{ display: 'flex', alignItems: 'center', gap: '2px', overflowX: 'auto', overflowY: 'visible', height: '100%', position: 'relative', zIndex: 200 }}>
      {NAV_ITEMS.map(item => {
        if (item.type === 'link') {
          const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/');
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0 10px',
                height: '40px',
                borderRadius: '0',
                fontSize: '12px',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? primaryColor : 'var(--foreground)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                borderBottom: isActive ? `2px solid ${primaryColor}` : '2px solid transparent',
                transition: 'all 0.2s',
                flexShrink: 0,
                background: 'transparent',
              }}
            >
              {item.icon}
              <span>{localizeNavLabel(item.label, locale)}</span>
            </NavLink>
          );
        }

        // Group
        const hasActive = groupHasActive(item.children);
        const isOpen = openId === item.id;

        return (
          <div
            key={item.id}
            style={{ position: 'relative', height: '40px', flexShrink: 0 }}
            onMouseEnter={() => setOpenId(item.id)}
            onMouseLeave={() => setOpenId(null)}
          >
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0 10px',
                height: '40px',
                fontSize: '12px',
                fontWeight: hasActive ? 700 : 400,
                color: hasActive ? primaryColor : 'var(--foreground)',
                background: 'transparent',
                border: 'none',
                borderBottom: hasActive ? `2px solid ${primaryColor}` : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {item.icon}
              <span>{localizeNavLabel(item.label, locale)}</span>
              <span style={{ fontSize: '9px', marginLeft: '1px', opacity: 0.5 }}>▼</span>
            </button>

            {/* Dropdown */}
            <div
              style={{
                position: 'absolute',
                top: '40px',
                left: '0',
                minWidth: '140px',
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                zIndex: 300,
                padding: '4px 0',
                opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? 'auto' : 'none',
                transform: isOpen ? 'translateY(0)' : 'translateY(-6px)',
                transition: 'opacity 0.18s ease, transform 0.18s ease',
              }}
            >
              {item.children.map(child => {
                const childActive = location.pathname === child.path;
                return (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 14px',
                      fontSize: '12px',
                      color: childActive ? primaryColor : 'var(--foreground)',
                      fontWeight: childActive ? 600 : 400,
                      background: childActive ? 'var(--accent)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'background 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={() => setOpenId(null)}
                  >
                    {child.icon}
                    <span>{localizeNavLabel(child.label, locale)}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
