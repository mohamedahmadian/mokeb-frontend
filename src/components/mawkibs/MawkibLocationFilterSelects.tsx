import {
  MAWKIB_CITIES,
  MAWKIB_COUNTRIES,
  type MawkibCity,
  type MawkibCountry,
} from '../../lib/mawkib-locations';
import { filterInputClass } from '../../lib/styles';
import { SearchableSelect } from '../ui/SearchableSelect';

interface MawkibLocationFilterSelectsProps {
  country: MawkibCountry | '';
  mawkibCity: MawkibCity | '';
  onCountryChange: (country: MawkibCountry | '') => void;
  onCityChange: (mawkibCity: MawkibCity | '') => void;
  compact?: boolean;
}

export function MawkibLocationFilterSelects({
  country,
  mawkibCity,
  onCountryChange,
  onCityChange,
  compact = false,
}: MawkibLocationFilterSelectsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-2">
      <label className="block">
        {!compact && <span className="mb-1 block text-xs text-slate-500">کشور</span>}
        <SearchableSelect
          value={country}
          onChange={(value) => onCountryChange(value as MawkibCountry | '')}
          options={MAWKIB_COUNTRIES.map((c) => ({ value: c.value, label: c.label }))}
          placeholder="همه کشورها"
          searchPlaceholder="جستجوی کشور..."
          className={filterInputClass}
        />
      </label>
      <label className="block">
        {!compact && <span className="mb-1 block text-xs text-slate-500">شهر</span>}
        <SearchableSelect
          value={mawkibCity}
          onChange={(value) => onCityChange(value as MawkibCity | '')}
          options={MAWKIB_CITIES.map((c) => ({ value: c.value, label: c.label }))}
          placeholder="همه شهرها"
          searchPlaceholder="جستجوی شهر..."
          className={filterInputClass}
        />
      </label>
    </div>
  );
}
