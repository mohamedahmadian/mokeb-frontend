import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { dashboardApi, type CapacityStats } from '../lib/dashboard';

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
      <div className={`mb-2 h-1 w-10 rounded sm:mb-3 sm:w-12 ${color}`} />
      <p className="text-2xl font-bold text-slate-800 sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-slate-500 sm:text-sm">{label}</p>
    </div>
  );
}

function CapacityCards({ stats }: { stats: CapacityStats }) {
  const cards = [
    { label: 'تعداد موکب', value: stats.totalMawkibs, color: 'bg-blue-500' },
    {
      label: 'ظرفیت کل آقایان',
      value: stats.totalMaleCapacity,
      color: 'bg-slate-500',
    },
    {
      label: 'ظرفیت کل خانم‌ها',
      value: stats.totalFemaleCapacity,
      color: 'bg-slate-400',
    },
    {
      label: 'ظرفیت خالی آقایان',
      value: stats.emptyMaleCapacity,
      color: 'bg-[#4a6fa5]',
    },
    {
      label: 'ظرفیت خالی خانم‌ها',
      value: stats.emptyFemaleCapacity,
      color: 'bg-teal-500',
    },
    {
      label: 'ظرفیت پر شده',
      value: stats.filledCapacity,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      {cards.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('Admin') ?? false;
  const isMawkibOwner =
    (user?.roles.includes('MawkibOwner') ?? false) && !isAdmin;
  const isPilgrim =
    (user?.roles.includes('Pilgrim') ?? false) && !isAdmin && !isMawkibOwner;

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
  });

  if (isLoading) return <p className="text-slate-500">در حال بارگذاری...</p>;

  const adminStats = isAdmin
    ? [
        { label: 'تعداد زائرین', value: stats?.totalPilgrims ?? 0, color: 'bg-violet-500' },
        { label: 'موکب‌داران', value: stats?.totalMawkibOwners ?? 0, color: 'bg-orange-500' },
        { label: 'رزروهای در انتظار', value: stats?.pendingReservations ?? 0, color: 'bg-amber-500' },
      ]
    : [];

  const pilgrimReservationCards = stats?.pilgrimStats
    ? [
        { label: 'کل رزروها', value: stats.pilgrimStats.totalReservations, color: 'bg-slate-500' },
        {
          label: 'در انتظار تایید',
          value: stats.pilgrimStats.pendingReservations,
          color: 'bg-amber-500',
        },
        {
          label: 'تایید شده',
          value: stats.pilgrimStats.confirmedReservations,
          color: 'bg-[#4a6fa5]',
        },
      ]
    : [];

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-slate-800 sm:mb-6 sm:text-2xl">داشبورد</h1>
      {isPilgrim && (
        <p className="mb-4 text-sm text-slate-500">خوش آمدید، {user?.fullName}</p>
      )}

      {isMawkibOwner && stats?.myMawkibsStats && (
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 text-base font-semibold text-slate-700 sm:mb-4 sm:text-lg">
            موکب‌های من
          </h2>
          <CapacityCards stats={stats.myMawkibsStats} />
        </section>
      )}

      {(isAdmin || isPilgrim) && stats?.capacityStats && (
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 text-base font-semibold text-slate-700 sm:mb-4 sm:text-lg">
            رزرواسیون
          </h2>
          <CapacityCards stats={stats.capacityStats} />
        </section>
      )}

      {isPilgrim && pilgrimReservationCards.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 text-base font-semibold text-slate-700 sm:mb-4 sm:text-lg">
            رزروهای من
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {pilgrimReservationCards.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </section>
      )}

      {isAdmin && adminStats.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-slate-700 sm:mb-4 sm:text-lg">
            آمار کلی
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {adminStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
