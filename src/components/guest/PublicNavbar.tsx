import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { guestTheme } from "../../lib/guest-theme";
import { DropdownLinkContent, NavIcon, NavLinkContent } from "../ui/NavIcons";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
    isActive
      ? "bg-[#e8eef6] text-[#4a6fa5]"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

const dropdownLinkClass =
  "flex items-center px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50";

function VolunteersMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <NavIcon name="honorary" />
        <span>خادم یاری</span>
        <NavIcon
          name="chevron"
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[12rem] rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <Link
            to="/guest/honorary-volunteer/register"
            onClick={() => setOpen(false)}
            className={dropdownLinkClass}
          >
            <DropdownLinkContent
              icon="honoraryRegister"
              label="ثبت‌نام خادم یاری"
            />
          </Link>
          <Link
            to="/guest/honorary-volunteer/needs"
            onClick={() => setOpen(false)}
            className={dropdownLinkClass}
          >
            <DropdownLinkContent
              icon="honoraryNeeds"
              label="نیازمندی‌های موکب‌ها"
            />
          </Link>
          <Link
            to="/guest/honorary-volunteer/track"
            onClick={() => setOpen(false)}
            className={dropdownLinkClass}
          >
            <DropdownLinkContent icon="honoraryTrack" label="پیگیری درخواست" />
          </Link>
        </div>
      )}
    </div>
  );
}

function OwnersMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <NavIcon name="mawkibOwnerPanel" />
        <span>سامانه موکب‌داران</span>
        <NavIcon
          name="chevron"
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[11rem] rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <Link
            to="/guest/mawkib-owner/register"
            onClick={() => setOpen(false)}
            className={dropdownLinkClass}
          >
            <DropdownLinkContent
              icon="mawkibOwnerRegister"
              label="ثبت‌نام موکب‌دار"
            />
          </Link>
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className={dropdownLinkClass}
          >
            <DropdownLinkContent
              icon="mawkibOwnerPanel"
              label="سامانه موکب‌داران"
            />
          </Link>
        </div>
      )}
    </div>
  );
}

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  const mainLinks = (
    <>
      <NavLink to="/" end className={navLinkClass}>
        <NavLinkContent icon="home" label="صفحه اصلی" />
      </NavLink>
      <NavLink to="/guest/mawkibs" className={navLinkClass}>
        <NavLinkContent icon="mawkibs" label="موکب‌ها" />
      </NavLink>
      <NavLink to="/guest/reserve" className={navLinkClass}>
        <NavLinkContent icon="reserve" label="رزرو موکب" />
      </NavLink>
      <NavLink to="/guest/track" className={navLinkClass}>
        <NavLinkContent icon="track" label="پیگیری رزرو" />
      </NavLink>
      <VolunteersMenu />
      <OwnersMenu />
    </>
  );

  const authLinks = user ? (
    <Link
      to="/dashboard"
      className={`${guestTheme.btnPrimary} inline-flex items-center gap-1.5`}
    >
      <NavIcon name="panel" className="h-4 w-4" />
      <span>پنل کاربری</span>
    </Link>
  ) : (
    <>
      <Link
        to="/login"
        className={`${guestTheme.btnGhost} inline-flex items-center gap-1.5`}
      >
        <NavIcon name="login" />
        <span>ورود</span>
      </Link>
      <Link
        to="/register"
        className={`${guestTheme.btnPrimary} inline-flex items-center gap-1.5`}
      >
        <NavIcon name="register" className="h-4 w-4" />
        <span>ثبت‌نام زائر</span>
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        <nav className="hidden items-center gap-0.5 md:flex">{mainLinks}</nav>

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 md:hidden"
        >
          <NavIcon name="home" className="h-5 w-5 text-[#4a6fa5]" />
          <span>سامانه اسکان زائر</span>
        </Link>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="منو"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        <div className="hidden items-center gap-2 md:flex">{authLinks}</div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">{mainLinks}</nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
            {user ? (
              <Link
                to="/dashboard"
                className={`${guestTheme.btnPrimary} inline-flex items-center justify-center gap-1.5`}
                onClick={() => setMobileOpen(false)}
              >
                <NavIcon name="panel" className="h-4 w-4" />
                <span>پنل کاربری</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`${guestTheme.btnSecondary} inline-flex items-center justify-center gap-1.5`}
                  onClick={() => setMobileOpen(false)}
                >
                  <NavIcon name="login" />
                  <span>ورود</span>
                </Link>
                <Link
                  to="/register"
                  className={`${guestTheme.btnPrimary} inline-flex items-center justify-center gap-1.5`}
                  onClick={() => setMobileOpen(false)}
                >
                  <NavIcon name="register" className="h-4 w-4" />
                  <span>ثبت‌نام زائر</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
