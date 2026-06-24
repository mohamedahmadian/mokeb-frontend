import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserFormModal } from '../components/users/UserFormModal';
import { UserSocialProfileSection } from '../components/users/UserSocialProfileSection';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS, getApiErrorMessage } from '../lib/constants';
import { btnPrimary } from '../lib/styles';
import { usersApi, type UpdateUserPayload } from '../lib/users';

export function ProfilePage() {
  const { user, updateStoredUser } = useAuth();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: usersApi.getMe,
    enabled: !!user?.id,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      updateStoredUser({ fullName: data.fullName });
      setFeedback({ type: 'success', text: 'پروفایل با موفقیت به‌روزرسانی شد' });
    },
  });

  if (isLoading || !profile) {
    return <p className="text-slate-500">در حال بارگذاری...</p>;
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <PageHeader
        title="پروفایل من"
        action={
          <button onClick={() => setFormOpen(true)} className={`${btnPrimary} w-full sm:w-auto`}>
            ویرایش پروفایل
          </button>
        }
      />

      {feedback && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-[#f0f4fa] text-[#3d5d8a]'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {feedback.text}
          <button onClick={() => setFeedback(null)} className="mr-3 text-xs underline">
            بستن
          </button>
        </div>
      )}

      <div className="space-y-4 rounded-xl bg-white p-4 shadow-sm sm:p-6">
        <div className="border-b border-slate-100 pb-3">
          <p className="text-sm text-slate-500">نقش</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {profile.roles.map((r) => (
              <span
                key={r.role.name}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
              >
                {ROLE_LABELS[r.role.name] ?? r.role.name}
              </span>
            ))}
          </div>
        </div>
        <div className="border-b border-slate-100 pb-3">
          <p className="text-sm text-slate-500">نام</p>
          <p className="font-medium text-slate-800">{profile.fullName}</p>
        </div>
        <div className="border-b border-slate-100 pb-3">
          <p className="text-sm text-slate-500">موبایل</p>
          <p className="font-mono text-slate-800">{profile.mobileNumber}</p>
        </div>
        <div className="border-b border-slate-100 pb-3">
          <p className="text-sm text-slate-500">استان</p>
          <p className="text-slate-800">{profile.province ?? '—'}</p>
        </div>
        <div className="border-b border-slate-100 pb-3">
          <p className="text-sm text-slate-500">شهر</p>
          <p className="text-slate-800">{profile.city ?? '—'}</p>
        </div>
        {profile.description && (
          <div className="border-b border-slate-100 pb-3">
            <p className="text-sm text-slate-500">توضیحات</p>
            <p className="text-slate-800">{profile.description}</p>
          </div>
        )}
        <UserSocialProfileSection user={profile} />
      </div>

      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={async (payload) => {
          try {
            await updateMutation.mutateAsync({
              id: profile.id,
              payload: payload as UpdateUserPayload,
            });
          } catch (error) {
            throw new Error(getApiErrorMessage(error, 'خطا در ذخیره پروفایل'));
          }
        }}
        user={profile}
        hideRoles
        title="ویرایش پروفایل"
      />
    </div>
  );
}
