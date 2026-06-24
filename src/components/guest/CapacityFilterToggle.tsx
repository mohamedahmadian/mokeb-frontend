export type CapacityView = 'available' | 'full';

interface CapacityFilterToggleProps {
  value: CapacityView;
  onChange: (value: CapacityView) => void;
}

export function CapacityFilterToggle({ value, onChange }: CapacityFilterToggleProps) {
  const isFull = value === 'full';

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-600">وضعیت ظرفیت</span>
      <div className="flex h-[46px] w-fit items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3">
        <span
          className={`text-xs font-medium transition-colors ${
            !isFull ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          خالی
        </span>

        <button
          type="button"
          role="switch"
          aria-checked={isFull}
          aria-label={isFull ? 'نمایش موکب‌های پر' : 'نمایش موکب‌های خالی'}
          onClick={() => onChange(isFull ? 'available' : 'full')}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4a6fa5]/25 ${
            isFull ? 'bg-amber-400' : 'bg-emerald-500'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ease-out ${
              isFull ? 'start-[calc(100%-1.25rem-2px)]' : 'start-0.5'
            }`}
          />
        </button>

        <span
          className={`text-xs font-medium transition-colors ${
            isFull ? 'text-amber-600' : 'text-slate-400'
          }`}
        >
          پر
        </span>
      </div>
    </div>
  );
}
