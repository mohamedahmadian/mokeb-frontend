import { useQuery } from '@tanstack/react-query';
import { NavIcon } from '../../components/ui/NavIcons';
import { DonutChart } from '../../components/reports/DonutChart';
import { HorizontalBarChart } from '../../components/reports/HorizontalBarChart';
import { VerticalBarChart } from '../../components/reports/VerticalBarChart';
import {
  ReportChartCard,
  ReportStatCard,
} from '../../components/reports/ReportStatCard';
import {
  ReportErrorState,
  ReportLoadingState,
  ReportPageHeader,
} from '../../components/reports/ReportPageHeader';
import { reportsApi } from '../../lib/reports';
import { formatPersianNumber } from '../../lib/capacity';

const STATUS_COLORS: Record<string, string> = {
  'تأیید شده': '#14b8a6',
  'در انتظار': '#f59e0b',
  'رد شده': '#ef4444',
  'لغو شده': '#94a3b8',
  'منقضی شده': '#7c3aed',
};

const GUEST_COLORS = {
  male: '#4a6fa5',
  female: '#db2777',
};

function HighlightPill({
  label,
  value,
  tone = 'blue',
}: {
  label: string;
  value: string;
  tone?: 'blue' | 'teal' | 'amber' | 'rose';
}) {
  const tones = {
    blue: 'border-[#c5d4e8]/70 bg-[#eef3fa] text-[#3d5d8a]',
    teal: 'border-teal-100 bg-teal-50 text-teal-800',
    amber: 'border-amber-100 bg-amber-50 text-amber-800',
    rose: 'border-rose-100 bg-rose-50 text-rose-800',
  };

  return (
    <div className={`rounded-xl border px-4 py-3 ${tones[tone]}`}>
      <p className="text-xs font-medium opacity-80">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}

export function ReservationsReportPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['reports', 'reservations'],
    queryFn: () => reportsApi.getReservations(),
  });

  if (isLoading) return <ReportLoadingState />;
  if (isError || !data) {
    return <ReportErrorState message="بارگذاری گزارش رزروها با خطا مواجه شد." />;
  }

  const { summary, scope, capacity, statusBreakdown, highlights } = data;
  const topBusyDays = [...data.busyDays]
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  const statusSegments = statusBreakdown
    .filter((item) => item.count > 0)
    .map((item) => ({
      label: item.label,
      value: item.count,
      color: STATUS_COLORS[item.label] ?? '#94a3b8',
    }));

  const genderSegments = data.genderBreakdown.map((item) => ({
    label: item.label,
    value: item.count,
    color: item.label === 'آقایان' ? GUEST_COLORS.male : GUEST_COLORS.female,
  }));

  const todayGenderSegments = data.todayGenderBreakdown.map((item) => ({
    label: item.label,
    value: item.count,
    color: item.label === 'آقایان' ? GUEST_COLORS.male : GUEST_COLORS.female,
  }));

  return (
    <div className="mx-auto max-w-7xl">
      <ReportPageHeader
        title={scope === 'mine' ? 'گزارش رزروهای من' : 'گزارش رزرواسیون'}
        subtitle="آمار کلی، وضعیت رزروها، ظرفیت و توزیع جنسیتی"
        scope={scope}
        icon={<NavIcon name="reservations" className="h-6 w-6 text-white" />}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <ReportStatCard
          label="کل رزروها"
          value={summary.total}
          tone="blue"
          icon={<NavIcon name="reservations" className="h-5 w-5" />}
        />
        <ReportStatCard
          label="تأیید شده"
          value={summary.confirmedCount + summary.completedCount}
          tone="teal"
          icon={<NavIcon name="check" className="h-5 w-5" />}
        />
        <ReportStatCard
          label="در انتظار تأیید"
          value={summary.pendingCount}
          tone="amber"
          subtitle={`${formatPersianNumber(summary.pendingActionCount)} نیاز به بررسی`}
        />
        <ReportStatCard
          label="رد شده"
          value={summary.rejectedCount}
          tone="rose"
        />
        <ReportStatCard
          label="لغو شده"
          value={summary.cancelledCount}
          tone="slate"
        />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ReportStatCard
          label="رزروهای امروز"
          value={summary.todayCount}
          tone="violet"
        />
        <ReportStatCard
          label="این هفته"
          value={summary.weekCount}
          tone="blue"
        />
        <ReportStatCard
          label="این ماه"
          value={summary.monthCount}
          tone="teal"
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <ReportChartCard
          title="گزارش وضعیت رزرو"
          subtitle="توزیع وضعیت‌های رزرو در سامانه"
          icon={<NavIcon name="reservations" className="h-5 w-5" />}
        >
          {statusSegments.length > 0 ? (
            <DonutChart
              segments={statusSegments}
              centerLabel="کل رزرو"
              centerValue={summary.total}
            />
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-400">
              هنوز رزروی ثبت نشده است
            </p>
          )}
        </ReportChartCard>

        <ReportChartCard
          title="گزارش ظرفیت"
          subtitle="وضعیت اشغال ظرفیت موکب‌ها (امروز)"
          icon={<NavIcon name="mawkibs" className="h-5 w-5" />}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ReportStatCard
              label="ظرفیت کل"
              value={capacity.totalCapacity}
              tone="blue"
            />
            <ReportStatCard
              label="اشغال شده"
              value={capacity.occupiedCapacity}
              tone="amber"
            />
            <ReportStatCard
              label="باقی‌مانده"
              value={capacity.remainingCapacity}
              tone="teal"
            />
            <div className="overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-600">درصد اشغال کل</p>
              <p className="mt-1 text-3xl font-extrabold text-violet-800">
                {formatPersianNumber(capacity.occupancyPercent)}٪
              </p>
            </div>
          </div>
        </ReportChartCard>
      </div>

      <ReportChartCard
        title="گزارش موکب‌ها"
        subtitle="ظرفیت، تعداد رزرو و درصد اشغال هر موکب"
        icon={<NavIcon name="mawkibs" className="h-5 w-5" />}
        className="mb-6"
      >
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <HighlightPill
            label="بیشترین رزرو"
            value={highlights.mostReserved?.mawkibName ?? '—'}
            tone="teal"
          />
          <HighlightPill
            label="کمترین رزرو"
            value={highlights.leastReserved?.mawkibName ?? '—'}
            tone="blue"
          />
          <HighlightPill
            label="تکمیل ظرفیت"
            value={`${formatPersianNumber(highlights.fullCapacityMawkibs.length)} موکب`}
            tone="amber"
          />
          <HighlightPill
            label="بدون رزرو"
            value={`${formatPersianNumber(highlights.noReservationMawkibs.length)} موکب`}
            tone="rose"
          />
        </div>

        {data.mawkibRows.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold">موکب</th>
                  <th className="px-4 py-3 text-center font-semibold">ظرفیت</th>
                  <th className="px-4 py-3 text-center font-semibold">رزرو</th>
                  <th className="px-4 py-3 text-center font-semibold">تأیید</th>
                  <th className="px-4 py-3 text-center font-semibold">درصد اشغال</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.mawkibRows.map((row) => (
                  <tr key={row.mawkibId} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {row.mawkibName}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {formatPersianNumber(row.capacity)}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {formatPersianNumber(row.reservationCount)}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {formatPersianNumber(row.confirmedCount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex min-w-[3.5rem] justify-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          row.occupancyPercent >= 100
                            ? 'bg-rose-100 text-rose-700'
                            : row.occupancyPercent >= 80
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-teal-100 text-teal-700'
                        }`}
                      >
                        {formatPersianNumber(row.occupancyPercent)}٪
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-400">
            موکب تأییدشده‌ای برای نمایش وجود ندارد
          </p>
        )}
      </ReportChartCard>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <ReportChartCard
          title="گزارش روزهای شلوغ"
          subtitle="تعداد مهمان رزروشده در ۱۴ روز آینده"
          icon={<NavIcon name="todayReserve" className="h-5 w-5" />}
        >
          <VerticalBarChart
            items={data.busyDays}
            emptyMessage="رزرو فعالی برای روزهای آینده ثبت نشده است"
          />
          {topBusyDays.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="mb-2 text-xs font-semibold text-slate-500">
                شلوغ‌ترین روزها
              </p>
              <HorizontalBarChart items={topBusyDays} />
            </div>
          )}
        </ReportChartCard>

        <ReportChartCard
          title="روند ثبت رزرو"
          subtitle="تعداد رزروهای ثبت‌شده در ۶ ماه اخیر"
          icon={<NavIcon name="reports" className="h-5 w-5" />}
        >
          <VerticalBarChart
            items={data.monthlyReservations}
            emptyMessage="داده‌ای برای نمایش وجود ندارد"
          />
        </ReportChartCard>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <ReportChartCard
          title="رزرو بر اساس جنسیت"
          subtitle="مجموع مهمانان در رزروهای فعال"
          icon={<NavIcon name="pilgrims" className="h-5 w-5" />}
        >
          {genderSegments.some((s) => s.value > 0) ? (
            <DonutChart
              segments={genderSegments}
              centerLabel="کل مهمان"
              centerValue={summary.totalMaleGuests + summary.totalFemaleGuests}
            />
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-400">
              داده‌ای برای نمایش وجود ندارد
            </p>
          )}
        </ReportChartCard>

        <ReportChartCard
          title="مهمانان امروز بر اساس جنسیت"
          subtitle="اشغال واقعی ظرفیت در تاریخ امروز"
          icon={<NavIcon name="reserve" className="h-5 w-5" />}
        >
          {todayGenderSegments.some((s) => s.value > 0) ? (
            <DonutChart
              segments={todayGenderSegments}
              centerLabel="امروز"
              centerValue={summary.todayMaleGuests + summary.todayFemaleGuests}
            />
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-400">
              امروز مهمان رزروشده‌ای ثبت نشده است
            </p>
          )}
        </ReportChartCard>
      </div>

      {summary.averageStayDays > 0 && (
        <div className="mb-6">
          <ReportStatCard
            label="میانگین مدت اقامت"
            value={summary.averageStayDays}
            tone="violet"
            subtitle="روز — بر اساس رزروهای تأییدشده و تکمیل‌شده"
          />
        </div>
      )}
    </div>
  );
}
