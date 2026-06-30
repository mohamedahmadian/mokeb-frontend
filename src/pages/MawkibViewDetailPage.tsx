import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MawkibPublicDetail } from '../components/mawkibs/MawkibPublicDetail';
import { MawkibCardPrintButton } from '../components/mawkibs/MawkibCardPrintButton';
import { MawkibRulesPrintButton } from '../components/mawkibs/MawkibRulesPrintButton';
import { PageHeader } from '../components/ui/PageHeader';
import { mawkibToCardData } from '../lib/mawkib-card';
import { mawkibToRulesPrintData } from '../lib/mawkib-rules-print';
import { btnSecondary } from '../lib/styles';
import { mawkibsApi } from '../lib/mawkibs';

export function MawkibViewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const mawkibId = Number(id);

  const { data: mawkib, isLoading, isError } = useQuery({
    queryKey: ['mawkib-public-view', mawkibId],
    queryFn: () => mawkibsApi.getPublicOne(mawkibId),
    enabled: mawkibId > 0,
  });

  return (
    <div>
      <PageHeader
        title="جزئیات موکب"
        subtitle="نمایش اطلاعات موکب (فقط خواندنی)"
      />

      {isLoading && (
        <p className="text-slate-500">در حال بارگذاری...</p>
      )}

      {isError && !isLoading && (
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
          <p className="text-red-600">موکب یافت نشد.</p>
          <Link to="/mawkibs/map" className={btnSecondary}>
            بازگشت به نقشه
          </Link>
        </div>
      )}

      {mawkib && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-end gap-2">
            <MawkibCardPrintButton data={mawkibToCardData(mawkib)} />
            <MawkibRulesPrintButton data={mawkibToRulesPrintData(mawkib)} />
            <Link to={`/mawkibs/${mawkib.id}/rules`} className={btnSecondary}>
              صفحه قوانین
            </Link>
          </div>
          <MawkibPublicDetail mawkib={mawkib} />
          <Link to="/mawkibs/map" className={`${btnSecondary} w-full sm:w-auto`}>
            بازگشت به جستجوی موکب ( نقشه )
          </Link>
        </div>
      )}
    </div>
  );
}
