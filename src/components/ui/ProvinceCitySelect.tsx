import { useMemo } from 'react';
import {
  getCitiesByProvinceFromLocations,
  getProvincesFromLocations,
} from '../../lib/iran-locations';
import { filterInputClass, inputClass } from '../../lib/styles';
import { useIranLocations } from '../../lib/use-iran-locations';
import { SearchableSelect } from './SearchableSelect';

interface ProvinceCitySelectProps {
  province: string;
  city: string;
  onProvinceChange: (province: string) => void;
  onCityChange: (city: string) => void;
  provinceLabel?: string;
  cityLabel?: string;
  disabled?: boolean;
  compact?: boolean;
}

export function ProvinceCitySelect({
  province,
  city,
  onProvinceChange,
  onCityChange,
  provinceLabel = 'استان',
  cityLabel = 'شهر',
  disabled = false,
  compact = false,
}: ProvinceCitySelectProps) {
  const { data: locations = [] } = useIranLocations();

  const provinceOptions = useMemo(() => {
    const provinces = getProvincesFromLocations(locations);
    if (province && !provinces.includes(province)) {
      return [province, ...provinces];
    }
    return provinces;
  }, [locations, province]);

  const cityOptions = useMemo(() => {
    const cities = province ? getCitiesByProvinceFromLocations(locations, province) : [];
    if (city && !cities.includes(city)) {
      return [city, ...cities];
    }
    return cities;
  }, [locations, province, city]);

  const selectClass = compact ? filterInputClass : inputClass;
  const isLoading = locations.length === 0;

  const provinceSelect = (
    <SearchableSelect
      value={province}
      onChange={(value) => {
        onProvinceChange(value);
        if (value !== province) onCityChange('');
      }}
      options={provinceOptions}
      placeholder={
        isLoading ? 'در حال بارگذاری...' : compact ? 'استان' : 'انتخاب استان'
      }
      searchPlaceholder="جستجوی استان..."
      disabled={disabled || isLoading}
      className={selectClass}
      emptyMessage="استانی یافت نشد"
    />
  );

  const citySelect = (
    <SearchableSelect
      value={city}
      onChange={onCityChange}
      options={cityOptions}
      placeholder={
        compact
          ? 'شهر'
          : province
            ? 'انتخاب شهر'
            : 'ابتدا استان را انتخاب کنید'
      }
      searchPlaceholder="جستجوی شهر..."
      disabled={disabled || !province || isLoading}
      className={selectClass}
      emptyMessage="شهری یافت نشد"
    />
  );

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {provinceSelect}
        {citySelect}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-sm text-slate-600">{provinceLabel}</span>
        {provinceSelect}
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-slate-600">{cityLabel}</span>
        {citySelect}
      </label>
    </div>
  );
}
