import { useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserFormModal } from '../components/users/UserFormModal';
import { UserSocialProfileSection } from '../components/users/UserSocialProfileSection';
import { UserAvatar } from '../components/users/UserAvatar';
import { NavIcon } from '../components/ui/NavIcons';
import { IconPhone, IconUser } from '../components/reservations/reservation-form-ui';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS, getApiErrorMessage } from '../lib/constants';
import { toast } from '../lib/toast';
import { usersApi, type UpdateUserPayload } from '../lib/users';
import type { RoleName } from '../types';

const roleBadgeStyles: Record<string, string> = {
  Admin: 'bg-violet-100 text-violet-800 ring-violet-200',
  Pilgrim: 'bg-[#e8eef6] text-[#3d5d8a] ring-[#c5d4e8]',
  MawkibOwner: 'bg-amber-100 text-amber-800 ring-amber-200',
  HonoraryServant: 'bg-teal-100 text-teal-800 ring-teal-200',
};

function IconMapPin() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function IconNote() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
      />
    </svg>
  );
}

function IconShield() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}

function ProfileInfoField({
  icon,
  label,
  value,
  valueClassName = '',
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50/90 to-white p-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#4a6fa5] shadow-sm ring-1 ring-slate-100">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className={`mt-1 text-sm font-semibold text-slate-800 ${valueClassName}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-slate-100 bg-gradient-to-l from-[#f0f4fa] to-white px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5]">
          {icon}
        </div>
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function roleLabel(name: RoleName) {
  if (name === 'HonoraryServant') return 'خادم افتخاری';
  return ROLE_LABELS[name] ?? name;
}

export function ProfilePage() {
  const { user, updateStoredUser } = useAuth();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);

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
      toast.success('پروفایل با موفقیت به‌روزرسانی شد');
    },
  });

  if (isLoading || !profile) {
    return <p className="text-slate-500">در حال بارگذاری...</p>;
  }

  const locationValue = [profile.province, profile.city].filter(Boolean).join('، ') || '—';

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 sm:space-y-5">
      <section className="overflow-hidden rounded-2xl border border-[#c5d4e8]/60 bg-white shadow-sm">
        <div className="bg-gradient-to-l from-[#4a6fa5] to-[#3d5d8a] px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <UserAvatar
                fullName={profile.fullName}
                imageUrl={profile.imageUrl}
                size="lg"
                className="ring-[3px] ring-white/30"
              />
              <div className="min-w-0 text-white">
                <p className="text-xs text-white/75">پروفایل من</p>
                <h1 className="mt-0.5 truncate text-lg font-bold sm:text-xl">
                  {profile.fullName}
                </h1>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {profile.roles.map((r) => (
                    <span
                      key={r.role.name}
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${
                        roleBadgeStyles[r.role.name] ?? 'bg-white/15 text-white ring-white/25'
                      }`}
                    >
                      {roleLabel(r.role.name)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#4a6fa5] shadow-sm transition hover:bg-white/95 sm:self-center"
            >
              <NavIcon name="profile" className="h-4 w-4" />
              ویرایش پروفایل
            </button>
          </div>
        </div>
      </section>

      <SectionCard title="اطلاعات حساب" icon={<IconUser />}>
        <div className="grid gap-3 sm:grid-cols-2">
          <ProfileInfoField
            icon={<IconUser />}
            label="نام و نام خانوادگی"
            value={profile.fullName}
          />
          <ProfileInfoField
            icon={<IconPhone />}
            label="شماره موبایل"
            value={profile.mobileNumber}
            valueClassName="text-right tracking-wide"
          />
          <ProfileInfoField
            icon={<IconMapPin />}
            label="استان و شهر"
            value={locationValue}
          />
          <ProfileInfoField
            icon={<IconShield />}
            label="وضعیت حساب"
            value={
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
                  profile.isActive
                    ? 'bg-emerald-100 text-emerald-800 ring-emerald-200'
                    : 'bg-red-100 text-red-700 ring-red-200'
                }`}
              >
                {profile.isActive ? 'فعال' : 'غیرفعال'}
              </span>
            }
          />
        </div>
      </SectionCard>

      {profile.description && (
        <SectionCard title="درباره من" icon={<IconNote />}>
          <ProfileInfoField
            icon={<IconNote />}
            label="توضیحات"
            value={profile.description}
            valueClassName="font-normal leading-relaxed"
          />
        </SectionCard>
      )}

      <UserSocialProfileSection user={profile} />

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
