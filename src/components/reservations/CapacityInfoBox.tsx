import type { MawkibCapacitySnapshot } from '../../lib/capacity';
import { formatCapacityLine } from '../../lib/capacity';

interface CapacityInfoBoxProps {
  snapshot?: MawkibCapacitySnapshot;
  loading?: boolean;
  missingDates?: boolean;
}

export function CapacityInfoBox({ snapshot, loading, missingDates }: CapacityInfoBoxProps) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 space-y-1">
      {snapshot && (
        <>
          <p>
            ظرفیت کل:{' '}
            <span className="font-semibold text-slate-800">
              {formatCapacityLine(snapshot, 'total')}
            </span>
          </p>
          <p>
            کمترین ظرفیت باقی‌مانده در بازه:{' '}
            {!missingDates ? (
              loading ? (
                'در حال محاسبه...'
              ) : (
                <span className="font-semibold text-emerald-700">
                  {formatCapacityLine(snapshot, 'available')}
                </span>
              )
            ) : (
              'بازه تاریخ را انتخاب کنید'
            )}
          </p>
        </>
      )}
    </div>
  );
}
