import { NavLink, useLocation } from 'react-router-dom';
import { NavIcon } from './ui/NavIcons';

interface MealPlansSidebarSectionProps {
  collapsed?: boolean;
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

export function isMealPlansActive(pathname: string) {
  return pathname.startsWith('/meal-plans');
}

function isMealPlansHomeActive(pathname: string) {
  return pathname === '/meal-plans';
}

function isPresentAttendeesReportActive(pathname: string) {
  return pathname === '/meal-plans/present-attendees';
}

export function MealPlansSidebarSection({
  collapsed = false,
  onNavigate,
}: MealPlansSidebarSectionProps) {
  const { pathname } = useLocation();
  const sectionActive = isMealPlansActive(pathname);

  return (
    <div className="mb-2">
      {!collapsed && (
        <>
          <p className="px-3 pt-2 text-xs font-semibold text-[#4a6fa5]">سامانه غذا</p>
          <div className="mx-3 mb-2 border-b border-slate-200" />
        </>
      )}

      {collapsed ? (
        <NavLink
          to="/meal-plans"
          onClick={onNavigate}
          className={listLinkClass(sectionActive, collapsed)}
          title="سامانه غذا"
        >
          <NavIcon name="meals" />
          <span className="sr-only">سامانه غذا</span>
        </NavLink>
      ) : (
        <div className="space-y-0.5">
          <NavLink
            to="/meal-plans"
            onClick={onNavigate}
            className={listLinkClass(isMealPlansHomeActive(pathname), collapsed, true)}
            title="سامانه غذا"
          >
            <span className="flex items-center gap-2.5 px-1">
              <NavIcon name="meals" />
              <span>سامانه غذا</span>
            </span>
          </NavLink>

          <NavLink
            to="/meal-plans/present-attendees"
            onClick={onNavigate}
            className={listLinkClass(isPresentAttendeesReportActive(pathname), collapsed, true)}
            title="گزارش حاضرین"
          >
            <span className="flex items-center gap-2.5 px-1">
              <NavIcon name="pilgrims" />
              <span>گزارش حاضرین</span>
            </span>
          </NavLink>
        </div>
      )}
    </div>
  );
}
