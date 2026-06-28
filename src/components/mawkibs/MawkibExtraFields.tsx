import { inputClass } from '../../lib/styles';
import { MAWKIB_CITIES, MAWKIB_COUNTRIES } from '../../lib/mawkib-locations';
import type { MawkibCity, MawkibCountry } from '../../lib/mawkib-locations';
import type { MawkibExtraFields as MawkibExtraFieldsType } from '../../types';
import { SearchableSelect } from '../ui/SearchableSelect';
import { NavIcon } from '../ui/NavIcons';
import { FieldLabel, FormSection } from '../users/user-form-ui';

export type MawkibExtraFormValues = {
  distanceToShrine: string;
  lunchReception: boolean;
  breakfastReception: boolean;
  dinnerReception: boolean;
  bathroom: boolean;
  laundry: boolean;
  parking: boolean;
  internet: boolean;
  familyFriendly: boolean;
  maxReservationDays: string;
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

export function emptyMawkibExtraFields(): MawkibExtraFormValues {
  return {
    distanceToShrine: '',
    lunchReception: false,
    breakfastReception: false,
    dinnerReception: false,
    bathroom: false,
    laundry: false,
    parking: false,
    internet: false,
    familyFriendly: false,
    maxReservationDays: '',
    country: 'Iran',
    mawkibCity: '',
    rules: '',
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
    lunchReception: mawkib?.lunchReception ?? false,
    breakfastReception: mawkib?.breakfastReception ?? false,
    dinnerReception: mawkib?.dinnerReception ?? false,
    bathroom: mawkib?.bathroom ?? false,
    laundry: mawkib?.laundry ?? false,
    parking: mawkib?.parking ?? false,
    internet: mawkib?.internet ?? false,
    familyFriendly: mawkib?.familyFriendly ?? false,
    maxReservationDays: mawkib?.maxReservationDays?.toString() ?? '',
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
  const maxDays = fields.maxReservationDays.trim()
    ? parseInt(fields.maxReservationDays, 10)
    : undefined;

  return {
    distanceToShrine: fields.distanceToShrine.trim() || undefined,
    lunchReception: fields.lunchReception,
    breakfastReception: fields.breakfastReception,
    dinnerReception: fields.dinnerReception,
    bathroom: fields.bathroom,
    laundry: fields.laundry,
    parking: fields.parking,
    internet: fields.internet,
    familyFriendly: fields.familyFriendly,
    maxReservationDays: maxDays && maxDays >= 1 ? maxDays : undefined,
    country: fields.country,
    mawkibCity: fields.mawkibCity || undefined,
    rules: fields.rules.trim() || undefined,
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
  readOnly?: boolean;
}

export function MawkibExtraFields({ values, onChange, readOnly = false }: MawkibExtraFieldsProps) {
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
      <FormSection title="اطلاعات تکمیلی" icon={<NavIcon name="info" className="h-4 w-4" />}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <FieldLabel label="کشور" />
            <SearchableSelect
              value={values.country}
              onChange={(value) => setField('country', value as MawkibCountry)}
              options={MAWKIB_COUNTRIES.map((c) => ({ value: c.value, label: c.label }))}
              placeholder="انتخاب کشور"
              searchPlaceholder="جستجوی کشور..."
              className={inputClass}
              clearable={false}
              disabled={readOnly}
            />
          </label>
          <label className="block">
            <FieldLabel label="شهر" />
            <SearchableSelect
              value={values.mawkibCity}
              onChange={(value) => setField('mawkibCity', value as MawkibCity | '')}
              options={MAWKIB_CITIES.map((c) => ({ value: c.value, label: c.label }))}
              placeholder="انتخاب شهر"
              searchPlaceholder="جستجوی شهر..."
              className={inputClass}
              disabled={readOnly}
            />
          </label>
          <label className="block">
            <FieldLabel label="حداکثر بازه زمانی رزرو (روز)" />
            <input
              type="number"
              min={1}
              value={values.maxReservationDays}
              onChange={(e) => setField('maxReservationDays', e.target.value)}
              className={inputClass}
              placeholder="بدون محدودیت"
              {...fieldProps}
            />
          </label>
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
      </FormSection>

      <FormSection title="قوانین" icon={<NavIcon name="book" className="h-4 w-4" />}>
        <label className="block">
          <FieldLabel label="قوانین و مقررات" hint="اختیاری" />
        <textarea
          value={values.rules}
          onChange={(e) => setField('rules', e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="قوانین و مقررات موکب..."
          {...fieldProps}
        />
        </label>
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
