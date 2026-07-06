import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../components/ui/PageHeader';
import { NavIcon } from '../components/ui/NavIcons';
import { PersianDateInput } from '../components/ui/PersianDateInput';
import { MawkibFilterSelect } from '../components/mawkibs/MawkibFilterSelect';
import {
  mealPlanIconClass,
  mealPlanSecondaryBtn,
} from '../components/meal-plans/meal-plans-ui';
import {
  PresentAttendeesPrintButton,
  MealDeliveryCell,
} from '../components/meal-plans/PresentAttendeesPrintButton';
import { todayDateString } from '../components/reservations/reservation-form-ui';
import { useAuth } from '../contexts/AuthContext';
import { formatPersianNumber } from '../lib/capacity';
import { MEAL_TYPES, MEAL_TYPE_LABELS } from '../lib/meal-plan-utils';
import { mealPlansApi } from '../lib/meal-plans';
import { downloadPresentAttendeesExcel } from '../lib/present-attendees-export';
import {
  presentAttendeesReportApi,
  type PresentAttendeesReport,
} from '../lib/present-attendees-report';
import { toast, toastApiError } from '../lib/toast';
import type { MealType } from '../types';

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'total' | 'present' | 'absent';
}) {
  const toneClass =
    tone === 'present'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : tone === 'absent'
        ? 'border-amber-200 bg-amber-50 text-amber-900'
        : 'border-[#c5d4e8] bg-[#f0f4fa] text-[#3d5d8a]';

  return (
    <div
      className={`rounded-xl border px-4 py-3 shadow-sm ${toneClass}`}
    >
      <p className="text-[11px] font-medium opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">
        {formatPersianNumber(value)}
      </p>
    </div>
  );
}

function MealTypeToggle({
  value,
  onChange,
}: {
  value: MealType;
  onChange: (mealType: MealType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {MEAL_TYPES.map((mealType) => {
        const active = value === mealType;
        return (
          <button
            key={mealType}
            type="button"
            onClick={() => onChange(mealType)}
            className={`${mealPlanSecondaryBtn} !min-h-9 !px-3 ${
              active
                ? '!border-[#4a6fa5] !bg-[#e8eef6] !text-[#3d5d8a] ring-1 ring-[#4a6fa5]/20'
                : ''
            }`}
          >
            <NavIcon name="meals" className={mealPlanIconClass} strokeWidth={1.75} />
            {MEAL_TYPE_LABELS[mealType]}
          </button>
        );
      })}
    </div>
  );
}

export function PresentAttendeesReportPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('Admin') ?? false;
  const [mawkibId, setMawkibId] = useState('');
  const [date, setDate] = useState(todayDateString());
  const [mealType, setMealType] = useState<MealType>('Breakfast');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<PresentAttendeesReport | null>(null);
  const [servingReservationIds, setServingReservationIds] = useState<number[]>([]);
  const filterSectionRef = useRef<HTMLElement>(null);

  const { data: mawkibs = [] } = useQuery({
    queryKey: ['mawkibs-filter', isAdmin ? 'admin' : 'my'],
    queryFn: async () => {
      const { mawkibsApi } = await import('../lib/mawkibs');
      return isAdmin ? mawkibsApi.getAdminList() : mawkibsApi.getMyList();
    },
  });

  useEffect(() => {
    if (mawkibId || mawkibs.length === 0) return;
    if (mawkibs.length === 1) {
      setMawkibId(String(mawkibs[0].id));
    }
  }, [mawkibs, mawkibId]);

  useEffect(() => {
    const section = filterSectionRef.current;
    if (!section) return;

    const cs = getComputedStyle(section);
    // #region agent log
    fetch('http://127.0.0.1:7929/ingest/64824c4b-ac44-41b9-87b8-d1ea5f1d3aa4', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '06086f',
      },
      body: JSON.stringify({
        sessionId: '06086f',
        hypothesisId: 'H1',
        location: 'PresentAttendeesReportPage.tsx:filter-section-mount',
        message: 'Filter section overflow style on mount',
        data: {
          sectionOverflow: cs.overflow,
          sectionOverflowY: cs.overflowY,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, []);

  const handleSearch = async (event?: FormEvent) => {
    event?.preventDefault();

    if (!mawkibId) {
      toast.error('لطفاً موکب را انتخاب کنید');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const data = await presentAttendeesReportApi.get({
        mawkibId: Number(mawkibId),
        date,
        mealType,
      });
      setReport(data);
    } catch (err) {
      setReport(null);
      toastApiError(err, 'خطا در دریافت گزارش');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!report || report.rows.length === 0) {
      toast.error('داده‌ای برای دانلود وجود ندارد');
      return;
    }
    downloadPresentAttendeesExcel(report);
    toast.success('فایل اکسل دانلود شد');
  };

  const handleServe = async (reservationId: number, mealPlanId: number) => {
    setServingReservationIds((current) => [...current, reservationId]);
    try {
      await mealPlansApi.serve(mealPlanId);
      setReport((current) => {
        if (!current) return current;
        return {
          ...current,
          rows: current.rows.map((row) =>
            row.reservationId === reservationId
              ? { ...row, isServed: true }
              : row,
          ),
        };
      });
      toast.success('وعده غذایی با موفقیت تحویل ثبت شد');
    } catch (err) {
      toastApiError(err, 'خطا در ثبت تحویل');
    } finally {
      setServingReservationIds((current) =>
        current.filter((id) => id !== reservationId),
      );
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4 font-sans [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
      <PageHeader
        title="گزارش حاضرین"
        subtitle="فهرست زائران حاضر و غایب برای هر وعده غذایی"
      />

      <section
        ref={filterSectionRef}
        className="rounded-xl border border-slate-200/80 bg-white shadow-sm"
      >
        <form onSubmit={handleSearch} className="space-y-4 p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5]">
              <NavIcon name="reports" className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <h2 className="text-sm font-semibold text-slate-800">فیلتر گزارش</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-600">موکب</label>
              <MawkibFilterSelect
                value={mawkibId}
                onChange={setMawkibId}
                scope={isAdmin ? 'admin' : 'my'}
                placeholder="انتخاب موکب..."
                className="!min-h-9 w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-600">تاریخ</label>
              <PersianDateInput
                value={date}
                onChange={setDate}
                inputClassName="!min-h-9 w-full !py-2 !text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-600">وعده غذایی</label>
            <MealTypeToggle value={mealType} onChange={setMealType} />
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            <button
              type="submit"
              disabled={loading}
              className={`${mealPlanSecondaryBtn} !min-h-9 !px-3`}
            >
              <NavIcon name="track" className={mealPlanIconClass} strokeWidth={1.75} />
              {loading ? '...' : 'نمایش گزارش'}
            </button>
          </div>
        </form>
      </section>

      {searched && !loading && report && (
        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="تعداد کل زوار" value={report.stats.total} tone="total" />
            <StatCard label="تعداد حاضرین" value={report.stats.present} tone="present" />
            <StatCard label="تعداد غائبین" value={report.stats.absent} tone="absent" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PresentAttendeesPrintButton report={report} />
            <button
              type="button"
              onClick={handleDownload}
              disabled={!report.rows.length}
              className={mealPlanSecondaryBtn}
            >
              <NavIcon name="download" className={mealPlanIconClass} strokeWidth={1.75} />
              دانلود اکسل
            </button>
            <p className="ms-auto text-[11px] text-slate-500">
              {report.mawkibName} — {MEAL_TYPE_LABELS[report.mealType]}
            </p>
          </div>

          {report.rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-500">
              زائری با برنامه غذایی فعال برای این فیلتر یافت نشد.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-3 text-right font-semibold">ردیف</th>
                      <th className="px-3 py-3 text-right font-semibold">نام و نام خانوادگی</th>
                      <th className="px-3 py-3 text-right font-semibold">تلفن همراه</th>
                      <th className="px-3 py-3 text-right font-semibold">کد ملی</th>
                      <th className="px-3 py-3 text-center font-semibold">حضور</th>
                      <th className="px-3 py-3 text-center font-semibold">تحویل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows.map((row, index) => (
                      <tr
                        key={row.reservationId}
                        className="border-t border-slate-100 hover:bg-slate-50/60"
                      >
                        <td className="px-3 py-2.5 text-slate-500 tabular-nums">
                          {formatPersianNumber(index + 1)}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-slate-800">
                          {row.fullName}
                        </td>
                        <td className="px-3 py-2.5 text-slate-700" dir="ltr">
                          {row.mobile || '—'}
                        </td>
                        <td className="px-3 py-2.5 text-slate-700" dir="ltr">
                          {row.nationalId || '—'}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={
                              row.isPresent
                                ? 'font-medium text-emerald-700'
                                : 'text-amber-800'
                            }
                          >
                            {row.presence}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <MealDeliveryCell
                            mealPlanId={row.mealPlanId}
                            isServed={row.isServed}
                            serving={servingReservationIds.includes(row.reservationId)}
                            onServe={
                              row.mealPlanId
                                ? () => handleServe(row.reservationId, row.mealPlanId!)
                                : undefined
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {searched && !loading && !report && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
          گزارشی برای نمایش وجود ندارد.
        </div>
      )}
    </div>
  );
}
