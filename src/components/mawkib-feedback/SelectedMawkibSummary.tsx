import type { ReactNode } from "react";
import { NavIcon } from "../ui/NavIcons";
import { mawkibCityLabel } from "../../lib/mawkib-locations";
import type { Mawkib } from "../../types";

function SvgIcon({
  className = "h-3.5 w-3.5",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      className={className}
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

const icons = {
  location: (
    <SvgIcon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </SvgIcon>
  ),
  phone: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </SvgIcon>
  ),
};

function InfoItem({
  icon,
  children,
  dir,
}: {
  icon: ReactNode;
  children: ReactNode;
  dir?: "ltr" | "rtl";
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-slate-600">
      <span className="shrink-0 text-[#4a6fa5]">{icon}</span>
      <span className="truncate font-medium text-slate-700" dir={dir}>
        {children}
      </span>
    </span>
  );
}

interface SelectedMawkibSummaryProps {
  mawkib: Mawkib;
  onChange: () => void;
}

export function SelectedMawkibSummary({
  mawkib,
  onChange,
}: SelectedMawkibSummaryProps) {
  const city = mawkibCityLabel(mawkib.mawkibCity);
  const ownerName = mawkib.owner?.fullName;
  const ownerPhone = mawkib.owner?.mobileNumber;
  const showOwnerPhone =
    ownerPhone && ownerPhone.trim() !== mawkib.phoneNumber.trim();

  return (
    <div className="mt-2 rounded-lg border border-[#c5d4e8] bg-gradient-to-br from-[#f8fafc] to-[#eef3fa] p-2.5 sm:p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#4a6fa5] shadow-sm ring-1 ring-[#d8e2f0]">
            <NavIcon name="mawkibs" className="h-4 w-4" />
          </div>
          <p className="truncate text-sm font-semibold text-slate-800">
            {mawkib.name}
          </p>
        </div>
        <button
          type="button"
          onClick={onChange}
          className="shrink-0 text-xs font-medium text-[#4a6fa5] hover:text-[#3d5d8a]"
        >
          تغییر موکب
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#d8e2f0]/80 pt-2">
        {city !== "—" && (
          <InfoItem icon={icons.location}>{city}</InfoItem>
        )}
        {ownerName && (
          <InfoItem icon={<NavIcon name="pilgrims" className="h-3.5 w-3.5" />}>
            {ownerName}
          </InfoItem>
        )}
        <InfoItem icon={icons.phone} dir="ltr">
          {mawkib.phoneNumber}
        </InfoItem>
        {showOwnerPhone && (
          <InfoItem icon={icons.phone} dir="ltr">
            مسئول: {ownerPhone}
          </InfoItem>
        )}
      </div>
    </div>
  );
}
