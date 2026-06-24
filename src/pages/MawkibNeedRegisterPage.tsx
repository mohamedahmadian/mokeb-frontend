import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../components/ui/PageHeader';
import { HonoraryVolunteerForm } from '../components/honorary-volunteers/HonoraryVolunteerForm';
import { honoraryVolunteersApi } from '../lib/honorary-volunteers';
import { mawkibsApi } from '../lib/mawkibs';
import { getApiErrorMessage } from '../lib/constants';
import { btnSecondary } from '../lib/styles';
import { useAuth } from '../contexts/AuthContext';

export function MawkibNeedRegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: myMawkibs = [], isLoading } = useQuery({
    queryKey: ['mawkibs-my-need'],
    queryFn: () => mawkibsApi.getMyList(),
  });

  const nameParts = user?.fullName.trim().split(/\s+/) ?? ['', ''];
  const defaultMawkibId = myMawkibs.length === 1 ? myMawkibs[0].id : null;

  const initialValues = useMemo(
    () => ({
      firstName: nameParts[0] ?? '',
      lastName: nameParts.slice(1).join(' ') || nameParts[0],
      mobileNumber: user?.mobileNumber ?? '',
      mawkibId: defaultMawkibId,
    }),
    [nameParts, user?.mobileNumber, defaultMawkibId],
  );

  if (isLoading) {
    return <p className="text-slate-500">در حال بارگذاری...</p>;
  }

  if (myMawkibs.length === 0) {
    return (
      <div>
        <PageHeader title="درخواست خادم" />
        <div className="rounded-xl bg-white p-8 text-center text-slate-500 shadow-sm">
          <p className="font-medium text-slate-700">موکبی برای ثبت نیاز یافت نشد</p>
          <p className="mt-2 text-sm">
            ابتدا باید موکب شما در سامانه ثبت و تایید شده باشد.
          </p>
          <button
            type="button"
            onClick={() => navigate('/honorary-volunteers')}
            className={`${btnSecondary} mt-6`}
          >
            بازگشت به لیست درخواست‌ها
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="درخواست خادم"
        subtitle="درخواست نیروی خادم برای موکب خود را ثبت کنید تا در لیست نیازمندی‌های عمومی نمایش داده شود"
      />

      <HonoraryVolunteerForm
        embedded
        showPassword={false}
        title=""
        subtitle=""
        submitLabel="ثبت درخواست خادم"
        cancelTo="/honorary-volunteers"
        showMawkibSelect
        mawkibOptions={myMawkibs.map((m) => ({ id: m.id, name: m.name }))}
        initialValues={initialValues}
        onSubmit={async (values) => {
          if (!values.mawkibId) {
            throw new Error('انتخاب موکب الزامی است');
          }

          try {
            const result = await honoraryVolunteersApi.createOwnerNeed({
              firstName: values.firstName,
              lastName: values.lastName,
              mobileNumber: values.mobileNumber,
              province: values.province || undefined,
              city: values.city || undefined,
              mawkibId: values.mawkibId,
              description: values.description || undefined,
              serviceTypes: values.serviceTypes,
              serviceDescription: values.serviceDescription || undefined,
              availabilityStartDate: values.availabilityStartDate,
              availabilityEndDate: values.availabilityEndDate,
              availabilityDescription: values.availabilityDescription || undefined,
            });

            await queryClient.invalidateQueries({ queryKey: ['honorary-volunteer-needs'] });
            await queryClient.invalidateQueries({ queryKey: ['honorary-volunteer-applications'] });

            navigate(
              `/honorary-volunteers?created=${encodeURIComponent(result.trackingCode)}`,
            );
          } catch (err) {
            throw new Error(getApiErrorMessage(err, 'خطا در ثبت درخواست خادم'));
          }
        }}
      />

      <button
        type="button"
        className={`${btnSecondary} mt-4`}
        onClick={() => navigate('/honorary-volunteers')}
      >
        بازگشت به لیست درخواست‌ها
      </button>
    </div>
  );
}
