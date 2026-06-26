import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DropdownLinkContent, NavIcon } from './ui/NavIcons';

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isActive =
    location.pathname === '/profile' ||
    location.pathname === '/settings/password';

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
          isActive
            ? 'bg-[#e8eef6] text-[#4a6fa5]'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <NavIcon name="settings" />
        <span className="hidden sm:inline">تنظیمات</span>
        <NavIcon
          name="chevron"
          className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[11rem] rounded-xl border border-slate-200 bg-white py-1 shadow-lg sm:left-auto sm:right-0">
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className={`flex items-center px-3 py-2 text-sm transition hover:bg-slate-50 ${
              location.pathname === '/profile'
                ? 'bg-[#f0f4fa] text-[#4a6fa5]'
                : 'text-slate-700'
            }`}
          >
            <DropdownLinkContent icon="profile" label="پروفایل" />
          </Link>
          <Link
            to="/settings/password"
            onClick={() => setOpen(false)}
            className={`flex items-center px-3 py-2 text-sm transition hover:bg-slate-50 ${
              location.pathname === '/settings/password'
                ? 'bg-[#f0f4fa] text-[#4a6fa5]'
                : 'text-slate-700'
            }`}
          >
            <DropdownLinkContent icon="key" label="تغییر رمز عبور" />
          </Link>
        </div>
      )}
    </div>
  );
}
