import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
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
  MessageSquareIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  MenuIcon,
  ListIcon,
  ScrollTextIcon,
  BookOpenIcon,
  SlidersIcon,
  SparklesIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ServerIcon,
  PuzzleIcon,
  MousePointerClickIcon,
  FormInputIcon,
  TableIcon,
  MessageSquareWarningIcon,
  LayoutGridIcon,
  NavigationIcon,
  LayoutTemplateIcon,
  CreditCardIcon,
  PanelTopIcon,
  LineChartIcon,
  CalendarIcon,
  MessageCircleIcon,
  BadgeDollarSignIcon,
  MapIcon,
  SmileIcon,
  HashIcon,
  TypeIcon,
  CropIcon,
  QrCodeIcon,
  PlayCircleIcon,
  GripVerticalIcon,
  MousePointer2Icon,
  DropletsIcon,
  GalleryVerticalIcon,
  PartyPopperIcon,
  FileSpreadsheetIcon,
  LayersIcon,
  CheckCircle2Icon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  ShieldOffIcon,
  SearchXIcon,
  ServerCrashIcon,
  CloudIcon,
  SearchIcon,
  WorkflowIcon,
  PanelsTopLeftIcon,
  DatabaseIcon,
  SendIcon,
  BotIcon,
  Settings2Icon,
  ClipboardListIcon,
  ChartNoAxesCombinedIcon,
  PrinterIcon,
  FileCode2Icon,
  LogOutIcon,
} from 'lucide-react';
import type { CollapseButtonPosition } from '../types';
import { localizeNavLabel, useLocale } from '../hooks/useLocale';
import { usePendingCounts } from '../hooks/usePendingCounts';
import { clearAuth } from '../api';
import { getCurrentAccount } from '../lib/currentAccount';
import { toast } from '../lib/localizedToast';
import appConfig from '../config/app.json';

/** 侧栏角标:房源待审核 / 订单待处理,复刻旧界面 index.html:199,203 */
type BadgeKey = 'pendingHouse' | 'pendingOrder';

function useBadgeCount(badgeKey?: BadgeKey): number {
  const { pendingHouse, pendingOrder } = usePendingCounts();
  if (badgeKey === 'pendingHouse') return pendingHouse;
  if (badgeKey === 'pendingOrder') return pendingOrder;
  return 0;
}

/** 展开态的数字角标 */
function NavBadge({ badgeKey }: { badgeKey?: BadgeKey }) {
  const count = useBadgeCount(badgeKey);
  if (!count) return null;
  return (
    <span
      style={{
        flexShrink: 0, minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9,
        background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

/** 收起态只显示一个小红点 */
function NavDot({ badgeKey }: { badgeKey?: BadgeKey }) {
  const count = useBadgeCount(badgeKey);
  if (!count) return null;
  return (
    <span
      style={{
        position: 'absolute', top: -2, right: -3, width: 7, height: 7,
        borderRadius: '50%', background: '#ef4444',
      }}
    />
  );
}

interface NavChild { label: string; path: string; icon: React.ReactNode; disabled?: boolean; }
interface NavGroup { type: 'group'; icon: React.ReactNode; label: string; children: NavChild[]; }
interface NavLinkItem { type: 'link'; icon: React.ReactNode; label: string; path: string; disabled?: boolean; badgeKey?: BadgeKey; }
type NavItem = NavGroup | NavLinkItem;

/** Compose the class string for nav entries, covering active and disabled states. */
const navItemClass = (base: string, isActive: boolean, disabled?: boolean): string =>
  `${base}${isActive ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}`;

interface SidebarProps {
  collapsed?: boolean;
  doubleColumn?: boolean;
  collapseButtonPosition?: CollapseButtonPosition;
  onToggle?: () => void;
  showToggle?: boolean;
  sidebarWidth?: number;
}

export const NAV_ITEMS: NavItem[] = [
  { type: 'link', icon: <LayoutDashboardIcon size={16} />, label: '数据概览', path: '/' },
  { type: 'link', icon: <UsersIcon size={16} />, label: '用户管理', path: '/users' },
  { type: 'link', icon: <ShieldCheckIcon size={16} />, label: '房东管理', path: '/hosts' },
  { type: 'link', icon: <HomeIcon size={16} />, label: '房源管理', path: '/houses', badgeKey: 'pendingHouse' },
  { type: 'link', icon: <ClipboardListIcon size={16} />, label: '订单管理', path: '/orders', badgeKey: 'pendingOrder' },
  { type: 'link', icon: <MessageSquareIcon size={16} />, label: '反馈管理', path: '/feedbacks' },
  { type: 'link', icon: <ImageIcon size={16} />, label: '轮播图管理', path: '/banners' },
];

/** Resolve sidebar CSS inline styles based on menuStyle + mode */
function resolveSidebarStyles(menuStyle: string, mode: string): React.CSSProperties {
  if (menuStyle === 'light' && mode === 'light') {
    return {
      background: '#FFFFFF',
      '--sidebar-foreground': '#303133',
      '--sidebar-border': '#E5E7EB',
      '--sidebar-accent': 'rgba(0, 0, 0, 0.045)',
      '--sidebar-accent-foreground': '#1D4ED8',
    } as React.CSSProperties;
  }
  if (menuStyle === 'dark') {
    return {
      background: '#1E1E1E',
      '--sidebar-foreground': '#FFFFFF',
      '--sidebar-border': 'rgba(255,255,255,0.08)',
      '--sidebar-accent': 'rgba(255,255,255,0.07)',
      '--sidebar-accent-foreground': '#FFFFFF',
    } as React.CSSProperties;
  }
  return {};
}

// ─── Icon-only column (64px) for double layout ────────────────────────────────
function IconColumn({
  sidebarStyles,
  selectedGroup,
  onSelectGroup,
  menuStyle,
}: {
  sidebarStyles: React.CSSProperties;
  selectedGroup: string | null;
  onSelectGroup: (label: string | null) => void;
  menuStyle: string;
}) {
  const location = useLocation();
  const { locale } = useLocale();
  const bgStyle: React.CSSProperties = {
    width: '64px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--sidebar-border)',
    overflow: 'hidden',
    flexShrink: 0,
    background: 'var(--sidebar)',
    ...sidebarStyles,
  };

  const isGroupActive = (item: NavItem) => {
    if (item.type === 'group') {
      return item.children.some(c => location.pathname === c.path);
    }
    return false;
  };

  return (
    <div style={{ ...bgStyle, background: bgStyle.background ?? 'var(--sidebar)' }}>
      <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--sidebar-border)', flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--sidebar-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--sidebar-primary-foreground)', fontWeight: 700 }}>
          {appConfig.brand.shortName}
        </div>
      </div>
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 6px' }}>
        {NAV_ITEMS.map(item => {
          if (item.type === 'link') {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                title={localizeNavLabel(item.label, locale)}
                className={({ isActive }) => navItemClass('sidebar-l2-icon', isActive, item.disabled)}
                style={{ width: '100%', justifyContent: 'center', marginBottom: 4 }}
                onClick={() => onSelectGroup(null)}
              >
                <span style={{ position: 'relative', display: 'inline-flex' }}>
                  {item.icon}
                  <NavDot badgeKey={item.badgeKey} />
                </span>
              </NavLink>
            );
          }
          const hasActive = isGroupActive(item);
          const isSelected = selectedGroup === item.label;
          return (
            <button
              key={item.label}
              title={localizeNavLabel(item.label, locale)}
              onClick={() => onSelectGroup(isSelected ? null : item.label)}
              className={'sidebar-l2-icon ' + (hasActive || isSelected ? 'is-active' : '')}
              style={{ width: '100%', justifyContent: 'center', marginBottom: 4, cursor: 'pointer' }}
            >
              {item.icon}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ─── Sub-menu column (176px) for double layout ────────────────────────────────
function SubMenuColumn({
  selectedGroup,
  sidebarStyles,
  menuStyle,
}: {
  selectedGroup: string | null;
  sidebarStyles: React.CSSProperties;
  menuStyle: string;
}) {
  const location = useLocation();
  const { locale } = useLocale();
  const activeItem = NAV_ITEMS.find(
    item => item.type === 'group' && item.label === selectedGroup,
  ) as NavGroup | undefined;

  const subBg: React.CSSProperties = {
    width: '176px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid var(--sidebar-border)',
    overflow: 'hidden',
    flexShrink: 0,
    transition: 'opacity 0.15s ease, transform 0.15s ease',
    opacity: activeItem ? 1 : 0,
    pointerEvents: activeItem ? 'auto' : 'none',
    transform: activeItem ? 'translateX(0)' : 'translateX(-8px)',
    background: 'var(--sidebar)',
    ...sidebarStyles,
  };

  return (
    <div style={{ ...subBg, background: subBg.background ?? 'var(--sidebar)' }}>
      <div style={{ height: '64px', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid var(--sidebar-border)', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--sidebar-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {activeItem ? localizeNavLabel(activeItem.label, locale) : ''}
        </span>
      </div>
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
        {(activeItem?.children ?? []).map(child => {
          const isActive = location.pathname === child.path;
          return (
            <NavLink
              key={child.path}
              to={child.path}
              className={navItemClass('sidebar-l2', isActive, child.disabled)}
              style={{ marginBottom: 2 }}
            >
              <span style={{ flexShrink: 0 }}>{child.icon}</span>
              <span style={{ flex: 1 }}>{localizeNavLabel(child.label, locale)}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

// ─── Logo row with inline collapse button (sidebar-top variant) ───────────────
// The collapse control appears before the brand. In the narrow state it is the
// sole header control, leaving a dependable target for expanding the sidebar.
function LogoRowWithCollapseTop({
  collapsed,
  onToggle,
  showToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
  showToggle: boolean;
}) {
  return (
    <div
      style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        padding: collapsed ? '0' : '0 14px',
        borderBottom: '1px solid var(--sidebar-border)',
        flexShrink: 0,
        gap: '8px',
        overflow: 'hidden',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}
    >
      {/* Collapse toggle — before the logo and title */}
      {showToggle && <button
        onClick={onToggle}
        title={collapsed ? '展开侧边栏' : '收起侧边栏'}
        style={{
          width: 26,
          height: 26,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: '1px solid var(--sidebar-border)',
          cursor: 'pointer',
          color: 'var(--sidebar-foreground)',
          opacity: collapsed ? 0.55 : 0.65,
          transition: 'opacity 0.15s, background 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--sidebar-accent)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = collapsed ? '0.55' : '0.65'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
      >
        <MenuIcon size={15} />
      </button>}

      {(!collapsed || !showToggle) && (
        <>
          {/* Logo icon */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'var(--sidebar-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 12,
              color: 'var(--sidebar-primary-foreground)',
              fontWeight: 700,
            }}
          >
            {appConfig.brand.shortName}
          </div>

          <span
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--sidebar-foreground)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {appConfig.brand.name}
          </span>
        </>
      )}
    </div>
  );
}

// ─── Collapse toggle button row (sidebar-bottom variant) ──────────────────────
function CollapseBarBottom({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title={collapsed ? '展开侧边栏' : '收起侧边栏'}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        background: 'transparent',
        border: 'none',
        borderTop: '1px solid var(--sidebar-border)',
        cursor: 'pointer',
        color: 'var(--sidebar-foreground)',
        opacity: 0.6,
        transition: 'opacity 0.15s',
        flexShrink: 0,
        fontSize: '12px',
        fontWeight: 500,
      }}
    >
      {collapsed ? <ChevronsRightIcon size={14} /> : <ChevronsLeftIcon size={14} />}
      {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>收起侧边栏</span>}
    </button>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export default function Sidebar({
  collapsed = false,
  doubleColumn = false,
  collapseButtonPosition = 'topbar',
  onToggle = () => {},
  showToggle = true,
  sidebarWidth = 230,
}: SidebarProps) {
  const { themeState } = useTheme();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const account = getCurrentAccount();
  const { menuStyle, mode, sidebarAccordion } = themeState;
  const location = useLocation();

  // Compute which group label contains the current path
  const activeGroupLabel = (() => {
    for (const item of NAV_ITEMS) {
      if (item.type === 'group' && item.children.some(c => c.path === location.pathname)) {
        return item.label;
      }
    }
    return null;
  })();

  // Initialize openGroups: only the group containing the current route is open
  const buildInitialOpen = () => {
    const state: Record<string, boolean> = {};
    for (const item of NAV_ITEMS) {
      if (item.type === 'group') {
        state[item.label] = item.children.some(c => c.path === location.pathname);
      }
    }
    return state;
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(buildInitialOpen);
  const [lastPathname, setLastPathname] = useState(location.pathname);

  // Keep the active section open when navigation changes routes. The guard makes
  // this a one-time state adjustment for each new path and preserves manual
  // expand/collapse choices while remaining on the current page.
  if (lastPathname !== location.pathname) {
    setLastPathname(location.pathname);
    if (activeGroupLabel) {
      setOpenGroups(prev => {
        if (prev[activeGroupLabel]) return prev; // already open, no update needed
        return { ...prev, [activeGroupLabel]: true };
      });
    }
  }

  // Toggle a group: clicking the active-path group toggles it; clicking another group
  // opens it and closes all others (mutual exclusion).
  const toggleGroup = (label: string) => {
    setOpenGroups(prev => {
      const isCurrentlyOpen = prev[label] ?? false;
      if (!sidebarAccordion) return { ...prev, [label]: !isCurrentlyOpen };
      const next: Record<string, boolean> = {};
      for (const key of Object.keys(prev)) {
        next[key] = false;
      }
      next[label] = !isCurrentlyOpen;
      return next;
    });
  };

  const [selectedGroup, setSelectedGroup] = useState<string | null>(activeGroupLabel);

  const groupHasActive = (children: NavChild[]) =>
    children.some(c => location.pathname === c.path);

  const sidebarInlineStyles = resolveSidebarStyles(menuStyle, mode);

  // ── Double column layout ─────────────────────────────────────────────────
  if (doubleColumn) {
    return (
      <div
        className="sidebar-root"
        data-cmp="Sidebar"
        style={{ display: 'flex', height: '100%', flexShrink: 0 }}
      >
        <IconColumn
          sidebarStyles={sidebarInlineStyles}
          selectedGroup={selectedGroup}
          onSelectGroup={setSelectedGroup}
          menuStyle={menuStyle}
        />
        <SubMenuColumn
          selectedGroup={selectedGroup}
          sidebarStyles={sidebarInlineStyles}
          menuStyle={menuStyle}
        />
      </div>
    );
  }

  // ── Icon-only (mixed / collapsed vertical) ───────────────────────────────
  if (collapsed) {
    return (
      <div className="sidebar-root h-full flex-shrink-0" data-cmp="Sidebar" style={{ display: 'flex' }}>
        <aside
          style={{
            width: '64px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--sidebar-border)',
            transition: 'width 0.2s ease',
            overflow: 'hidden',
            background: 'var(--sidebar)',
            ...sidebarInlineStyles,
          }}
        >
          {/* Logo — sidebar-top shows integrated collapse button in logo row, others show plain icon */}
          {collapseButtonPosition === 'sidebar-top' ? (
            <LogoRowWithCollapseTop collapsed={true} onToggle={onToggle} showToggle={showToggle} />
          ) : (
            <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--sidebar-border)', flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--sidebar-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--sidebar-primary-foreground)', fontWeight: 700 }}>
                {appConfig.brand.shortName}
              </div>
            </div>
          )}

          <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 6px' }}>
            {NAV_ITEMS.map(item => {
              if (item.type === 'link') {
                return (
                  <div key={item.path} style={{ marginBottom: 4 }}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      title={localizeNavLabel(item.label, locale)}
                      className={({ isActive }) => navItemClass('sidebar-l2-icon', isActive, item.disabled)}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <span style={{ position: 'relative', display: 'inline-flex' }}>
                        {item.icon}
                        <NavDot badgeKey={item.badgeKey} />
                      </span>
                    </NavLink>
                  </div>
                );
              }
              return (
                <div key={item.label} style={{ marginBottom: 4 }}>
                  {item.children.map(child => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      title={localizeNavLabel(child.label, locale)}
                      className={({ isActive }) => navItemClass('sidebar-l2-icon', isActive, child.disabled)}
                      style={{ width: '100%', justifyContent: 'center', marginBottom: 2 }}
                    >
                      {child.icon}
                    </NavLink>
                  ))}
                </div>
              );
            })}
          </nav>

          {/* sidebar-bottom: collapse bar above user footer */}
          {showToggle && collapseButtonPosition === 'sidebar-bottom' && (
            <CollapseBarBottom collapsed={true} onToggle={onToggle} />
          )}
        </aside>
      </div>
    );
  }

  // ── Full vertical sidebar ─────────────────────────────────────────────────
  return (
    <div className="sidebar-root h-full flex-shrink-0" data-cmp="Sidebar" style={{ display: 'flex' }}>
      <aside
        style={{
          width: `${sidebarWidth}px`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--sidebar-border)',
          transition: 'width 0.2s ease',
          overflow: 'hidden',
          background: 'var(--sidebar)',
          ...sidebarInlineStyles,
        }}
      >
        {/* Logo area — sidebar-top integrates collapse button in same row */}
        {collapseButtonPosition === 'sidebar-top' ? (
          <LogoRowWithCollapseTop collapsed={false} onToggle={onToggle} showToggle={showToggle} />
        ) : (
          <div style={{ height: '64px', display: 'flex', alignItems: 'center', padding: '0 14px', borderBottom: '1px solid var(--sidebar-border)', flexShrink: 0, gap: '8px', overflow: 'hidden' }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--sidebar-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, color: 'var(--sidebar-primary-foreground)', fontWeight: 700 }}>
              {appConfig.brand.shortName}
            </div>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--sidebar-foreground)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {appConfig.brand.name}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 6px' }}>
          {NAV_ITEMS.map(item => {
            if (item.type === 'link') {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => navItemClass('sidebar-l1', isActive, item.disabled)}
                  style={{ marginBottom: 2 }}
                >
                  <span style={{ flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{localizeNavLabel(item.label, locale)}</span>
                  <NavBadge badgeKey={item.badgeKey} />
                </NavLink>
              );
            }

            const isOpen = openGroups[item.label] ?? false;
            const hasActive = groupHasActive(item.children);

            return (
              <div key={item.label} style={{ marginBottom: 2 }}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  aria-expanded={isOpen}
                  className={'sidebar-l1 ' + (hasActive ? 'has-active-child' : '')}
                  style={{ marginBottom: 2 }}
                >
                  <span style={{ flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{localizeNavLabel(item.label, locale)}</span>
                  <span style={{ flexShrink: 0, color: 'var(--sidebar-foreground)', opacity: 0.5 }}>
                    {isOpen ? <ChevronDownIcon size={12} /> : <ChevronRightIcon size={12} />}
                  </span>
                </button>
                <div
                  style={{
                    maxHeight: isOpen ? `${item.children.length * 34}px` : '0px',
                    overflow: 'hidden',
                    transition: 'max-height 0.15s ease',
                    paddingLeft: 12,
                  }}
                >
                  {item.children.map(child => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={({ isActive }) => navItemClass('sidebar-l2', isActive, child.disabled)}
                    >
                      <span style={{ flexShrink: 0 }}>{child.icon}</span>
                      <span style={{ flex: 1 }}>{localizeNavLabel(child.label, locale)}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* sidebar-bottom: collapse bar above user info */}
        {showToggle && collapseButtonPosition === 'sidebar-bottom' && (
          <CollapseBarBottom collapsed={false} onToggle={onToggle} />
        )}

        {/* User info footer */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--sidebar-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--sidebar-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--sidebar-primary-foreground)', flexShrink: 0 }}>
              管
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--sidebar-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{account.name}</div>
              <div style={{ fontSize: 11, color: 'var(--sidebar-foreground)', opacity: 0.55, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{account.email}</div>
            </div>
            <button
              className="sidebar-footer-logout"
              onClick={() => {
                clearAuth();
                toast.success('已退出登录');
                navigate('/login', { replace: true });
              }}
              title="退出登录"
              aria-label="退出登录"
            >
              <LogOutIcon size={14} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
