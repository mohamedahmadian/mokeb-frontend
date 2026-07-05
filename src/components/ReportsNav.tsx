import { NavLink, useLocation } from 'react-router-dom';
import { NavIcon } from './ui/NavIcons';

interface ReportsSidebarSectionProps {
  collapsed?: boolean;
  showMawkibOwners?: boolean;
  onNavigate?: () => void;
}

const listLinkClass = (isActive: boolean, collapsed: boolean, indent = false) =>
  `flex items-center rounded-lg py-2 text-sm transition ${
    collapsed ? 'justify-center px-2' : indent ? 'mr-4 px-3' : 'px-3'
  } ${
    isActive
      ? 'bg-[#e8eef6] font-medium text-[#4a6fa5]'
      : 'text-slate-700 hover:bg-slate-50'
  }`;

function isReportsPathActive(pathname: string) {
  return pathname.startsWith('/reports');
}

function isPilgrimsReportActive(pathname: string) {
  return pathname === '/reports/pilgrims';
}

function isMawkibOwnersReportActive(pathname: string) {
  return pathname === '/reports/mawkib-owners';
}

function isMawkibsReportActive(pathname: string) {
  return pathname === '/reports/mawkibs';
}

function isReservationsReportActive(pathname: string) {
  return pathname === '/reports/reservations';
}

export function ReportsSidebarSection({
  collapsed = false,
  showMawkibOwners = false,
  onNavigate,
}: ReportsSidebarSectionProps) {
  const { pathname } = useLocation();
  const sectionActive = isReportsPathActive(pathname);

  return (
    <div className="mb-2">
      {!collapsed && (
        <>
          <p className="px-3 pt-2 text-xs font-semibold text-[#4a6fa5]">گزارشات</p>
          <div className="mx-3 mb-2 border-b border-slate-200" />
        </>
      )}

      {collapsed ? (
        <NavLink
          to="/reports/pilgrims"
          onClick={onNavigate}
          className={listLinkClass(sectionActive, collapsed)}
          title="گزارشات"
        >
          <NavIcon name="reports" />
          <span className="sr-only">گزارشات</span>
        </NavLink>
      ) : (
        <div className="space-y-0.5">
          <NavLink
            to="/reports/pilgrims"
            onClick={onNavigate}
            className={listLinkClass(isPilgrimsReportActive(pathname), collapsed, true)}
            title="گزارش زائرین"
          >
            <span className="flex items-center gap-2.5 px-1">
              <NavIcon name="pilgrims" />
              <span>زائرین</span>
            </span>
          </NavLink>

          <NavLink
            to="/reports/mawkibs"
            onClick={onNavigate}
            className={listLinkClass(isMawkibsReportActive(pathname), collapsed, true)}
            title="گزارش موکب‌ها"
          >
            <span className="flex items-center gap-2.5 px-1">
              <NavIcon name="mawkibs" />
              <span>موکب‌ها</span>
            </span>
          </NavLink>

          <NavLink
            to="/reports/reservations"
            onClick={onNavigate}
            className={listLinkClass(isReservationsReportActive(pathname), collapsed, true)}
            title="گزارش رزروها"
          >
            <span className="flex items-center gap-2.5 px-1">
              <NavIcon name="reservations" />
              <span>رزروها</span>
            </span>
          </NavLink>

          {showMawkibOwners && (
            <NavLink
              to="/reports/mawkib-owners"
              onClick={onNavigate}
              className={listLinkClass(
                isMawkibOwnersReportActive(pathname),
                collapsed,
                true,
              )}
              title="گزارش موکب‌داران"
            >
              <span className="flex items-center gap-2.5 px-1">
                <NavIcon name="mawkibOwners" />
                <span>موکب‌داران</span>
              </span>
            </NavLink>
          )}
        </div>
      )}
    </div>
  );
}

export function getReportsSectionInsertIndex(items: { to: string }[]) {
  const pilgrimsIdx = items.findIndex((item) => item.to === '/users/pilgrims');
  if (pilgrimsIdx >= 0) return pilgrimsIdx + 1;
  const dashboardIdx = items.findIndex((item) => item.to === '/dashboard');
  return dashboardIdx >= 0 ? dashboardIdx + 1 : 0;
}
