import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
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

const GENDER_COLORS = {
  male: '#4a6fa5',
  female: '#db2777',
  unknown: '#94a3b8',
};

function RegistrationCounter({
  label,
  value,
  hint,
  tone,
  icon,
}: {
  label: string;
  value: number;
  hint: string;
  tone: 'teal' | 'blue' | 'violet';
  icon: ReactNode;
}) {
  const styles = {
    teal: {
      card: 'from-teal-50 via-white to-emerald-50/80 border-teal-100',
      icon: 'bg-teal-100 text-teal-700',
      value: 'text-teal-800',
      hint: 'text-teal-600/80',
    },
    blue: {
      card: 'from-[#eef3fa] via-white to-sky-50/80 border-[#c5d4e8]/70',
      icon: 'bg-[#4a6fa5]/10 text-[#4a6fa5]',
      value: 'text-[#3d5d8a]',
      hint: 'text-[#4a6fa5]/80',
    },
    violet: {
      card: 'from-violet-50 via-white to-fuchsia-50/60 border-violet-100',
      icon: 'bg-violet-100 text-violet-700',
      value: 'text-violet-800',
      hint: 'text-violet-600/80',
    },
  }[tone];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition hover:shadow-md ${styles.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-600">{label}</p>
          <p className={`mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl ${styles.value}`}>
            {formatPersianNumber(value)}
          </p>
          <p className={`mt-2 text-xs font-medium ${styles.hint}`}>{hint}</p>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export function PilgrimsReportPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['reports', 'pilgrims'],
    queryFn: () => reportsApi.getPilgrims(),
  });

  if (isLoading) return <ReportLoadingState />;
  if (isError || !data) {
    return <ReportErrorState message="بارگذاری گزارش زائرین با خطا مواجه شد." />;
  }

  const { summary, scope } = data;
  const profileCompletePct =
    summary.total > 0
      ? Math.round((summary.withNationalIdCount / summary.total) * 100)
      : 0;

  const genderSegments = [
    { label: 'آقایان', value: summary.maleCount, color: GENDER_COLORS.male },
    { label: 'بانوان', value: summary.femaleCount, color: GENDER_COLORS.female },
    {
      label: 'بدون جنسیت',
      value: summary.unknownGenderCount,
      color: GENDER_COLORS.unknown,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <ReportPageHeader
        title={scope === 'mine' ? 'گزارش زائرین موکب‌های من' : 'گزارش زائرین'}
        subtitle="آمار جمعیتی، ثبت‌نام‌های اخیر و توزیع جغرافیایی"
        scope={scope}
        icon={<NavIcon name="pilgrims" className="h-6 w-6 text-white" />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportStatCard
          label="کل زائرین"
          value={summary.total}
          tone="blue"
          icon={<NavIcon name="pilgrims" className="h-5 w-5" />}
        />
        <ReportStatCard
          label="زائرین فعال"
          value={summary.activeCount}
          tone="teal"
          subtitle={`${formatPersianNumber(summary.inactiveCount)} غیرفعال`}
          icon={<NavIcon name="check" className="h-5 w-5" />}
        />
        <ReportStatCard
          label="بانوان"
          value={summary.femaleCount}
          tone="rose"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14v7m-3-4h6M12 7a3 3 0 110-6 3 3 0 010 6z" />
            </svg>
          }
        />
        <ReportStatCard
          label="آقایان"
          value={summary.maleCount}
          tone="violet"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 3h5v5M4 20l8.5-8.5M15 9l6-6" />
            </svg>
          }
        />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <RegistrationCounter
          label="ثبت‌نام امروز"
          value={summary.todayRegistrationCount}
          hint="زائرین ثبت‌شده در روز جاری"
          tone="teal"
          icon={<NavIcon name="todayReserve" className="h-6 w-6" />}
        />
        <RegistrationCounter
          label="ثبت‌نام هفته جاری"
          value={summary.weekRegistrationCount}
          hint="۷ روز اخیر شامل امروز"
          tone="blue"
          icon={<NavIcon name="reservations" className="h-6 w-6" />}
        />
        <RegistrationCounter
          label="ثبت‌نام ماه جاری"
          value={summary.monthRegistrationCount}
          hint="از ابتدای ماه تا امروز"
          tone="violet"
          icon={<NavIcon name="register" className="h-6 w-6" />}
        />
      </div>

      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <ReportChartCard
          title="توزیع جنسیت"
          subtitle="نسبت آقایان، بانوان و بدون جنسیت"
          icon={<NavIcon name="reports" className="h-5 w-5" />}
        >
          <DonutChart segments={genderSegments} centerLabel="کل زائرین" />
        </ReportChartCard>

        <ReportChartCard
          title="تکمیل پروفایل"
          subtitle={`${formatPersianNumber(profileCompletePct)}٪ دارای کد ملی`}
          icon={<NavIcon name="profile" className="h-5 w-5" />}
        >
          <HorizontalBarChart
            items={data.profileCompletion}
            usePalette={false}
            barColor="#7c3aed"
          />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {data.profileCompletion.map((item) => {
              const pct =
                summary.total > 0
                  ? Math.round((item.count / summary.total) * 100)
                  : 0;
              return (
                <div
                  key={item.label}
                  className="rounded-xl border border-violet-100 bg-violet-50/60 px-2 py-3 text-center"
                >
                  <p className="text-lg font-bold text-violet-800">
                    {formatPersianNumber(pct)}٪
                  </p>
                  <p className="mt-0.5 text-[10px] leading-tight text-violet-600 sm:text-xs">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </ReportChartCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ReportChartCard
          title="۱۰ استان برتر"
          subtitle="بر اساس تعداد زائر"
          icon={<NavIcon name="map" className="h-5 w-5" />}
        >
          <HorizontalBarChart items={data.byProvince} />
        </ReportChartCard>

        <ReportChartCard
          title="۱۰ شهر برتر"
          subtitle="بر اساس تعداد زائر"
          icon={<NavIcon name="map" className="h-5 w-5" />}
        >
          <HorizontalBarChart items={data.byCity} barColor="#14b8a6" />
        </ReportChartCard>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ReportChartCard
          title="ثبت‌نام ماهانه"
          subtitle="۶ ماه اخیر"
          icon={<NavIcon name="reservations" className="h-5 w-5" />}
        >
          <VerticalBarChart items={data.monthlyRegistrations} />
        </ReportChartCard>

        <ReportChartCard
          title="ثبت‌نام هفتگی"
          subtitle="۷ روز اخیر"
          icon={<NavIcon name="todayReserve" className="h-5 w-5" />}
        >
          <VerticalBarChart items={data.weeklyRegistrations} />
        </ReportChartCard>
      </div>
    </div>
  );
}
