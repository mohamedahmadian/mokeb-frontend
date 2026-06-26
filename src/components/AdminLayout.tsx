import { Fragment, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { guestTheme } from "../lib/guest-theme";
import { usersApi } from "../lib/users";
import { UserAvatar } from "./users/UserAvatar";
import { NavIcon, type NavIconName } from "./ui/NavIcons";
import { SettingsMenu } from "./SettingsMenu";
import { CooperationRequestSidebarSection } from "./CooperationRequestNav";
import {
  MawkibOwnerSidebarSection,
  getPortalSectionsInsertIndex,
} from "./MawkibOwnerNav";
import type { RoleName } from "../types";

interface NavItem {
  to: string;
  label: string;
  icon: NavIconName;
  roles: RoleName[];
  indent?: boolean;
}

function buildNavItems(user: { roles: RoleName[] } | null): NavItem[] {
  const isAdmin = user?.roles.includes("Admin") ?? false;
  const isMawkibOwner = user?.roles.includes("MawkibOwner") ?? false;
  const isPilgrimOnly =
    (user?.roles.includes("Pilgrim") ?? false) && !isAdmin && !isMawkibOwner;

  const items: NavItem[] = [
    {
      to: "/dashboard",
      label: "داشبورد",
      icon: "dashboard",
      roles: ["Admin", "MawkibOwner", "Pilgrim", "HonoraryServant"],
    },
    { to: "/users", label: "کاربران", icon: "users", roles: ["Admin"] },
    {
      to: "/feedback/admin",
      label: "انتقادات و پیشنهادات",
      icon: "feedback",
      roles: ["Admin"],
    },
    {
      to: "/users/pilgrims",
      label: "زائرین",
      icon: "pilgrims",
      roles: ["Admin", "MawkibOwner"],
    },
  ];

  // if (isPilgrimOnly) {
  //   items.push({
  //     to: "/reservations/new",
  //     label: "رزرو سریع موکب",
  //     icon: "quickReserve",
  //     roles: ["Pilgrim"],
  //   });
  // }

  if (!isAdmin && !isMawkibOwner) {
    items.push(
      {
        to: "/mawkibs",
        label: "موکب‌ها",
        icon: "mawkibs",
        roles: ["Pilgrim"],
      },
      {
        to: "/reservations",
        label: "رزروهای من",
        icon: "reservations",
        roles: ["Pilgrim"],
      },
      {
        to: "/feedback",
        label: "انتقادات و پیشنهادات",
        icon: "feedback",
        roles: ["Pilgrim"],
      },
    );
  }

  items.push({
    to: "/honorary-volunteers/my",
    label: "همکاری به عنوان خادم",
    icon: "myRequests",
    roles: ["HonoraryServant", "Pilgrim"],
  });

  return items;
}

function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.to === "/dashboard") return pathname === "/dashboard";
  if (item.to === "/users") return pathname === "/users";
  if (item.to === "/reservations/new") return pathname === "/reservations/new";
  if (item.to === "/honorary-volunteers/my")
    return pathname === "/honorary-volunteers/my";
  if (item.to === "/feedback") {
    return (
      pathname === "/feedback" ||
      pathname === "/feedback/new" ||
      pathname.startsWith("/feedback/new/") ||
      /^\/feedback\/\d+\/edit/.test(pathname)
    );
  }
  if (item.to === "/feedback/admin") {
    return pathname === "/feedback/admin";
  }
  if (item.to === "/reservations") {
    return (
      pathname === "/reservations" || /^\/reservations\/\d+/.test(pathname)
    );
  }
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {open ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      )}
    </svg>
  );
}

const sidebarLinkClass = (isActive: boolean, indent?: boolean) =>
  `mb-1 flex items-center gap-2.5 rounded-xl py-2.5 text-sm font-medium transition ${
    indent ? "mr-3 px-3" : "px-3"
  } ${
    isActive
      ? "bg-[#e8eef6] text-[#4a6fa5]"
      : indent
        ? "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
  }`;

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id, "sidebar"],
    queryFn: usersApi.getMe,
    enabled: !!user?.id,
  });

  const navItems = buildNavItems(user);
  const visibleNav = navItems.filter((item) =>
    user?.roles.some((role) => item.roles.includes(role)),
  );
  const showMawkibOwnerNav =
    (user?.roles.includes("Admin") ?? false) ||
    (user?.roles.includes("MawkibOwner") ?? false);
  const showMawkibOwnersList = user?.roles.includes("Admin") ?? false;
  const showMawkibOwnerFeedbackInbox =
    user?.roles.includes("MawkibOwner") ?? false;
  const showCooperationNav =
    (user?.roles.includes("Admin") ?? false) ||
    (user?.roles.includes("MawkibOwner") ?? false);
  const showNewCooperationRequest =
    user?.roles.includes("MawkibOwner") ?? false;
  const showHonoraryServantsList = user?.roles.includes("Admin") ?? false;
  const portalSectionsInsertIndex = getPortalSectionsInsertIndex(visibleNav);

  const renderNavItem = (item: NavItem, onClose?: () => void) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={
        item.to === "/dashboard" ||
        item.to === "/users" ||
        item.to === "/feedback/admin"
      }
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
          {index === portalSectionsInsertIndex && (
            <>
              {showMawkibOwnerNav && (
                <MawkibOwnerSidebarSection
                  showOwnersList={showMawkibOwnersList}
                  showFeedbackInbox={showMawkibOwnerFeedbackInbox}
                  onNavigate={onNavigate}
                />
              )}
              {showCooperationNav && (
                <CooperationRequestSidebarSection
                  showNewRequest={showNewCooperationRequest}
                  showServantsList={showHonoraryServantsList}
                  onNavigate={onNavigate}
                />
              )}
            </>
          )}
          {renderNavItem(item, onNavigate)}
        </Fragment>
      ))}
      {portalSectionsInsertIndex >= visibleNav.length &&
        (showMawkibOwnerNav || showCooperationNav) && (
          <>
            {showMawkibOwnerNav && (
              <MawkibOwnerSidebarSection
                showOwnersList={showMawkibOwnersList}
                showFeedbackInbox={showMawkibOwnerFeedbackInbox}
                onNavigate={onNavigate}
              />
            )}
            {showCooperationNav && (
              <CooperationRequestSidebarSection
                showNewRequest={showNewCooperationRequest}
                showServantsList={showHonoraryServantsList}
                onNavigate={onNavigate}
              />
            )}
          </>
        )}
    </nav>
  );

  const sidebarHeader = () => (
    <div className="border-b border-slate-100 p-5 pb-0">
      <div className="flex items-center gap-2">
        <img src="/images/logo.png" alt="لوگو سامانه" className="h-18 w-18" />
        <h2 className="text-base font-bold text-slate-800">
          مدیریت اسکان و خدمات
        </h2>
      </div>
      <hr className="my-2 border-t-1 border-[#4a6fa5] rounded-full" />

      <div className="mt-3 flex items-center gap-3">
        <UserAvatar
          fullName={user?.fullName ?? "کاربر"}
          imageUrl={profile?.imageUrl}
        />
        <p className="min-w-0 truncate text-sm font-medium text-[#4a6fa5]">
          {user?.fullName}
        </p>
      </div>
    </div>
  );

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen min-h-dvh bg-[#f4f6f9] text-slate-700">
      {/* Desktop sidebar — right side in RTL */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-l border-slate-200/80 bg-white lg:flex">
        {sidebarHeader()}
        {sidebarNav()}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/95 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
              >
                <MenuIcon open={menuOpen} />
              </button>
              <Link
                to="/"
                className="inline-flex min-w-0 items-center gap-2 lg:hidden"
              >
                <img
                  src="/images/logo.png"
                  alt="لوگو سامانه"
                  className="h-9 w-9 object-contain"
                />
              </Link>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/"
                className={`${guestTheme.btnGhost} hidden items-center gap-1.5 sm:inline-flex`}
              >
                <img
                  src="/images/logo.png"
                  alt=""
                  aria-hidden
                  className="h-6 w-6 object-contain"
                />
                <span>صفحه اصلی</span>
              </Link>
              <SettingsMenu />
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
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {sidebarHeader()}
        {sidebarNav(() => setMenuOpen(false))}
        <div className="border-t border-slate-100 p-4">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className={`${guestTheme.btnSecondary} inline-flex w-full items-center justify-center gap-1.5`}
          >
            <img
              src="/images/logo.png"
              alt=""
              aria-hidden
              className="h-5 w-5 object-contain"
            />
            <span>بازگشت به صفحه اصلی</span>
          </Link>
        </div>
      </aside>
    </div>
  );
}
