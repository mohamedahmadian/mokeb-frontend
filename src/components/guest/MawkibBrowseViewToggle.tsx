export type MawkibBrowseView = 'list' | 'map';

interface MawkibBrowseViewToggleProps {
  value: MawkibBrowseView;
  onChange: (value: MawkibBrowseView) => void;
}

function IconList() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm0 5.25h.007v.008H3.75V12zm0 5.25h.007v.008H3.75v-.008z" />
    </svg>
  );
}

function IconMap() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.25c.375-.175.622-.548.622-.934V6.412c0-.858-.755-1.392-1.368-.973l-3.926 2.252a1.125 1.125 0 01-1.368 0L9.75 5.443A1.125 1.125 0 008.382 4.47L3.507 6.72c-.375.175-.622.548-.622.934v6.412c0 .858.755 1.392 1.368.973l3.926-2.252a1.125 1.125 0 011.368 0z" />
    </svg>
  );
}

export function MawkibBrowseViewToggle({
  value,
  onChange,
}: MawkibBrowseViewToggleProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-600">نمایش</span>
      <div
        className="inline-flex h-[46px] rounded-xl border border-slate-200 bg-white p-1"
        role="group"
        aria-label="تغییر نمایش موکب‌ها"
      >
        <button
          type="button"
          onClick={() => onChange('list')}
          aria-pressed={value === 'list'}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
            value === 'list'
              ? 'bg-[#4a6fa5] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <IconList />
          لیست
        </button>
        <button
          type="button"
          onClick={() => onChange('map')}
          aria-pressed={value === 'map'}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
            value === 'map'
              ? 'bg-[#4a6fa5] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <IconMap />
          نقشه
        </button>
      </div>
    </div>
  );
}

export function parseMawkibBrowseView(value: string | null): MawkibBrowseView {
  return value === 'map' ? 'map' : 'list';
}
