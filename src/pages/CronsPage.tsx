import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NavIcon } from '../components/ui/NavIcons';
import { cronsApi } from '../lib/crons';
import { btnPrimary } from '../lib/styles';
import { toast, toastApiError } from '../lib/toast';
import { formatDateTimeFa } from '../lib/format-time';

export function CronsPage() {
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['crons'],
    queryFn: cronsApi.listJobs,
  });

  const runMutation = useMutation({
    mutationFn: cronsApi.runJob,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['crons'] });
      toast.success(
        `«${result.jobName}» اجرا شد — ${result.updatedCount.toLocaleString('fa-IR')} رکورد به‌روزرسانی شد`,
      );
    },
    onError: (err) => toastApiError(err, 'خطا در اجرای وظیفه'),
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          وظایف زمان‌بندی
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          مدیریت و اجرای دستی وظایف پس‌زمینه سامانه (فقط مدیر سیستم).
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">در حال بارگذاری...</p>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-slate-500">وظیفه‌ای تعریف نشده است.</p>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => {
            const isRunning =
              runMutation.isPending && runMutation.variables === job.id;

            return (
              <li
                key={job.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
                        <NavIcon name="settings" className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <h2 className="text-base font-semibold text-slate-900">
                        {job.name}
                      </h2>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {job.description}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      زمان‌بندی: {job.schedule}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => runMutation.mutate(job.id)}
                    disabled={runMutation.isPending}
                    className={`${btnPrimary} inline-flex shrink-0 items-center justify-center gap-2 !min-h-10 px-4 py-2.5 text-sm disabled:opacity-50`}
                  >
                    <NavIcon name="check" className="h-4 w-4" strokeWidth={1.75} />
                    {isRunning ? 'در حال اجرا...' : 'اجرای دستی'}
                  </button>
                </div>

                {runMutation.isSuccess &&
                  runMutation.variables === job.id &&
                  runMutation.data && (
                    <p className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-800">
                      آخرین اجرا:{' '}
                      {formatDateTimeFa(runMutation.data.ranAt)} —{' '}
                      {runMutation.data.updatedCount.toLocaleString('fa-IR')} رکورد
                    </p>
                  )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-xs leading-relaxed text-amber-900">
        وظایف زمان‌بندی‌شده به‌صورت خودکار در ساعات تعیین‌شده اجرا می‌شوند.
        دکمه «اجرای دستی» برای تست یا اجرای فوری همان منطق است.
      </div>
    </div>
  );
}
