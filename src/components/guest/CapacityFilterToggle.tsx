interface CapacityFilterToggleProps {
  /** When true, only mawkibs with available capacity are shown. */
  onlyAvailable: boolean;
  onChange: (onlyAvailable: boolean) => void;
}

export function CapacityFilterToggle({
  onlyAvailable,
  onChange,
}: CapacityFilterToggleProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-600">وضعیت رزرو</span>
      <div className="flex h-[46px] w-fit items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3">
        <button
          type="button"
          role="switch"
          aria-checked={onlyAvailable}
          aria-label={
            onlyAvailable
              ? 'فقط موکب‌های دارای ظرفیت خالی'
              : 'نمایش همه موکب‌ها'
          }
          onClick={() => onChange(!onlyAvailable)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4a6fa5]/25 ${
            onlyAvailable ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ease-out ${
              onlyAvailable ? 'start-[calc(100%-1.25rem-2px)]' : 'start-0.5'
            }`}
          />
        </button>
        <span
          className={`text-xs font-medium transition-colors ${
            onlyAvailable ? 'text-emerald-700' : 'text-slate-600'
          }`}
        >
          {onlyAvailable ? 'خالی' : 'همه موکب‌ها'}
        </span>
      </div>
    </div>
  );
}
