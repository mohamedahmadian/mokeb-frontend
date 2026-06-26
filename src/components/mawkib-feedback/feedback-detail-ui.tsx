import type { ReactNode } from "react";
import { NavIcon } from "../ui/NavIcons";
import { MapPinIcon } from "../users/user-form-ui";

function DetailIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      {children}
    </svg>
  );
}

const detailIcons = {
  calendar: (
    <DetailIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </DetailIcon>
  ),
  phone: (
    <DetailIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </DetailIcon>
  ),
  message: (
    <DetailIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
      />
    </DetailIcon>
  ),
};

export function FeedbackDetailField({
  icon,
  label,
  value,
  dir,
  valueClassName = "",
  className = "",
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  dir?: "ltr" | "rtl";
  valueClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-3.5 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5] shadow-sm ring-1 ring-[#c5d4e8]/60">
          {icon}
        </div>
        <div className="min-w-0 flex-1 text-right">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <div
            className={`mt-1 text-sm font-semibold text-slate-800 ${valueClassName}`}
            dir={dir}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeedbackDetailSection({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-slate-100 bg-gradient-to-l from-[#f0f4fa] to-white px-3.5 py-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5]">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-slate-800">{label}</h3>
      </div>
      <div className="p-3.5">{children}</div>
    </div>
  );
}

export { detailIcons, DetailIcon, NavIcon, MapPinIcon };
