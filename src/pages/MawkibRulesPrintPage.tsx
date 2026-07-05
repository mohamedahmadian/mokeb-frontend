import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MawkibRulesPrintButton,
  MawkibRulesPrintContent,
  mawkibRulesSheetStyles,
} from '../components/mawkibs/MawkibRulesPrintButton';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { hasMawkibRulesForPrint, mawkibToRulesPrintData } from '../lib/mawkib-rules-print';
import { btnSecondary } from '../lib/styles';
import { mawkibsApi } from '../lib/mawkibs';

export function MawkibRulesPrintPage() {
  const { id } = useParams<{ id: string }>();
  const mawkibId = Number(id);
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('Admin') ?? false;
  const isMawkibOwner = user?.roles.includes('MawkibOwner') ?? false;
  const canUsePrivateMawkibApi = isAdmin || isMawkibOwner;

  const { data: mawkib, isLoading, isError } = useQuery({
    queryKey: ['mawkib-rules-print', mawkibId, canUsePrivateMawkibApi ? 'private' : 'public'],
    queryFn: () =>
      canUsePrivateMawkibApi
        ? mawkibsApi.getOne(mawkibId)
        : mawkibsApi.getPublicOne(mawkibId),
    enabled: mawkibId > 0,
  });

  const printData = mawkib ? mawkibToRulesPrintData(mawkib) : null;
  const canPrint = printData ? hasMawkibRulesForPrint(printData) : false;

  return (
    <div>
      <PageHeader
        title="قوانین موکب"
        subtitle={
          mawkib
            ? canUsePrivateMawkibApi
              ? `چاپ و نصب در ورودی — ${mawkib.name}`
              : mawkib.name
            : 'مشاهده قوانین موکب'
        }
      />

      {isLoading && <p className="text-slate-500">در حال بارگذاری...</p>}

      {isError && !isLoading && (
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
          <p className="text-red-600">موکب یافت نشد.</p>
          <Link to="/mawkibs" className={btnSecondary}>
            بازگشت به موکب‌ها
          </Link>
        </div>
      )}

      {printData && (
        <div className="space-y-5">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/mawkibs" className={`${btnSecondary} w-full sm:w-auto`}>
              بازگشت به موکب‌ها
            </Link>
            {canUsePrivateMawkibApi && (
              <MawkibRulesPrintButton
                data={printData}
                className={`${btnSecondary} w-full border-[#c5d4e8] bg-[#f0f4fa] text-[#4a6fa5] hover:bg-[#e8eef6] sm:w-auto`}
              />
            )}
          </div>

          {!canPrint ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-900">
              {canUsePrivateMawkibApi
                ? 'برای این موکب هنوز قوانینی ثبت نشده است. از بخش ویرایش موکب، قوانین را وارد کنید و سپس این صفحه را برای چاپ A4 استفاده کنید.'
                : 'برای این موکب هنوز قوانینی ثبت نشده است.'}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-100/80 p-4 shadow-inner sm:p-6">
              <style>{mawkibRulesSheetStyles()}</style>
              <div className="mx-auto w-fit">
                <MawkibRulesPrintContent data={printData} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
