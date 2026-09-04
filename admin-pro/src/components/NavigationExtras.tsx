import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, CircleXIcon, HomeIcon, LayersIcon, XIcon } from 'lucide-react';
import type { TabsStyle } from '../types';
import { localizeNavLabel, useLocale } from '../hooks/useLocale';

interface PageTab {
  path: string;
  label: string;
}

interface TabContextMenu {
  tab: PageTab;
  x: number;
  y: number;
}

const TAB_STORAGE_KEY = 'zf-admin.page-tabs';

const ROUTE_LABELS: Record<string, string> = {
  '/': '数据概览',
  '/users': '用户管理',
  '/hosts': '房东管理',
  '/houses': '房源管理',
  '/orders': '订单管理',
  '/feedbacks': '反馈管理',
  '/banners': '轮播图管理',
  '/login': '登录',
  '/error/403': '403 无权限',
  '/error/404': '404 不存在',
  '/error/500': '500 服务异常',
};

function labelFor(path: string) {
  return ROUTE_LABELS[path] ?? path.split('/').filter(Boolean).pop() ?? '页面';
}

function loadTabs(current: PageTab): PageTab[] {
  try {
    const raw = sessionStorage.getItem(TAB_STORAGE_KEY);
    const saved = raw
      ? (JSON.parse(raw) as PageTab[]).map(tab => ({ ...tab, label: labelFor(tab.path) }))
      : [{ path: '/', label: '数据概览' }];
    const tabs = saved.some(tab => tab.path === current.path) ? saved : [...saved, current];
    sessionStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(tabs.slice(-10)));
    return tabs.slice(-10);
  } catch {
    return [{ path: '/', label: '数据概览' }, current].filter((tab, index, list) => list.findIndex(item => item.path === tab.path) === index);
  }
}

export function BreadcrumbTrail() {
  const location = useLocation();
  const { locale } = useLocale();
  const label = labelFor(location.pathname);
  return (
    <div className="flex h-9 items-center gap-1.5 border-b px-5 text-xs" style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
      <HomeIcon size={13} />
      <ChevronRightIcon size={13} />
      <span style={{ color: 'var(--foreground)' }}>{localizeNavLabel(label, locale)}</span>
    </div>
  );
}

export function PageTabs({ style }: { style: TabsStyle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { locale, t } = useLocale();
  const current = { path: location.pathname, label: labelFor(location.pathname) };
  const [tabs, setTabs] = useState<PageTab[]>(() => loadTabs(current));
  const [contextMenu, setContextMenu] = useState<TabContextMenu | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const persist = (nextTabs: PageTab[]) => {
    setTabs(nextTabs);
    try { sessionStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(nextTabs)); } catch { /* storage is optional */ }
  };

  const closeTab = (event: MouseEvent, tab: PageTab) => {
    event.stopPropagation();
    if (tab.path === '/') return;
    closePaths([tab.path]);
  };

  const closePaths = (paths: string[]) => {
    const pathSet = new Set(paths.filter(path => path !== '/'));
    const nextTabs = tabs.filter(tab => !pathSet.has(tab.path));
    persist(nextTabs);
    if (!nextTabs.some(tab => tab.path === location.pathname)) navigate(nextTabs[nextTabs.length - 1]?.path ?? '/');
  };

  const showContextMenu = (event: MouseEvent<HTMLButtonElement>, tab: PageTab) => {
    event.preventDefault();
    const menuWidth = 190;
    const menuHeight = 220;
    setContextMenu({
      tab,
      x: Math.max(8, Math.min(event.clientX, window.innerWidth - menuWidth - 8)),
      y: Math.max(8, Math.min(event.clientY, window.innerHeight - menuHeight - 8)),
    });
  };

  useEffect(() => {
    if (!contextMenu) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!contextMenuRef.current?.contains(event.target as Node)) setContextMenu(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setContextMenu(null);
    };
    const closeOnResize = () => setContextMenu(null);
    document.addEventListener('pointerdown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnResize);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeOnResize);
    };
  }, [contextMenu]);

  const isCard = style === 'card';
  const isChrome = style === 'chrome';
  return (
    <div className="flex min-h-10 items-end gap-1 overflow-x-auto border-b px-3 pt-1" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      {tabs.map(tab => {
        const active = tab.path === location.pathname;
        return (
          <button
            key={tab.path}
            type="button"
            onClick={() => navigate(tab.path)}
            onContextMenu={event => showContextMenu(event, tab)}
            className="group flex h-8 shrink-0 items-center gap-1.5 px-3 text-xs transition-colors"
            style={{
              background: active ? (isCard || isChrome ? 'var(--accent)' : 'transparent') : 'transparent',
              color: active ? (isCard || isChrome ? 'var(--accent-foreground)' : 'var(--primary)') : 'var(--muted-foreground)',
              border: isCard ? `1px solid ${active ? 'var(--primary)' : 'var(--border)'}` : isChrome ? '1px solid transparent' : 'none',
              borderBottom: !isCard && !isChrome ? (active ? '2px solid var(--primary)' : '2px solid transparent') : 'none',
              borderRadius: isCard ? '7px 7px 0 0' : isChrome ? '999px' : '0',
              fontWeight: active ? 700 : 500,
            }}
          >
            <span>{localizeNavLabel(tab.label, locale)}</span>
            {tab.path !== '/' && <XIcon size={12} className="opacity-55 transition-opacity group-hover:opacity-100" onClick={event => closeTab(event, tab)} />}
          </button>
        );
      })}
      {contextMenu && (() => {
        const tabIndex = tabs.findIndex(tab => tab.path === contextMenu.tab.path);
        const closeLeft = tabs.slice(0, tabIndex).filter(tab => tab.path !== '/').map(tab => tab.path);
        const closeRight = tabs.slice(tabIndex + 1).filter(tab => tab.path !== '/').map(tab => tab.path);
        const closeOthers = tabs.filter(tab => tab.path !== '/' && tab.path !== contextMenu.tab.path).map(tab => tab.path);
        const menuItems = [
          { label: t('closeTab'), icon: <XIcon size={15} />, paths: contextMenu.tab.path === '/' ? [] : [contextMenu.tab.path] },
          { label: t('closeLeftTabs'), icon: <ChevronLeftIcon size={15} />, paths: closeLeft },
          { label: t('closeRightTabs'), icon: <ChevronRightIcon size={15} />, paths: closeRight },
          { label: t('closeOtherTabs'), icon: <LayersIcon size={15} />, paths: closeOthers },
          { label: t('closeAllTabs'), icon: <CircleXIcon size={15} />, paths: tabs.filter(tab => tab.path !== '/').map(tab => tab.path) },
        ];
        return (
          <div
            ref={contextMenuRef}
            role="menu"
            aria-label={t('tabActions')}
            style={{ position: 'fixed', zIndex: 80, left: contextMenu.x, top: contextMenu.y, width: 190, padding: 5, background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 7, boxShadow: '0 12px 30px rgba(0,0,0,.16)' }}
          >
            {menuItems.map((item, index) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.paths.length === 0}
                onClick={() => {
                  setContextMenu(null);
                  closePaths(item.paths);
                }}
                style={{ display: 'flex', width: '100%', height: 34, alignItems: 'center', gap: 9, padding: '0 9px', color: index === menuItems.length - 1 ? 'var(--destructive)' : 'var(--foreground)', background: 'transparent', border: 'none', borderRadius: 5, cursor: item.paths.length ? 'pointer' : 'not-allowed', fontSize: 12, opacity: item.paths.length ? 1 : .42, textAlign: 'left' }}
                onMouseEnter={event => { if (item.paths.length) event.currentTarget.style.background = 'var(--accent)'; }}
                onMouseLeave={event => { event.currentTarget.style.background = 'transparent'; }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
