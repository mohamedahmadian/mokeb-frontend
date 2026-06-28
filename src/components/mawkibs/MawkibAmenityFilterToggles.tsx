import { MAWKIB_AMENITY_FIELDS, type MawkibAmenityKey } from './MawkibExtraFields';

interface MawkibAmenityFilterTogglesProps {
  values: Partial<Record<MawkibAmenityKey, boolean>>;
  onChange: (key: MawkibAmenityKey, active: boolean) => void;
}

export function MawkibAmenityFilterToggles({
  values,
  onChange,
}: MawkibAmenityFilterTogglesProps) {
  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <span className="mb-2 block text-xs font-medium text-slate-600">امکانات</span>
      <div className="flex flex-wrap gap-2">
        {MAWKIB_AMENITY_FIELDS.map(({ key, label }) => {
          const active = values[key] ?? false;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(key, !active)}
              className={`min-h-9 rounded-xl border px-3 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-[#4a6fa5]/25 ${
                active
                  ? 'border-[#4a6fa5] bg-[#4a6fa5] text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
