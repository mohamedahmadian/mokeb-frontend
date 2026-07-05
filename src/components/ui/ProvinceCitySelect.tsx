import { useMemo } from 'react';
import {
  getCityOptionsForCountryProvince,
  getProvinceOptionsForCountry,
  countryHasCityList,
  countryHasProvinceList,
} from '../../lib/country-locations';
import { DEFAULT_USER_COUNTRY } from '../../lib/countries';
import { filterInputClass, inputClass } from '../../lib/styles';
import { useIranLocations } from '../../lib/use-iran-locations';
import { LocationCombobox } from './LocationCombobox';

interface ProvinceCitySelectProps {
  country?: string;
  province: string;
  city: string;
  onProvinceChange: (province: string) => void;
  onCityChange: (city: string) => void;
  provinceLabel?: string;
  cityLabel?: string;
  disabled?: boolean;
  compact?: boolean;
  /** Renders province and city as separate labeled fields without an outer grid (for parent layouts). */
  inline?: boolean;
  inputClassName?: string;
}

export function ProvinceCitySelect({
  country = DEFAULT_USER_COUNTRY,
  province,
  city,
  onProvinceChange,
  onCityChange,
  provinceLabel = 'استان',
  cityLabel = 'شهر',
  disabled = false,
  compact = false,
  inline = false,
  inputClassName,
}: ProvinceCitySelectProps) {
  const { data: locations = [], isLoading: iranLoading } = useIranLocations();

  const normalizedCountry = country.trim() || DEFAULT_USER_COUNTRY;
  const isIran = normalizedCountry === 'ایران';
  const loading = isIran && iranLoading;

  const provinceOptions = useMemo(
    () => getProvinceOptionsForCountry(normalizedCountry, province, locations),
    [normalizedCountry, province, locations],
  );

  const cityOptions = useMemo(
    () => getCityOptionsForCountryProvince(normalizedCountry, province, city, locations),
    [normalizedCountry, province, city, locations],
  );

  const selectClass = inputClassName ?? (compact ? filterInputClass : inputClass);
  const hasProvinceList = countryHasProvinceList(normalizedCountry);
  const hasCityList = countryHasCityList(normalizedCountry);

  const provinceField = (
    <LocationCombobox
      value={province}
      onChange={(value) => {
        onProvinceChange(value);
        if (value !== province) onCityChange('');
      }}
      options={provinceOptions}
      placeholder={hasProvinceList ? 'انتخاب یا وارد کردن استان' : 'نام استان را وارد کنید'}
      disabled={disabled}
      inputClassName={selectClass}
      loading={loading}
      manualEntryHint={
        hasProvinceList
          ? undefined
          : 'برای این کشور لیست استان نداریم؛ نام استان را دستی وارد کنید'
      }
    />
  );

  const cityField = (
    <LocationCombobox
      value={city}
      onChange={onCityChange}
      options={cityOptions}
      placeholder={
        hasCityList
          ? province
            ? 'انتخاب یا وارد کردن شهر'
            : 'ابتدا استان را انتخاب کنید'
          : 'نام شهر را وارد کنید'
      }
      disabled={disabled || loading}
      inputClassName={selectClass}
      loading={loading}
      manualEntryHint={
        hasCityList
          ? undefined
          : 'برای این کشور لیست شهر نداریم؛ نام شهر را دستی وارد کنید'
      }
    />
  );

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {provinceField}
        {cityField}
      </div>
    );
  }

  if (inline) {
    return (
      <>
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-600">{provinceLabel}</span>
          {provinceField}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-600">{cityLabel}</span>
          {cityField}
        </label>
      </>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-sm text-slate-600">{provinceLabel}</span>
        {provinceField}
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-slate-600">{cityLabel}</span>
        {cityField}
      </label>
    </div>
  );
}
