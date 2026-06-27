import { NavLink, useLocation } from "react-router-dom";
import { NavIcon } from "./ui/NavIcons";

interface MawkibOwnerNavProps {
  collapsed?: boolean;
  showOwnersList: boolean;
  showFeedbackInbox?: boolean;
  onNavigate?: () => void;
}

const listLinkClass = (isActive: boolean, collapsed: boolean) =>
  `flex items-center rounded-lg py-2 text-sm transition ${
    collapsed ? "justify-center px-2" : "px-3"
  } ${
    isActive
      ? "bg-[#e8eef6] font-medium text-[#4a6fa5]"
      : "text-slate-700 hover:bg-slate-50"
  }`;

function isReservationsActive(pathname: string) {
  return pathname === "/reservations" || /^\/reservations\/\d+/.test(pathname);
}

export function MawkibOwnerSidebarSection({
  collapsed = false,
  showOwnersList,
  showFeedbackInbox = false,
  onNavigate,
}: MawkibOwnerNavProps) {
  const { pathname } = useLocation();

  return (
    <div className="mb-2">
      {!collapsed && (
        <>
          <p className="px-3 pt-2 text-xs font-semibold text-[#4a6fa5]">
            سامانه موکب‌داران
          </p>
          <div className="mx-3 mb-2 border-b border-slate-200" />
        </>
      )}
      {showOwnersList && (
        <NavLink
          to="/users/mawkib-owners"
          onClick={onNavigate}
          className={({ isActive }) => listLinkClass(isActive, collapsed)}
          title="موکب‌داران"
        >
          <span
            className={`flex items-center ${collapsed ? "" : "gap-2.5 px-1"}`}
          >
            <NavIcon name="mawkibOwners" />
            <span className={collapsed ? "sr-only" : undefined}>موکب‌داران</span>
          </span>
        </NavLink>
      )}
      <NavLink
        to="/mawkibs"
        onClick={onNavigate}
        className={({ isActive }) => listLinkClass(isActive, collapsed)}
        title="موکب‌ها"
      >
        <span
          className={`flex items-center ${collapsed ? "" : "gap-2.5 px-1"}`}
        >
          <NavIcon name="mawkibs" />
          <span className={collapsed ? "sr-only" : undefined}>موکب‌ها</span>
        </span>
      </NavLink>
      <NavLink
        to="/reservations"
        onClick={onNavigate}
        className={listLinkClass(isReservationsActive(pathname), collapsed)}
        title="تاریخچه رزروها"
      >
        <span
          className={`flex items-center ${collapsed ? "" : "gap-2.5 px-1"}`}
        >
          <NavIcon name="reservations" />
          <span className={collapsed ? "sr-only" : undefined}>
            تاریخچه رزروها
          </span>
        </span>
      </NavLink>
      {showFeedbackInbox && (
        <NavLink
          to="/feedback/inbox"
          onClick={onNavigate}
          className={({ isActive }) => listLinkClass(isActive, collapsed)}
          title="انتقادات و پیشنهادات"
        >
          <span
            className={`flex items-center ${collapsed ? "" : "gap-2.5 px-1"}`}
          >
            <NavIcon name="feedback" />
            <span className={collapsed ? "sr-only" : undefined}>
              انتقادات و پیشنهادات
            </span>
          </span>
        </NavLink>
      )}
    </div>
  );
}

export function getPortalSectionsInsertIndex(items: { to: string }[]) {
  const pilgrimsIdx = items.findIndex((item) => item.to === "/users/pilgrims");
  if (pilgrimsIdx >= 0) return pilgrimsIdx + 1;
  const usersIdx = items.findIndex((item) => item.to === "/users");
  if (usersIdx >= 0) return usersIdx + 1;
  const dashboardIdx = items.findIndex((item) => item.to === "/dashboard");
  return dashboardIdx >= 0 ? dashboardIdx + 1 : 0;
}
