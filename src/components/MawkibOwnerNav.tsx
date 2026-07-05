import { NavLink, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { NavIcon } from "./ui/NavIcons";
import { mawkibsApi } from "../lib/mawkibs";

interface MawkibOwnerNavProps {
  collapsed?: boolean;
  showOwnersList: boolean;
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
  if (
    pathname === "/reservations/new" ||
    pathname === "/reservations/quick" ||
    pathname === "/reservations/today" ||
    pathname === "/reservations/waiting-list"
  ) {
    return false;
  }
  return pathname === "/reservations" || /^\/reservations\/\d+/.test(pathname);
}

function isWaitingListActive(pathname: string) {
  return pathname === "/reservations/waiting-list";
}

function isNewReservationActive(pathname: string) {
  return pathname === "/reservations/new";
}

function isQuickReservationActive(
  pathname: string,
  search: string,
  mawkibId: number,
) {
  if (pathname !== "/reservations/quick" && pathname !== "/reservations/today") {
    return false;
  }
  const id = parseInt(new URLSearchParams(search).get("mawkibId") ?? "", 10);
  return id === mawkibId;
}

function quickReservationLabel(mawkibName: string) {
  return `رزرو سریع ${mawkibName}`;
}

function isMawkibsListActive(pathname: string) {
  return pathname === "/mawkibs";
}

function isMapSearchActive(pathname: string) {
  return pathname === "/mawkibs/map" || /^\/mawkibs\/\d+\/view/.test(pathname);
}

export function MawkibOwnerSidebarSection({
  collapsed = false,
  showOwnersList,
  onNavigate,
}: MawkibOwnerNavProps) {
  const { pathname, search } = useLocation();

  const { data: myMawkibs = [] } = useQuery({
    queryKey: ["sidebar-my-mawkibs"],
    queryFn: () => mawkibsApi.getMyList(),
    staleTime: 60_000,
  });

  const quickReserveMawkibs = myMawkibs.filter((m) => m.status === "Approved");

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
        to="/reservations/new"
        onClick={onNavigate}
        className={listLinkClass(isNewReservationActive(pathname), collapsed)}
        title="رزرو جدید"
      >
        <span
          className={`flex items-center ${collapsed ? "" : "gap-2.5 px-1"}`}
        >
          <NavIcon name="quickReserve" />
          <span className={collapsed ? "sr-only" : undefined}>رزرو جدید</span>
        </span>
      </NavLink>
      {quickReserveMawkibs.map((mawkib) => {
        const label = quickReservationLabel(mawkib.name);
        return (
          <NavLink
            key={mawkib.id}
            to={`/reservations/quick?mawkibId=${mawkib.id}`}
            onClick={onNavigate}
            className={listLinkClass(
              isQuickReservationActive(pathname, search, mawkib.id),
              collapsed,
            )}
            title={label}
          >
            <span
              className={`flex items-center ${collapsed ? "" : "gap-2.5 px-1"}`}
            >
              <NavIcon name="todayReserve" />
              <span className={collapsed ? "sr-only" : "truncate"}>{label}</span>
            </span>
          </NavLink>
        );
      })}
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
      <NavLink
        to="/reservations/waiting-list"
        onClick={onNavigate}
        className={listLinkClass(isWaitingListActive(pathname), collapsed)}
        title="لیست انتظار"
      >
        <span
          className={`flex items-center ${collapsed ? "" : "gap-2.5 px-1"}`}
        >
          <NavIcon name="reservations" />
          <span className={collapsed ? "sr-only" : undefined}>لیست انتظار</span>
        </span>
      </NavLink>
      <NavLink
        to="/mawkibs"
        end
        onClick={onNavigate}
        className={listLinkClass(isMawkibsListActive(pathname), collapsed)}
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
        to="/mawkibs/map"
        onClick={onNavigate}
        className={listLinkClass(isMapSearchActive(pathname), collapsed)}
        title="جستجوی موکب ( نقشه )"
      >
        <span
          className={`flex items-center ${collapsed ? "" : "gap-2.5 px-1"}`}
        >
          <NavIcon name="map" />
          <span className={collapsed ? "sr-only" : undefined}>
            جستجوی موکب ( نقشه )
          </span>
        </span>
      </NavLink>
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
