export type GuestReservationMode = 'fast' | 'normal';

interface GuestReservationModeToggleProps {
  value: GuestReservationMode;
  onChange: (value: GuestReservationMode) => void;
}

export function GuestReservationModeToggle({
  value,
  onChange,
}: GuestReservationModeToggleProps) {
  return (
    <div
      className="inline-flex rounded-xl border border-slate-200 bg-slate-50/80 p-1"
      role="group"
      aria-label="نوع رزرو"
    >
      <button
        type="button"
        onClick={() => onChange('fast')}
        className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
          value === 'fast'
            ? 'bg-white text-[#3d5d8a] shadow-sm ring-1 ring-slate-200/80'
            : 'text-slate-600 hover:text-slate-800'
        }`}
        aria-pressed={value === 'fast'}
      >
        رزرو سریع
      </button>
      <button
        type="button"
        onClick={() => onChange('normal')}
        className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
          value === 'normal'
            ? 'bg-white text-[#3d5d8a] shadow-sm ring-1 ring-slate-200/80'
            : 'text-slate-600 hover:text-slate-800'
        }`}
        aria-pressed={value === 'normal'}
      >
        عادی
      </button>
    </div>
  );
}
