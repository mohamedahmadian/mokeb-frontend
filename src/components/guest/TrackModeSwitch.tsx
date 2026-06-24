export type TrackMode = 'code' | 'mobile';

interface TrackModeSwitchProps {
  value: TrackMode;
  onChange: (value: TrackMode) => void;
}

export function TrackModeSwitch({ value, onChange }: TrackModeSwitchProps) {
  return (
    <div
      className="relative flex rounded-xl border border-slate-200 bg-slate-100 p-1"
      role="tablist"
      aria-label="روش پیگیری رزرو"
    >
      <span
        className={`pointer-events-none absolute inset-y-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm transition-all duration-200 ${
          value === 'mobile' ? 'start-[calc(50%+2px)]' : 'start-1'
        }`}
        aria-hidden
      />
      <button
        type="button"
        role="tab"
        aria-selected={value === 'code'}
        onClick={() => onChange('code')}
        className={`relative z-10 flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          value === 'code' ? 'text-[#4a6fa5]' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        کد رزرو
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === 'mobile'}
        onClick={() => onChange('mobile')}
        className={`relative z-10 flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          value === 'mobile' ? 'text-[#4a6fa5]' : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        شماره موبایل
      </button>
    </div>
  );
}
