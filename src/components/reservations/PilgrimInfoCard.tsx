import { IconPhone, IconUser } from './reservation-form-ui';

interface PilgrimInfoCardProps {
  fullName: string;
  mobileNumber: string;
  city?: string | null;
}

export function PilgrimInfoCard({
  fullName,
  mobileNumber,
  city,
}: PilgrimInfoCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50/90 to-white shadow-sm">
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5] ring-1 ring-[#c5d4e8]">
            <IconUser />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-500">نام و نام خانوادگی</p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-800">
              {fullName}
            </p>
            {city && (
              <p className="mt-1 text-xs text-slate-400">{city}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#4a6fa5] shadow-sm ring-1 ring-slate-100">
            <IconPhone />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-500">شماره موبایل</p>
            <p className="mt-1 text-sm font-semibold tracking-wide text-slate-800 text-right">
              {mobileNumber}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
