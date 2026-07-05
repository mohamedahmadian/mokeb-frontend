import { useQuery } from '@tanstack/react-query';
import { NavIcon } from '../../components/ui/NavIcons';
import { DonutChart } from '../../components/reports/DonutChart';
import { HorizontalBarChart } from '../../components/reports/HorizontalBarChart';
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

export function MawkibOwnersReportPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['reports', 'mawkib-owners'],
    queryFn: () => reportsApi.getMawkibOwners(),
  });

  if (isLoading) return <ReportLoadingState />;
  if (isError || !data) {
    return (
      <ReportErrorState message="بارگذاری گزارش موکب‌داران با خطا مواجه شد." />
    );
  }

  const { summary } = data;
  const withMawkibPct =
    summary.total > 0
      ? Math.round((summary.withMawkibCount / summary.total) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-7xl">
      <ReportPageHeader
        title="گزارش موکب‌داران"
        subtitle="آمار جمعیتی و توزیع جغرافیایی موکب‌داران سامانه"
        icon={<NavIcon name="mawkibOwners" className="h-6 w-6 text-white" />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportStatCard
          label="کل موکب‌داران"
          value={summary.total}
          tone="blue"
          icon={<NavIcon name="mawkibOwners" className="h-5 w-5" />}
        />
        <ReportStatCard
          label="فعال"
          value={summary.activeCount}
          tone="teal"
          subtitle={`${formatPersianNumber(summary.inactiveCount)} غیرفعال`}
          icon={<NavIcon name="check" className="h-5 w-5" />}
        />
        <ReportStatCard
          label="دارای موکب"
          value={summary.withMawkibCount}
          tone="violet"
          subtitle={`${formatPersianNumber(withMawkibPct)}٪ از کل`}
          icon={<NavIcon name="mawkibs" className="h-5 w-5" />}
        />
        <ReportStatCard
          label="بدون جنسیت"
          value={summary.unknownGenderCount}
          tone="slate"
          subtitle={`${formatPersianNumber(summary.maleCount)} آقا / ${formatPersianNumber(summary.femaleCount)} خانم`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ReportChartCard
          title="توزیع جنسیت"
          subtitle="آقایان، بانوان و بدون جنسیت"
          icon={<NavIcon name="reports" className="h-5 w-5" />}
        >
          <DonutChart
            segments={[
              { label: 'آقایان', value: summary.maleCount, color: GENDER_COLORS.male },
              { label: 'بانوان', value: summary.femaleCount, color: GENDER_COLORS.female },
              {
                label: 'بدون جنسیت',
                value: summary.unknownGenderCount,
                color: GENDER_COLORS.unknown,
              },
            ]}
            centerLabel="کل"
          />
        </ReportChartCard>

        <ReportChartCard
          title="وضعیت حساب"
          subtitle="فعال و غیرفعال"
          icon={<NavIcon name="check" className="h-5 w-5" />}
        >
          <DonutChart
            segments={[
              { label: 'فعال', value: summary.activeCount, color: '#14b8a6' },
              { label: 'غیرفعال', value: summary.inactiveCount, color: '#f43f5e' },
            ]}
            centerLabel="کل"
          />
        </ReportChartCard>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ReportChartCard
          title="۱۰ استان برتر"
          subtitle="بر اساس تعداد موکب‌دار"
          icon={<NavIcon name="map" className="h-5 w-5" />}
        >
          <HorizontalBarChart items={data.byProvince} />
        </ReportChartCard>

        <ReportChartCard
          title="۱۰ شهر برتر"
          subtitle="بر اساس تعداد موکب‌دار"
          icon={<NavIcon name="map" className="h-5 w-5" />}
        >
          <HorizontalBarChart items={data.byCity} barColor="#7c3aed" />
        </ReportChartCard>
      </div>
    </div>
  );
}
