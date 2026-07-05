import {
  DEFAULT_MAWKIB_DEFAULT_RESERVATION_DAYS,
  DEFAULT_MAWKIB_MAX_RESERVATION_DAYS,
} from '../../lib/date-range';
import {
  DEFAULT_MAWKIB_RULES,
  normalizeMawkibRulesText,
} from '../../lib/mawkib-rules-print';
import {
  MAWKIB_CITIES,
  MAWKIB_COUNTRIES,
  mawkibCityLabel,
  mawkibCountryLabel,
} from '../../lib/mawkib-locations';
import type { MawkibCity, MawkibCountry } from '../../lib/mawkib-locations';
import { inputClass } from '../../lib/styles';
import type { MawkibExtraFields as MawkibExtraFieldsType } from '../../types';
import { SearchableSelect } from '../ui/SearchableSelect';
import { NavIcon } from '../ui/NavIcons';
import { FieldLabel, FormSection } from '../users/user-form-ui';
import { MawkibRulesEditor } from './MawkibRulesEditor';

export type MawkibExtraFormValues = {
  distanceToShrine: string;
  distanceToBusStation: string;
  distanceToMetro: string;
  lunchReception: boolean;
  breakfastReception: boolean;
  dinnerReception: boolean;
  bathroom: boolean;
  laundry: boolean;
  parking: boolean;
  internet: boolean;
  familyFriendly: boolean;
  elevator: boolean;
  stairs: boolean;
  maxReservationDays: string;
  defaultReservationDays: string;
  country: MawkibCountry;
  mawkibCity: MawkibCity | '';
  rules: string;
  telegramChannel: string;
  whatsapp: string;
  bale: string;
  eitaa: string;
  websiteUrl: string;
};

export const MAWKIB_AMENITY_FIELDS = [
  { key: 'breakfastReception' as const, label: 'پذیرایی صبحانه' },
  { key: 'lunchReception' as const, label: 'پذیرایی ناهار' },
  { key: 'dinnerReception' as const, label: 'پذیرایی شام' },
  { key: 'bathroom' as const, label: 'حمام' },
  { key: 'laundry' as const, label: 'لباسشویی' },
  { key: 'parking' as const, label: 'پارکینگ' },
  { key: 'internet' as const, label: 'اینترنت' },
  { key: 'familyFriendly' as const, label: 'خانوادگی' },
  { key: 'elevator' as const, label: 'آسانسور' },
  { key: 'stairs' as const, label: 'پله' },
];

export type MawkibAmenityKey = (typeof MAWKIB_AMENITY_FIELDS)[number]['key'];

export function emptyMawkibAmenityFilters(): Record<MawkibAmenityKey, false> {
  return Object.fromEntries(
    MAWKIB_AMENITY_FIELDS.map(({ key }) => [key, false]),
  ) as Record<MawkibAmenityKey, false>;
}

export const MAWKIB_NOTIFY_FIELDS = [
  { key: 'telegramChannel' as const, label: 'کانال تلگرام', placeholder: 'آیدی یا لینک کانال' },
  { key: 'whatsapp' as const, label: 'واتس‌اپ', placeholder: 'شماره یا لینک' },
  { key: 'bale' as const, label: 'بله', placeholder: 'شماره یا آیدی' },
  { key: 'eitaa' as const, label: 'ایتا', placeholder: 'شماره یا آیدی' },
  { key: 'websiteUrl' as const, label: 'آدرس وب‌سایت', placeholder: 'https://...', type: 'url' as const },
];

const defaultMaxReservationDaysValue = String(DEFAULT_MAWKIB_MAX_RESERVATION_DAYS);
const defaultReservationDaysValue = String(DEFAULT_MAWKIB_DEFAULT_RESERVATION_DAYS);

export function emptyMawkibExtraFields(): MawkibExtraFormValues {
  return {
    distanceToShrine: '',
    distanceToBusStation: '',
    distanceToMetro: '',
    lunchReception: false,
    breakfastReception: false,
    dinnerReception: false,
    bathroom: false,
    laundry: false,
    parking: false,
    internet: false,
    familyFriendly: false,
    elevator: false,
    stairs: false,
    maxReservationDays: defaultMaxReservationDaysValue,
    defaultReservationDays: defaultReservationDaysValue,
    country: 'Iran',
    mawkibCity: '',
    rules: DEFAULT_MAWKIB_RULES,
    telegramChannel: '',
    whatsapp: '',
    bale: '',
    eitaa: '',
    websiteUrl: '',
  };
}

export function mawkibExtraFieldsFromMawkib(
  mawkib?: Partial<MawkibExtraFieldsType> | null,
): MawkibExtraFormValues {
  return {
    distanceToShrine: mawkib?.distanceToShrine ?? '',
    distanceToBusStation: mawkib?.distanceToBusStation ?? '',
    distanceToMetro: mawkib?.distanceToMetro ?? '',
    lunchReception: mawkib?.lunchReception ?? false,
    breakfastReception: mawkib?.breakfastReception ?? false,
    dinnerReception: mawkib?.dinnerReception ?? false,
    bathroom: mawkib?.bathroom ?? false,
    laundry: mawkib?.laundry ?? false,
    parking: mawkib?.parking ?? false,
    internet: mawkib?.internet ?? false,
    familyFriendly: mawkib?.familyFriendly ?? false,
    elevator: mawkib?.elevator ?? false,
    stairs: mawkib?.stairs ?? false,
    maxReservationDays:
      mawkib?.maxReservationDays?.toString() ?? defaultMaxReservationDaysValue,
    defaultReservationDays:
      mawkib?.defaultReservationDays?.toString() ?? defaultReservationDaysValue,
    country: mawkib?.country ?? 'Iran',
    mawkibCity: mawkib?.mawkibCity ?? '',
    rules: mawkib?.rules ?? '',
    telegramChannel: mawkib?.telegramChannel ?? '',
    whatsapp: mawkib?.whatsapp ?? '',
    bale: mawkib?.bale ?? '',
    eitaa: mawkib?.eitaa ?? '',
    websiteUrl: mawkib?.websiteUrl ?? '',
  };
}

export function mawkibExtraFieldsToPayload(
  fields: MawkibExtraFormValues,
): MawkibExtraFieldsType {
  const maxDaysRaw = fields.maxReservationDays.trim()
    ? parseInt(fields.maxReservationDays, 10)
    : DEFAULT_MAWKIB_MAX_RESERVATION_DAYS;
  const defaultDaysRaw = fields.defaultReservationDays.trim()
    ? parseInt(fields.defaultReservationDays, 10)
    : DEFAULT_MAWKIB_DEFAULT_RESERVATION_DAYS;
  const maxDays =
    maxDaysRaw >= 1 ? maxDaysRaw : DEFAULT_MAWKIB_MAX_RESERVATION_DAYS;
  const defaultDays =
    defaultDaysRaw >= 1
      ? Math.min(defaultDaysRaw, maxDays)
      : DEFAULT_MAWKIB_DEFAULT_RESERVATION_DAYS;

  return {
    distanceToShrine: fields.distanceToShrine.trim() || undefined,
    distanceToBusStation: fields.distanceToBusStation.trim() || undefined,
    distanceToMetro: fields.distanceToMetro.trim() || undefined,
    lunchReception: fields.lunchReception,
    breakfastReception: fields.breakfastReception,
    dinnerReception: fields.dinnerReception,
    bathroom: fields.bathroom,
    laundry: fields.laundry,
    parking: fields.parking,
    internet: fields.internet,
    familyFriendly: fields.familyFriendly,
    elevator: fields.elevator,
    stairs: fields.stairs,
    maxReservationDays: maxDays,
    defaultReservationDays: defaultDays,
    country: fields.country,
    mawkibCity: fields.mawkibCity || undefined,
    rules: normalizeMawkibRulesText(fields.rules),
    telegramChannel: fields.telegramChannel.trim() || undefined,
    whatsapp: fields.whatsapp.trim() || undefined,
    bale: fields.bale.trim() || undefined,
    eitaa: fields.eitaa.trim() || undefined,
    websiteUrl: fields.websiteUrl.trim() || undefined,
  };
}

interface MawkibExtraFieldsProps {
  values: MawkibExtraFormValues;
  onChange: (values: MawkibExtraFormValues) => void;
  facilities?: string;
  onFacilitiesChange?: (facilities: string) => void;
  readOnly?: boolean;
}

export function MawkibExtraFields({
  values,
  onChange,
  facilities,
  onFacilitiesChange,
  readOnly = false,
}: MawkibExtraFieldsProps) {
  const setField = <K extends keyof MawkibExtraFormValues>(
    key: K,
    value: MawkibExtraFormValues[K],
  ) => {
    if (readOnly) return;
    onChange({ ...values, [key]: value });
  };

  const fieldProps = readOnly ? { disabled: true, readOnly: true } : {};

  return (
    <div className="space-y-4">
      <FormSection
        title="اطلاعات تکمیلی"
        icon={<NavIcon name="info" className="h-4 w-4" />}
        className="overflow-visible"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="block">
            <FieldLabel label="کشور" />
            {readOnly ? (
              <input
                type="text"
                value={mawkibCountryLabel(values.country)}
                className={inputClass}
                {...fieldProps}
              />
            ) : (
              <SearchableSelect
                value={values.country}
                onChange={(value) => setField('country', value as MawkibCountry)}
                options={MAWKIB_COUNTRIES.map((c) => ({ value: c.value, label: c.label }))}
                placeholder="انتخاب کشور"
                searchPlaceholder="جستجوی کشور..."
                className={inputClass}
                clearable={false}
              />
            )}
          </div>
          <div className="block">
            <FieldLabel label="شهر" />
            {readOnly ? (
              <input
                type="text"
                value={values.mawkibCity ? mawkibCityLabel(values.mawkibCity) : '—'}
                className={inputClass}
                {...fieldProps}
              />
            ) : (
              <SearchableSelect
                value={values.mawkibCity}
                onChange={(value) => setField('mawkibCity', value as MawkibCity | '')}
                options={MAWKIB_CITIES.map((c) => ({ value: c.value, label: c.label }))}
                placeholder="انتخاب شهر"
                searchPlaceholder="جستجوی شهر..."
                className={inputClass}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <FieldLabel label="فاصله تا حرم" />
            <input
              type="text"
              value={values.distanceToShrine}
              onChange={(e) => setField('distanceToShrine', e.target.value)}
              className={inputClass}
              placeholder="مثلاً ۵۰۰ متر"
              {...fieldProps}
            />
          </label>
          <label className="block">
            <FieldLabel label="فاصله تا ایستگاه اتوبوس" />
            <input
              type="text"
              value={values.distanceToBusStation}
              onChange={(e) => setField('distanceToBusStation', e.target.value)}
              className={inputClass}
              placeholder="مثلاً ۲۰۰ متر"
              {...fieldProps}
            />
          </label>
          <label className="block sm:col-span-2">
            <FieldLabel label="فاصله تا مترو" />
            <input
              type="text"
              value={values.distanceToMetro}
              onChange={(e) => setField('distanceToMetro', e.target.value)}
              className={inputClass}
              placeholder="مثلاً ۱ کیلومتر"
              {...fieldProps}
            />
          </label>
        </div>
      </FormSection>

      <FormSection title="امکانات" icon={<NavIcon name="mawkibs" className="h-4 w-4" />}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {MAWKIB_AMENITY_FIELDS.map(({ key, label }) => (
            <label
              key={key}
              className={`flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 ${
                readOnly ? 'bg-slate-50' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={values[key]}
                onChange={(e) => setField(key, e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#4a6fa5] focus:ring-[#4a6fa5]"
                disabled={readOnly}
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
        </div>

        {facilities !== undefined && onFacilitiesChange && (
          <label className="block">
            <FieldLabel label="امکانات" />
            <textarea
              value={facilities}
              onChange={(e) => {
                if (readOnly) return;
                onFacilitiesChange(e.target.value);
              }}
              rows={2}
              className={inputClass}
              placeholder="اسکان، پارکینگ، حمام..."
              {...fieldProps}
            />
          </label>
        )}
      </FormSection>

      <FormSection title="قوانین" icon={<NavIcon name="book" className="h-4 w-4" />}>
        <MawkibRulesEditor
          value={values.rules}
          onChange={(rules) => setField('rules', rules)}
          readOnly={readOnly}
        />
      </FormSection>

      <FormSection title="اطلاع‌رسانی" icon={<NavIcon name="feedback" className="h-4 w-4" />}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MAWKIB_NOTIFY_FIELDS.map(({ key, label, placeholder, type }) => (
            <label key={key} className="block">
              <FieldLabel label={label} />
              <input
                type={type ?? 'text'}
                value={values[key]}
                onChange={(e) => setField(key, e.target.value)}
                className={inputClass}
                placeholder={placeholder}
                dir={type === 'url' ? 'ltr' : undefined}
                {...fieldProps}
              />
            </label>
          ))}
        </div>
      </FormSection>
    </div>
  );
}
