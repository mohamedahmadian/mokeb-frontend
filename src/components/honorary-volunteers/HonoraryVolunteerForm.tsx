import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ProvinceCitySelect } from '../ui/ProvinceCitySelect';
import { SearchableSelect } from '../ui/SearchableSelect';
import {
  formatPersianDateRange,
  PersianDateRangePicker,
} from '../ui/PersianDateRangePicker';
import { GuestPageHeader, GuestShell } from '../guest/GuestShell';
import { guestTheme } from '../../lib/guest-theme';
import { toast, toastApiError } from '../../lib/toast';
import {
  HONORARY_VOLUNTEER_SERVICE_OPTIONS,
  type HonoraryVolunteerServiceType,
} from '../../lib/honorary-volunteer';
import { mawkibsApi } from '../../lib/mawkibs';
import type { HonoraryVolunteerApplication } from '../../types';

const inputClass = guestTheme.input;

export interface HonoraryVolunteerFormValues {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  password: string;
  province: string;
  city: string;
  mawkibId: number | null;
  description: string;
  serviceTypes: HonoraryVolunteerServiceType[];
  serviceDescription: string;
  availabilityStartDate: string;
  availabilityEndDate: string;
  availabilityDescription: string;
}

interface LockedPersonalInfo {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  province?: string;
  city?: string;
}

interface HonoraryVolunteerFormProps {
  title: string;
  subtitle: string;
  submitLabel: string;
  cancelTo?: string;
  showMawkibSelect?: boolean;
  mawkibOptions?: { id: number; name: string }[];
  initialValues?: Partial<HonoraryVolunteerFormValues>;
  prefillNotice?: string;
  hidePersonalFields?: boolean;
  lockedPersonalInfo?: LockedPersonalInfo;
  embedded?: boolean;
  showPassword?: boolean;
  onBack?: () => void;
  onSubmit: (values: HonoraryVolunteerFormValues) => Promise<void>;
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-800 sm:text-lg">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function IconUser() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function IconHand() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.955m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.25a7.5 7.5 0 0015 0v-5.25a1.575 1.575 0 013.15 0v3.75m-6.45-3.75h.008v.008H12.75v-.008zm0 3h.008v.008H12.75V15zm0 3h.008v.008H12.75V18z" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function IconHome() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

export function applicationToFormValues(
  app: HonoraryVolunteerApplication,
): HonoraryVolunteerFormValues {
  return {
    firstName: app.firstName,
    lastName: app.lastName,
    mobileNumber: app.mobileNumber,
    password: '',
    province: app.province ?? '',
    city: app.city ?? '',
    mawkibId: app.mawkibId ?? null,
    description: app.description ?? '',
    serviceTypes: app.serviceTypes as HonoraryVolunteerServiceType[],
    serviceDescription: app.serviceDescription ?? '',
    availabilityStartDate: app.availabilityStartDate.slice(0, 10),
    availabilityEndDate: app.availabilityEndDate.slice(0, 10),
    availabilityDescription: app.availabilityDescription ?? '',
  };
}

export function HonoraryVolunteerForm({
  title,
  subtitle,
  submitLabel,
  cancelTo = '/',
  showMawkibSelect = true,
  mawkibOptions,
  initialValues,
  prefillNotice,
  hidePersonalFields = false,
  lockedPersonalInfo,
  embedded = false,
  showPassword = true,
  onBack,
  onSubmit,
}: HonoraryVolunteerFormProps) {
  const resolvedPersonal = lockedPersonalInfo ?? {
    firstName: initialValues?.firstName ?? '',
    lastName: initialValues?.lastName ?? '',
    mobileNumber: initialValues?.mobileNumber ?? '',
    province: initialValues?.province,
    city: initialValues?.city,
  };

  const [firstName, setFirstName] = useState(resolvedPersonal.firstName);
  const [lastName, setLastName] = useState(resolvedPersonal.lastName);
  const [mobileNumber, setMobileNumber] = useState(resolvedPersonal.mobileNumber);
  const [password, setPassword] = useState(initialValues?.password ?? '');
  const [province, setProvince] = useState(resolvedPersonal.province ?? initialValues?.province ?? '');
  const [city, setCity] = useState(resolvedPersonal.city ?? initialValues?.city ?? '');
  const [mawkibId, setMawkibId] = useState<number | null>(initialValues?.mawkibId ?? null);
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [serviceTypes, setServiceTypes] = useState<HonoraryVolunteerServiceType[]>(
    initialValues?.serviceTypes ?? [],
  );
  const [serviceDescription, setServiceDescription] = useState(
    initialValues?.serviceDescription ?? '',
  );
  const [availabilityStartDate, setAvailabilityStartDate] = useState(
    initialValues?.availabilityStartDate ?? '',
  );
  const [availabilityEndDate, setAvailabilityEndDate] = useState(
    initialValues?.availabilityEndDate ?? '',
  );
  const [availabilityDescription, setAvailabilityDescription] = useState(
    initialValues?.availabilityDescription ?? '',
  );
  const [submitting, setSubmitting] = useState(false);

  const { data: publicMawkibs = [] } = useQuery({
    queryKey: ['mawkibs-public-select'],
    queryFn: () => mawkibsApi.getPublicList(),
    enabled: showMawkibSelect && !mawkibOptions,
  });

  const mawkibs = mawkibOptions ?? publicMawkibs.map((m) => ({ id: m.id, name: m.name }));

  const mawkibSelectOptions = useMemo(
    () => mawkibs.map((m) => ({ value: String(m.id), label: m.name })),
    [mawkibs],
  );

  const toggleServiceType = (value: HonoraryVolunteerServiceType) => {
    setServiceTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!hidePersonalFields) {
      if (!firstName.trim() || !lastName.trim() || !mobileNumber.trim()) {
        toast.error('نام، نام خانوادگی و شماره موبایل الزامی است');
        return;
      }

      if (showPassword && !embedded && password.trim().length < 6) {
        toast.error('رمز عبور باید حداقل ۶ کاراکتر باشد');
        return;
      }
    }

    if (serviceTypes.length === 0) {
      toast.error('حداقل یک حوزه خدمت را انتخاب کنید');
      return;
    }

    if (!availabilityStartDate || !availabilityEndDate) {
      toast.error('بازه زمانی آمادگی همکاری را مشخص کنید');
      return;
    }

    if (availabilityEndDate < availabilityStartDate) {
      toast.error('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobileNumber: mobileNumber.trim(),
        password: password.trim(),
        province: province.trim(),
        city: city.trim(),
        mawkibId,
        description: description.trim(),
        serviceTypes,
        serviceDescription: serviceDescription.trim(),
        availabilityStartDate,
        availabilityEndDate,
        availabilityDescription: availabilityDescription.trim(),
      });
    } catch (err) {
      toastApiError(err, 'خطا در ثبت درخواست. لطفاً دوباره تلاش کنید');
    } finally {
      setSubmitting(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className={`${guestTheme.cardLg} space-y-6`}>
        {prefillNotice && (
          <div className="flex items-start gap-3 rounded-xl border border-[#c5d4e8] bg-[#f0f4fa] p-4 text-sm leading-7 text-[#3d5d8a]">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-[#4a6fa5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            <p>{prefillNotice}</p>
          </div>
        )}
        <section>
          <SectionHeader icon={<IconUser />} title="اطلاعات شما" />
          {hidePersonalFields ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">نام و نام خانوادگی</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {firstName} {lastName}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">شماره موبایل</p>
                  <p className="mt-1 font-mono text-sm font-medium text-slate-800" dir="ltr">
                    {mobileNumber}
                  </p>
                </div>
                {(province || city) && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 sm:col-span-2">
                    <p className="text-xs text-slate-500">استان و شهر</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {[province, city].filter(Boolean).join(' — ') || '—'}
                    </p>
                  </div>
                )}
              </div>
              <label className="mt-3 block">
                <span className="mb-1.5 block text-sm text-slate-600">توضیحات</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${inputClass} min-h-[88px] resize-y`}
                  rows={3}
                />
              </label>
            </>
          ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm text-slate-600">نام *</span>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm text-slate-600">نام خانوادگی *</span>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">شماره موبایل *</span>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className={inputClass}
                dir="ltr"
              />
            </label>
            {showPassword && !embedded && (
              <label className="block">
                <span className="mb-1.5 block text-sm text-slate-600">رمز عبور *</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="حداقل ۶ کاراکتر"
                />
                <p className="mt-1 text-xs text-slate-400">
                  با این رمز عبور می‌توانید وارد پنل و پیگیری درخواست‌ها شوید
                </p>
              </label>
            )}
            <ProvinceCitySelect
              province={province}
              city={city}
              onProvinceChange={setProvince}
              onCityChange={setCity}
            />
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">توضیحات</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClass} min-h-[88px] resize-y`}
                rows={3}
              />
            </label>
          </div>
          )}
        </section>

        {showMawkibSelect && (
          <>
            <hr className="border-slate-100" />
            <section>
              <SectionHeader
                icon={<IconHome />}
                title="موکب (اختیاری)"
                subtitle="در صورت تمایل موکب مورد نظر برای خدمت را انتخاب کنید"
              />
              <label className="block">
                <span className="mb-1.5 block text-sm text-slate-600">انتخاب موکب</span>
                <SearchableSelect
                  value={mawkibId != null ? String(mawkibId) : ''}
                  onChange={(value) => setMawkibId(value ? Number(value) : null)}
                  options={mawkibSelectOptions}
                  placeholder="بدون انتخاب موکب"
                  searchPlaceholder="جستجوی موکب..."
                  emptyMessage="موکبی یافت نشد"
                />
              </label>
            </section>
          </>
        )}

        <hr className="border-slate-100" />

        <section>
          <SectionHeader icon={<IconHand />} title="حوزه خدمت" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {HONORARY_VOLUNTEER_SERVICE_OPTIONS.map((option) => {
              const checked = serviceTypes.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition ${
                    checked
                      ? 'border-[#4a6fa5] bg-[#f0f4fa]'
                      : 'border-slate-200 bg-white hover:border-[#c5d4e8]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleServiceType(option.value)}
                    className="h-4 w-4 rounded border-slate-300 text-[#4a6fa5]"
                  />
                  <span className="text-sm font-medium text-slate-700">{option.label}</span>
                </label>
              );
            })}
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm text-slate-600">توضیحات کامل خدمت</span>
            <textarea
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              className={`${inputClass} min-h-[120px] resize-y`}
              rows={4}
            />
          </label>
        </section>

        <hr className="border-slate-100" />

        <section>
          <SectionHeader icon={<IconCalendar />} title="تاریخ خدمت" />
          <div className="space-y-4">
            <PersianDateRangePicker
              startDate={availabilityStartDate}
              endDate={availabilityEndDate}
              onChange={(start, end) => {
                setAvailabilityStartDate(start);
                setAvailabilityEndDate(end);
              }}
            />
            {availabilityStartDate && availabilityEndDate && (
              <p className="text-sm text-slate-500">
                بازه انتخابی:{' '}
                {formatPersianDateRange(availabilityStartDate, availabilityEndDate)}
              </p>
            )}
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">توضیحات زمان حضور</span>
              <textarea
                value={availabilityDescription}
                onChange={(e) => setAvailabilityDescription(e.target.value)}
                className={`${inputClass} min-h-[88px] resize-y`}
                rows={3}
              />
            </label>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          {!embedded && (
            onBack ? (
              <button type="button" onClick={onBack} className={`${guestTheme.btnSecondary} w-full sm:w-auto`}>
                بازگشت
              </button>
            ) : (
              <Link to={cancelTo} className={`${guestTheme.btnSecondary} w-full sm:w-auto`}>
                انصراف
              </Link>
            )
          )}
          <button
            type="submit"
            disabled={submitting}
            className={`${guestTheme.btnPrimaryLg} sm:w-auto sm:px-8`}
          >
            {submitting ? 'در حال ثبت...' : submitLabel}
          </button>
        </div>
      </form>
  );

  if (embedded) return formContent;

  return (
    <GuestShell maxWidth="lg">
      <GuestPageHeader icon={<IconHand />} title={title} subtitle={subtitle} />
      {formContent}
    </GuestShell>
  );
}
