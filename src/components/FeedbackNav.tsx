import { NavLink, useLocation } from "react-router-dom";
import { NavIcon } from "./ui/NavIcons";

export type FeedbackNavVariant = "admin" | "owner" | "pilgrim";

interface FeedbackSidebarSectionProps {
  collapsed?: boolean;
  variant: FeedbackNavVariant;
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

function feedbackHistoryPath(variant: FeedbackNavVariant) {
  switch (variant) {
    case "admin":
      return "/feedback/admin";
    case "owner":
      return "/feedback/inbox";
    case "pilgrim":
      return "/feedback";
  }
}

export function isFeedbackHistoryActive(
  variant: FeedbackNavVariant,
  pathname: string,
) {
  switch (variant) {
    case "admin":
      return pathname === "/feedback/admin";
    case "owner":
      return pathname === "/feedback/inbox";
    case "pilgrim":
      return (
        pathname === "/feedback" ||
        pathname === "/feedback/new" ||
        pathname.startsWith("/feedback/new/") ||
        /^\/feedback\/\d+\/edit/.test(pathname)
      );
  }
}

export function FeedbackSidebarSection({
  collapsed = false,
  variant,
  onNavigate,
}: FeedbackSidebarSectionProps) {
  const { pathname } = useLocation();
  const historyActive = isFeedbackHistoryActive(variant, pathname);

  return (
    <div className="mb-2">
      {!collapsed && (
        <>
          <p className="px-3 pt-2 text-xs font-semibold text-[#4a6fa5]">
            سامانه انتقادات و پیشنهادات
          </p>
          <div className="mx-3 mb-2 border-b border-slate-200" />
        </>
      )}
      <NavLink
        to={feedbackHistoryPath(variant)}
        end={variant === "admin" || variant === "pilgrim"}
        onClick={onNavigate}
        className={listLinkClass(historyActive, collapsed)}
        title="تاریخچه انتقادات و پیشنهادات"
      >
        <span
          className={`flex items-center ${collapsed ? "" : "gap-2.5 px-1"}`}
        >
          <NavIcon name="feedback" />
          <span className={collapsed ? "sr-only" : undefined}>
            تاریخچه انتقادات و پیشنهادات
          </span>
        </span>
      </NavLink>
    </div>
  );
}

export function resolveFeedbackNavVariant(roles: string[]): FeedbackNavVariant | null {
  if (roles.includes("Admin")) return "admin";
  if (roles.includes("MawkibOwner")) return "owner";
  if (roles.includes("Pilgrim")) return "pilgrim";
  return null;
}
