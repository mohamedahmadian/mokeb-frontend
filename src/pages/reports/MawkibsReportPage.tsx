import { useQuery } from "@tanstack/react-query";
import { NavIcon } from "../../components/ui/NavIcons";
import { DonutChart } from "../../components/reports/DonutChart";
import { HorizontalBarChart } from "../../components/reports/HorizontalBarChart";
import {
  ReportChartCard,
  ReportStatCard,
} from "../../components/reports/ReportStatCard";
import {
  ReportErrorState,
  ReportLoadingState,
  ReportPageHeader,
} from "../../components/reports/ReportPageHeader";
import { reportsApi } from "../../lib/reports";
import { formatPersianNumber } from "../../lib/capacity";
import { formatPersianDate } from "../../components/ui/PersianDateInput";

const GUEST_COLORS = {
  male: "#4a6fa5",
  female: "#db2777",
};

function capacityDonutSegments(
  maleCount: number,
  femaleCount: number,
  maleCapacity: number,
  femaleCapacity: number,
) {
  return [
    {
      label: "آقایان",
      value: maleCount,
      color: GUEST_COLORS.male,
      capacity: maleCapacity,
    },
    {
      label: "بانوان",
      value: femaleCount,
      color: GUEST_COLORS.female,
      capacity: femaleCapacity,
    },
  ];
}

function formatOccupiedOfCapacity(occupied: number, capacity: number): string {
  return `${formatPersianNumber(occupied)} از ${formatPersianNumber(capacity)}`;
}

function CurrentCapacityDonut({
  maleCount,
  femaleCount,
  maleCapacity,
  femaleCapacity,
  centerLabel = "رزرو",
}: {
  maleCount: number;
  femaleCount: number;
  maleCapacity: number;
  femaleCapacity: number;
  centerLabel?: string;
}) {
  const totalOccupied = maleCount + femaleCount;
  const totalCapacity = maleCapacity + femaleCapacity;

  if (totalCapacity === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-400">
        ظرفیتی برای این موکب تعریف نشده است
      </p>
    );
  }

  if (totalOccupied === 0) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="w-full rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-400">
          ظرفیتی برای امروز اشغال نشده است
        </p>
        <div className="grid w-full grid-cols-2 gap-2 text-center text-xs text-slate-500">
          <span>
            ظرفیت آقا: {formatPersianNumber(maleCapacity)}
          </span>
          <span>
            ظرفیت خانم: {formatPersianNumber(femaleCapacity)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <DonutChart
      segments={capacityDonutSegments(
        maleCount,
        femaleCount,
        maleCapacity,
        femaleCapacity,
      )}
      centerLabel={centerLabel}
      centerValue={totalOccupied}
      legendPlacement="below"
      size={190}
    />
  );
}

export function MawkibsReportPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["reports", "mawkibs"],
    queryFn: () => reportsApi.getMawkibs(),
  });

  if (isLoading) return <ReportLoadingState />;
  if (isError || !data) {
    return (
      <ReportErrorState message="بارگذاری گزارش موکب‌ها با خطا مواجه شد." />
    );
  }

  const { summary, scope, todayDate, todayGuestByMawkib } = data;
  const totalCapacity = summary.totalMaleCapacity + summary.totalFemaleCapacity;
  const onlinePct =
    summary.total > 0
      ? Math.round(
          (summary.onlineReservationEnabledCount / summary.total) * 100,
        )
      : 0;
  const todayLabel = formatPersianDate(todayDate);
  const aggregateTitle =
    scope === "mine" ? "کل موکب‌های من" : "کل موکب‌های سامانه";
  const capacitySubtitle = (
    occupied: number,
    maleCapacity: number,
    femaleCapacity: number,
  ) => {
    const totalCapacity = maleCapacity + femaleCapacity;
    return `${formatOccupiedOfCapacity(occupied, totalCapacity)} رزرو — ${todayLabel}`;
  };

  const presenceSubtitle = (
    presentTotal: number,
    maleCapacity: number,
    femaleCapacity: number,
  ) => {
    const totalCapacity = maleCapacity + femaleCapacity;
    return `${formatOccupiedOfCapacity(presentTotal, totalCapacity)} حاضر — ${todayLabel}`;
  };

  return (
    <div className="mx-auto max-w-7xl">
      <ReportPageHeader
        title={scope === "mine" ? "گزارش موکب‌های من" : "گزارش موکب‌ها"}
        subtitle="ظرفیت، حضور، آمار و توزیع جغرافیایی"
        scope={scope}
        icon={<NavIcon name="mawkibs" className="h-6 w-6 text-white" />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportStatCard
          label="کل موکب‌ها"
          value={summary.total}
          tone="slate"
          icon={<NavIcon name="mawkibs" className="h-5 w-5" />}
        />
        <ReportStatCard
          label="حاضر در موکب"
          value={summary.presentTotalGuests}
          tone="teal"
          subtitle={`${formatPersianNumber(summary.presentMaleGuests)} آقا / ${formatPersianNumber(summary.presentFemaleGuests)} خانم`}
          icon={<NavIcon name="pilgrims" className="h-5 w-5" />}
        />
        <ReportStatCard
          label="رزرو امروز"
          value={summary.todayTotalGuests}
          tone="amber"
          subtitle={`${formatPersianNumber(summary.todayMaleGuests)} آقا / ${formatPersianNumber(summary.todayFemaleGuests)} خانم`}
          icon={<NavIcon name="reservations" className="h-5 w-5" />}
        />
        <ReportStatCard
          label="ظرفیت کل"
          value={totalCapacity}
          tone="violet"
          subtitle={`${formatPersianNumber(summary.totalMaleCapacity)} آقا / ${formatPersianNumber(summary.totalFemaleCapacity)} خانم`}
        />
        <ReportStatCard
          label="رزرو آنلاین"
          value={summary.onlineReservationEnabledCount}
          tone="blue"
          subtitle={`${formatPersianNumber(onlinePct)}٪ از موکب‌ها`}
          icon={<NavIcon name="reserve" className="h-5 w-5" />}
        />
      </div>

      <div>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              ظرفیت و حضور موکب
            </h2>
            <p className="text-sm text-slate-500">
              رزرو امروز ({todayLabel}) و حاضرین فعلی نسبت به ظرفیت
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
              حاضر:{" "}
              {formatOccupiedOfCapacity(
                summary.presentTotalGuests,
                totalCapacity,
              )}
            </span>
            <span className="rounded-full bg-[#e8eef6] px-3 py-1 font-medium text-[#4a6fa5]">
              رزرو آقا:{" "}
              {formatOccupiedOfCapacity(
                summary.todayMaleGuests,
                summary.totalMaleCapacity,
              )}
            </span>
            <span className="rounded-full bg-pink-50 px-3 py-1 font-medium text-pink-700">
              رزرو خانم:{" "}
              {formatOccupiedOfCapacity(
                summary.todayFemaleGuests,
                summary.totalFemaleCapacity,
              )}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              رزرو کل:{" "}
              {formatOccupiedOfCapacity(
                summary.todayTotalGuests,
                totalCapacity,
              )}
            </span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ReportChartCard
            title={aggregateTitle}
            subtitle={capacitySubtitle(
              summary.todayTotalGuests,
              summary.totalMaleCapacity,
              summary.totalFemaleCapacity,
            )}
            icon={<NavIcon name="reservations" className="h-5 w-5" />}
          >
            <CurrentCapacityDonut
              maleCount={summary.todayMaleGuests}
              femaleCount={summary.todayFemaleGuests}
              maleCapacity={summary.totalMaleCapacity}
              femaleCapacity={summary.totalFemaleCapacity}
            />
          </ReportChartCard>

          <ReportChartCard
            title={`حاضرین — ${aggregateTitle}`}
            subtitle={presenceSubtitle(
              summary.presentTotalGuests,
              summary.totalMaleCapacity,
              summary.totalFemaleCapacity,
            )}
            icon={<NavIcon name="pilgrims" className="h-5 w-5" />}
          >
            <CurrentCapacityDonut
              maleCount={summary.presentMaleGuests}
              femaleCount={summary.presentFemaleGuests}
              maleCapacity={summary.totalMaleCapacity}
              femaleCapacity={summary.totalFemaleCapacity}
              centerLabel="حاضر"
            />
          </ReportChartCard>

          {todayGuestByMawkib.map((mawkib) => (
            <ReportChartCard
              key={mawkib.mawkibId}
              title={mawkib.mawkibName}
              subtitle={`${presenceSubtitle(mawkib.presentTotalGuests, mawkib.maleCapacity, mawkib.femaleCapacity)} · ${capacitySubtitle(mawkib.totalGuests, mawkib.maleCapacity, mawkib.femaleCapacity)}`}
              icon={<NavIcon name="mawkibs" className="h-5 w-5" />}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-center text-xs font-semibold text-emerald-700">
                    حاضر در موکب
                  </p>
                  <CurrentCapacityDonut
                    maleCount={mawkib.presentMaleGuests}
                    femaleCount={mawkib.presentFemaleGuests}
                    maleCapacity={mawkib.maleCapacity}
                    femaleCapacity={mawkib.femaleCapacity}
                    centerLabel="حاضر"
                  />
                </div>
                <div>
                  <p className="mb-2 text-center text-xs font-semibold text-[#4a6fa5]">
                    رزرو امروز
                  </p>
                  <CurrentCapacityDonut
                    maleCount={mawkib.maleGuests}
                    femaleCount={mawkib.femaleGuests}
                    maleCapacity={mawkib.maleCapacity}
                    femaleCapacity={mawkib.femaleCapacity}
                  />
                </div>
              </div>
            </ReportChartCard>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ReportChartCard
          title="توزیع کشور"
          subtitle="ایران و عراق"
          icon={<NavIcon name="map" className="h-5 w-5" />}
        >
          <HorizontalBarChart items={data.byProvince} />
        </ReportChartCard>

        <ReportChartCard
          title="شهرهای زیارتی"
          subtitle="مشهد، قم، نجف و کربلا"
          icon={<NavIcon name="map" className="h-5 w-5" />}
        >
          <HorizontalBarChart items={data.byCity} barColor="#14b8a6" />
        </ReportChartCard>
      </div>
    </div>
  );
}
