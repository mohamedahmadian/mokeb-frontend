import { Fragment, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { guestTheme } from '../lib/guest-theme';
import { NavIcon, type NavIconName } from './ui/NavIcons';
import {
  CooperationRequestSidebarSection,
  getCooperationInsertIndex,
} from './CooperationRequestNav';
import type { RoleName } from '../types';

interface NavItem {
  to: string;
  label: string;
  icon: NavIconName;
  roles: RoleName[];
  indent?: boolean;
}

function buildNavItems(user: { roles: RoleName[] } | null): NavItem[] {
  const isAdmin = user?.roles.includes('Admin') ?? false;
  const isMawkibOwner = user?.roles.includes('MawkibOwner') ?? false;
  const isPilgrimOnly =
    (user?.roles.includes('Pilgrim') ?? false) && !isAdmin && !isMawkibOwner;

  const items: NavItem[] = [
    {
      to: '/dashboard',
      label: 'داشبورد',
      icon: 'dashboard',
      roles: ['Admin', 'MawkibOwner', 'Pilgrim', 'HonoraryServant'],
    },
    { to: '/users', label: 'کاربران', icon: 'users', roles: ['Admin'] },
    {
      to: '/users/pilgrims',
      label: 'زائرین',
      icon: 'pilgrims',
      roles: ['Admin', 'MawkibOwner'],
      indent: true,
    },
    {
      to: '/users/mawkib-owners',
      label: 'موکب‌داران',
      icon: 'mawkibOwners',
      roles: ['Admin'],
      indent: true,
    },
    {
      to: '/mawkibs',
      label: 'موکب‌ها',
      icon: 'mawkibs',
      roles: ['Admin', 'MawkibOwner', 'Pilgrim'],
    },
    {
      to: '/reservations',
      label: isPilgrimOnly ? 'رزروهای من' : 'تاریخچه رزروها',
      icon: 'reservations',
      roles: ['Admin', 'MawkibOwner', 'Pilgrim'],
    },
    {
      to: '/honorary-volunteers/my',
      label: 'درخواست‌های من',
      icon: 'myRequests',
      roles: ['HonoraryServant', 'Pilgrim'],
    },
  ];

  if (isPilgrimOnly) {
    items.push({
      to: '/reservations/new',
      label: 'رزرو سریع',
      icon: 'quickReserve',
      roles: ['Pilgrim'],
    });
  }

  return items;
}

function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.to === '/dashboard') return pathname === '/dashboard';
  if (item.to === '/users') return pathname === '/users';
  if (item.to === '/reservations/new') return pathname === '/reservations/new';
  if (item.to === '/honorary-volunteers/my') return pathname === '/honorary-volunteers/my';
  if (item.to === '/reservations') {
    return pathname === '/reservations' || /^\/reservations\/\d+/.test(pathname);
  }
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}

const sidebarLinkClass = (isActive: boolean, indent?: boolean) =>
  `mb-1 flex items-center gap-2.5 rounded-xl py-2.5 text-sm font-medium transition ${
    indent ? 'mr-3 px-3' : 'px-3'
  } ${
    isActive
      ? 'bg-[#e8eef6] text-[#4a6fa5]'
      : indent
        ? 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
  }`;

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = buildNavItems(user);
  const visibleNav = navItems.filter((item) =>
    user?.roles.some((role) => item.roles.includes(role)),
  );
  const showCooperationNav =
    (user?.roles.includes('Admin') ?? false) || (user?.roles.includes('MawkibOwner') ?? false);
  const showNewCooperationRequest = user?.roles.includes('MawkibOwner') ?? false;
  const cooperationInsertIndex = getCooperationInsertIndex(visibleNav);

  const renderNavItem = (item: NavItem, onClose?: () => void) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === '/dashboard' || item.to === '/users'}
      onClick={onClose}
      className={() =>
        sidebarLinkClass(isNavItemActive(item, location.pathname), item.indent)
      }
      title={item.label}
    >
      <NavIcon name={item.icon} />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );

  const sidebarNav = (onNavigate?: () => void) => (
    <nav className="flex-1 overflow-y-auto p-3">
      {visibleNav.map((item, index) => (
        <Fragment key={item.to}>
          {showCooperationNav && index === cooperationInsertIndex && (
            <CooperationRequestSidebarSection
              showNewRequest={showNewCooperationRequest}
              onNavigate={onNavigate}
            />
          )}
          {renderNavItem(item, onNavigate)}
        </Fragment>
      ))}
      {showCooperationNav && cooperationInsertIndex >= visibleNav.length && (
        <CooperationRequestSidebarSection
          showNewRequest={showNewCooperationRequest}
          onNavigate={onNavigate}
        />
      )}
    </nav>
  );

  const sidebarHeader = (showUserName?: boolean) => (
    <div className="border-b border-slate-100 p-5">
      <p className="text-xs font-medium text-[#4a6fa5]">پنل کاربری</p>
      <h1 className="mt-1 text-lg font-bold text-slate-800">مدیریت موکب</h1>
      {showUserName && (
        <p className="mt-1 truncate text-sm text-slate-500">{user?.fullName}</p>
      )}
    </div>
  );

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen min-h-dvh bg-[#f4f6f9] text-slate-700">
      {/* Desktop sidebar — right side in RTL */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-l border-slate-200/80 bg-white lg:flex">
        {sidebarHeader()}
        {sidebarNav()}
        <div className="border-t border-slate-100 p-4">
          <Link
            to="/"
            className={`${guestTheme.btnSecondary} inline-flex w-full items-center justify-center gap-1.5`}
          >
            <NavIcon name="home" />
            <span>بازگشت به صفحه اصلی</span>
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/95 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label={menuOpen ? 'بستن منو' : 'باز کردن منو'}
              >
                <MenuIcon open={menuOpen} />
              </button>
              <Link
                to="/"
                className="inline-flex min-w-0 items-center gap-2 truncate text-sm font-semibold text-slate-800 sm:text-base"
              >
                <NavIcon name="home" className="h-5 w-5 shrink-0 text-[#4a6fa5]" />
                <span className="truncate">سامانه اسکان زائر</span>
              </Link>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden max-w-[10rem] truncate text-sm text-slate-500 md:inline">
                {user?.fullName}
              </span>
              <Link to="/" className={`${guestTheme.btnGhost} hidden items-center gap-1.5 sm:inline-flex`}>
                <NavIcon name="home" />
                <span>صفحه اصلی</span>
              </Link>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#e8eef6] text-[#4a6fa5]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <NavIcon name="profile" />
                <span className="hidden sm:inline">پروفایل</span>
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className={`${guestTheme.btnSecondary} inline-flex items-center gap-1.5`}
              >
                <NavIcon name="logout" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <button
          type="button"
          aria-label="بستن منو"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l border-slate-200/80 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {sidebarHeader(true)}
        {sidebarNav(() => setMenuOpen(false))}
        <div className="border-t border-slate-100 p-4">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className={`${guestTheme.btnSecondary} inline-flex w-full items-center justify-center gap-1.5`}
          >
            <NavIcon name="home" />
            <span>بازگشت به صفحه اصلی</span>
          </Link>
        </div>
      </aside>
    </div>
  );
}
