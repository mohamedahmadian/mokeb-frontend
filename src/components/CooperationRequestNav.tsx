import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { DropdownLinkContent, NavIcon } from "./ui/NavIcons";

interface CooperationRequestNavProps {
  collapsed?: boolean;
  showNewRequest: boolean;
  showServantsList?: boolean;
  onNavigate?: () => void;
}

function isCooperationActive(pathname: string) {
  return (
    pathname === "/honorary-volunteers" ||
    pathname === "/honorary-volunteers/new" ||
    pathname === "/users/honorary-servants"
  );
}

const listLinkClass = (isActive: boolean, collapsed = false) =>
  `flex items-center rounded-lg py-2 text-sm transition ${
    collapsed ? "justify-center px-2" : "px-3"
  } ${
    isActive
      ? "bg-[#e8eef6] font-medium text-[#4a6fa5]"
      : "text-slate-700 hover:bg-slate-50"
  }`;

export function CooperationRequestDropdown({
  showNewRequest,
  showServantsList = false,
  onNavigate,
}: CooperationRequestNavProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const active = isCooperationActive(pathname);

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

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
          active
            ? "bg-[#e8eef6] text-[#4a6fa5]"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <NavIcon name="honorary" />
        <span>درخواست همکاری</span>
        <NavIcon
          name="chevron"
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[13rem] rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
          <div className="px-3 pb-2">
            <p className="text-xs font-semibold text-[#4a6fa5]">
              سامانه خادمین
            </p>
            <div className="mt-2 border-b border-slate-200" />
          </div>
          <div className="space-y-0.5 px-1 pt-1">
            {showServantsList && (
              <Link
                to="/users/honorary-servants"
                onClick={close}
                className={listLinkClass(pathname === "/users/honorary-servants")}
              >
                <DropdownLinkContent icon="honorary" label="خادمین" />
              </Link>
            )}
            <Link
              to="/honorary-volunteers"
              onClick={close}
              className={listLinkClass(pathname === "/honorary-volunteers")}
            >
              <DropdownLinkContent
                icon="myRequests"
                label="درخواست‌های همکاری"
              />
            </Link>
            {showNewRequest && (
              <Link
                to="/honorary-volunteers/new"
                onClick={close}
                className={listLinkClass(
                  pathname === "/honorary-volunteers/new",
                )}
              >
                <DropdownLinkContent
                  icon="honoraryAdd"
                  label="درخواست خادم جدید"
                />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function CooperationRequestSidebarSection({
  collapsed = false,
  showNewRequest,
  showServantsList = false,
  onNavigate,
}: CooperationRequestNavProps) {
  return (
    <div className="mb-2">
      {!collapsed && (
        <>
          <p className="px-3 pt-2 text-xs font-semibold text-[#4a6fa5]">
            سامانه خادمین
          </p>
          <div className="mx-3 mb-2 border-b border-slate-200" />
        </>
      )}
      {showServantsList && (
        <NavLink
          to="/users/honorary-servants"
          onClick={onNavigate}
          className={({ isActive }) => listLinkClass(isActive, collapsed)}
          title="خادمین"
        >
          <span
            className={`flex items-center ${collapsed ? "" : "gap-2.5 px-1"}`}
          >
            <NavIcon name="honorary" />
            <span className={collapsed ? "sr-only" : undefined}>خادمین</span>
          </span>
        </NavLink>
      )}
      <NavLink
        to="/honorary-volunteers"
        onClick={onNavigate}
        className={({ isActive }) => listLinkClass(isActive, collapsed)}
        title="درخواست‌های همکاری"
      >
        <span
          className={`flex items-center ${collapsed ? "" : "gap-2.5 px-1"}`}
        >
          <NavIcon name="myRequests" />
          <span className={collapsed ? "sr-only" : undefined}>
            درخواست‌های همکاری
          </span>
        </span>
      </NavLink>
      {showNewRequest && (
        <NavLink
          to="/honorary-volunteers/new"
          onClick={onNavigate}
          className={({ isActive }) => listLinkClass(isActive, collapsed)}
          title="درخواست خادم جدید"
        >
          <span
            className={`flex items-center ${collapsed ? "" : "gap-2.5 px-1"}`}
          >
            <NavIcon name="honoraryAdd" />
            <span className={collapsed ? "sr-only" : undefined}>
              درخواست خادم جدید
            </span>
          </span>
        </NavLink>
      )}
    </div>
  );
}

export function getCooperationInsertIndex(items: { to: string }[]) {
  const pilgrimsIdx = items.findIndex((item) => item.to === "/users/pilgrims");
  if (pilgrimsIdx >= 0) return pilgrimsIdx + 1;
  const usersIdx = items.findIndex((item) => item.to === "/users");
  if (usersIdx >= 0) return usersIdx + 1;
  const dashboardIdx = items.findIndex((item) => item.to === "/dashboard");
  return dashboardIdx >= 0 ? dashboardIdx + 1 : 0;
}
