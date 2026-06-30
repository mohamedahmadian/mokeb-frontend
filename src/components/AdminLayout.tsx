import { Fragment, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { guestTheme } from "../lib/guest-theme";
import { getPrimaryRoleHonorificLabel } from "../lib/constants";
import { usersApi } from "../lib/users";
import { UserAvatar } from "./users/UserAvatar";
import { NavIcon, type NavIconName } from "./ui/NavIcons";
import { SettingsMenu } from "./SettingsMenu";
import { CooperationRequestSidebarSection } from "./CooperationRequestNav";
import {
  MawkibOwnerSidebarSection,
  getPortalSectionsInsertIndex,
} from "./MawkibOwnerNav";
import {
  FeedbackSidebarSection,
  resolveFeedbackNavVariant,
} from "./FeedbackNav";
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
  // const isPilgrimOnly =
  //   (user?.roles.includes("Pilgrim") ?? false) && !isAdmin && !isMawkibOwner;

  const items: NavItem[] = [
    {
      to: "/dashboard",
      label: "داشبورد",
      icon: "dashboard",
      roles: ["Admin", "MawkibOwner", "Pilgrim", "HonoraryServant"],
    },
    {
      to: "/mawkibs/map",
      label: "جستجوی موکب ( نقشه )",
      icon: "map",
      roles: ["Admin", "MawkibOwner", "Pilgrim", "HonoraryServant"],
    },
    { to: "/users", label: "کاربران", icon: "users", roles: ["Admin"] },
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
  if (item.to === "/mawkibs/map") {
    return pathname === "/mawkibs/map" || /^\/mawkibs\/\d+\/view/.test(pathname);
  }
  if (item.to === "/users") return pathname === "/users";
  if (item.to === "/reservations/new") return pathname === "/reservations/new";
  if (item.to === "/honorary-volunteers/my")
    return pathname === "/honorary-volunteers/my";
  if (item.to === "/reservations") {
    return (
      pathname === "/reservations" || /^\/reservations\/\d+/.test(pathname)
    );
  }
  if (item.to === "/mawkibs") {
    return pathname === "/mawkibs";
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

function SidebarToggleIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {collapsed ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      )}
    </svg>
  );
}

const SIDEBAR_COLLAPSED_KEY = "admin-sidebar-collapsed";

const sidebarLinkClass = (
  isActive: boolean,
  collapsed: boolean,
  indent?: boolean,
) =>
  `mb-1 flex items-center rounded-xl py-2.5 text-sm font-medium transition ${
    collapsed ? "justify-center px-2" : `gap-2.5 ${indent ? "mr-3 px-3" : "px-3"}`
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
    } catch {
      return false;
    }
  });

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
  const showCooperationNav =
    (user?.roles.includes("Admin") ?? false) ||
    (user?.roles.includes("MawkibOwner") ?? false);
  const showNewCooperationRequest =
    user?.roles.includes("MawkibOwner") ?? false;
  const showHonoraryServantsList = user?.roles.includes("Admin") ?? false;
  const feedbackNavVariant = user
    ? resolveFeedbackNavVariant(user.roles)
    : null;
  const portalSectionsInsertIndex = getPortalSectionsInsertIndex(visibleNav);
  const roleHonorificLabel = getPrimaryRoleHonorificLabel(user?.roles);

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const renderNavItem = (
    item: NavItem,
    collapsed: boolean,
    onClose?: () => void,
  ) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={
        item.to === "/dashboard" ||
        item.to === "/users"
      }
      onClick={onClose}
      className={() =>
        sidebarLinkClass(
          isNavItemActive(item, location.pathname),
          collapsed,
          item.indent,
        )
      }
      title={item.label}
    >
      <NavIcon name={item.icon} />
      <span className={collapsed ? "sr-only" : "truncate"}>{item.label}</span>
    </NavLink>
  );

  const sidebarNav = (collapsed: boolean, onNavigate?: () => void) => (
    <nav className={`flex-1 overflow-y-auto ${collapsed ? "p-2" : "p-3"}`}>
      {visibleNav.map((item, index) => (
        <Fragment key={item.to}>
          {index === portalSectionsInsertIndex && (
            <>
              {showMawkibOwnerNav && (
                <MawkibOwnerSidebarSection
                  collapsed={collapsed}
                  showOwnersList={showMawkibOwnersList}
                  onNavigate={onNavigate}
                />
              )}
              {showCooperationNav && (
                <CooperationRequestSidebarSection
                  collapsed={collapsed}
                  showNewRequest={showNewCooperationRequest}
                  showServantsList={showHonoraryServantsList}
                  onNavigate={onNavigate}
                />
              )}
              {feedbackNavVariant && (
                <FeedbackSidebarSection
                  collapsed={collapsed}
                  variant={feedbackNavVariant}
                  onNavigate={onNavigate}
                />
              )}
            </>
          )}
          {renderNavItem(item, collapsed, onNavigate)}
        </Fragment>
      ))}
      {portalSectionsInsertIndex >= visibleNav.length &&
        (showMawkibOwnerNav || showCooperationNav || feedbackNavVariant) && (
          <>
            {showMawkibOwnerNav && (
              <MawkibOwnerSidebarSection
                collapsed={collapsed}
                showOwnersList={showMawkibOwnersList}
                onNavigate={onNavigate}
              />
            )}
            {showCooperationNav && (
              <CooperationRequestSidebarSection
                collapsed={collapsed}
                showNewRequest={showNewCooperationRequest}
                showServantsList={showHonoraryServantsList}
                onNavigate={onNavigate}
              />
            )}
            {feedbackNavVariant && (
              <FeedbackSidebarSection
                collapsed={collapsed}
                variant={feedbackNavVariant}
                onNavigate={onNavigate}
              />
            )}
          </>
        )}
    </nav>
  );

  const sidebarHeader = (collapsed: boolean, showToggle?: boolean) => (
    <div
      className={`border-b border-slate-100 ${collapsed ? "p-3 pb-0" : "p-5 pb-0"}`}
    >
      <div
        className={`flex items-center ${collapsed ? "flex-col gap-2" : "gap-2"}`}
      >
        <img
          src="/images/logo.png"
          alt="لوگو سامانه"
          className={collapsed ? "h-10 w-10 object-contain" : "h-18 w-18"}
        />
        {!collapsed && (
          <h2 className="min-w-0 flex-1 text-base font-bold text-slate-800">
            مدیریت اسکان و خدمات
          </h2>
        )}
        {showToggle && (
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className={`shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 ${
              collapsed ? "" : "self-start"
            }`}
            aria-label={collapsed ? "باز کردن منو" : "جمع کردن منو"}
            title={collapsed ? "باز کردن منو" : "جمع کردن منو"}
          >
            <SidebarToggleIcon collapsed={collapsed} />
          </button>
        )}
      </div>
      {!collapsed && (
        <hr className="my-2 rounded-full border-t-1 border-[#4a6fa5]" />
      )}

      <div
        className={`mt-3 flex items-center ${collapsed ? "justify-center pb-3" : "gap-3"}`}
      >
        <UserAvatar
          fullName={user?.fullName ?? "کاربر"}
          imageUrl={profile?.imageUrl}
        />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#4a6fa5]">
              {user?.fullName}
            </p>
            {roleHonorificLabel && (
              <span className="mt-1 inline-flex rounded-full bg-[#e8eef6] px-2 py-0.5 text-xs font-medium text-[#4a6fa5]">
                {roleHonorificLabel}
              </span>
            )}
          </div>
        )}
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
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-l border-slate-200/80 bg-white transition-[width] duration-300 ease-in-out lg:flex ${
          sidebarCollapsed ? "w-[4.5rem]" : "w-72"
        }`}
      >
        {sidebarHeader(sidebarCollapsed, true)}
        {sidebarNav(sidebarCollapsed)}
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
        {sidebarHeader(false)}
        {sidebarNav(false, () => setMenuOpen(false))}
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
