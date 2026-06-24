import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { RoleName } from '../types';

interface NavItem {
  to: string;
  label: string;
  roles: RoleName[];
  indent?: boolean;
}

function buildNavItems(user: { roles: RoleName[] } | null): NavItem[] {
  const isAdmin = user?.roles.includes('Admin') ?? false;
  const isMawkibOwner = user?.roles.includes('MawkibOwner') ?? false;
  const isPilgrimOnly =
    (user?.roles.includes('Pilgrim') ?? false) && !isAdmin && !isMawkibOwner;

  const items: NavItem[] = [
    { to: '/dashboard', label: 'داشبورد', roles: ['Admin', 'MawkibOwner', 'Pilgrim'] },
    { to: '/users', label: 'کاربران', roles: ['Admin'] },
    { to: '/users/pilgrims', label: 'زائرین', roles: ['Admin', 'MawkibOwner'], indent: true },
    { to: '/users/mawkib-owners', label: 'موکب‌داران', roles: ['Admin'], indent: true },
    { to: '/mawkibs', label: 'موکب‌ها', roles: ['Admin', 'MawkibOwner', 'Pilgrim'] },
    {
      to: '/reservations',
      label: isPilgrimOnly ? 'رزروهای من' : 'تاریخچه رزروها',
      roles: ['Admin', 'MawkibOwner', 'Pilgrim'],
    },
  ];

  if (isPilgrimOnly) {
    items.push({
      to: '/reservations/new',
      label: 'رزرو سریع',
      roles: ['Pilgrim'],
    });
  }

  return items;
}

function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.to === '/dashboard') return pathname === '/dashboard';
  if (item.to === '/users') return pathname === '/users';
  if (item.to === '/reservations/new') return pathname === '/reservations/new';
  if (item.to === '/reservations') {
    return (
      pathname === '/reservations' || /^\/reservations\/\d+/.test(pathname)
    );
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

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = buildNavItems(user);
  const visibleNav = navItems.filter((item) =>
    user?.roles.some((role) => item.roles.includes(role)),
  );

  const currentPage =
    location.pathname === '/profile'
      ? 'پروفایل من'
      : [...visibleNav]
          .sort((a, b) => b.to.length - a.to.length)
          .find((item) => isNavItemActive(item, location.pathname))?.label ?? 'پنل مدیریت';

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
    <div className="flex min-h-screen min-h-dvh">
      {menuOpen && (
        <button
          type="button"
          aria-label="بستن منو"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="border-b border-slate-700 p-5">
          <h1 className="text-lg font-bold">پنل مدیریت موکب</h1>
          <p className="mt-1 truncate text-sm text-slate-400">{user?.fullName}</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard' || item.to === '/users'}
              onClick={() => setMenuOpen(false)}
              className={() => {
                const isActive = isNavItemActive(item, location.pathname);
                return `mb-1 block rounded-lg py-3 text-sm transition-colors ${
                  item.indent ? 'mr-3 px-4' : 'px-4'
                } ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : item.indent
                      ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      : 'text-slate-300 hover:bg-slate-800'
                }`;
              }}
            >
              {item.indent ? `› ${item.label}` : item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-700 p-4">
          <NavLink
            to="/profile"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `mb-2 flex items-center gap-2 rounded-lg px-4 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            پروفایل من
          </NavLink>
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-lg bg-slate-800 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700"
          >
            خروج
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label={menuOpen ? 'بستن منو' : 'باز کردن منو'}
          >
            <MenuIcon open={menuOpen} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{currentPage}</p>
            <p className="truncate text-xs text-slate-500">{user?.fullName}</p>
          </div>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `rounded-lg p-2 ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`
            }
            aria-label="پروفایل من"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </NavLink>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
