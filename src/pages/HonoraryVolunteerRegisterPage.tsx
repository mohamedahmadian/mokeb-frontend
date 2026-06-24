import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GuestPageHeader, GuestShell } from '../components/guest/GuestShell';
import { HonoraryVolunteerForm } from '../components/honorary-volunteers/HonoraryVolunteerForm';
import { HonoraryVolunteerLoginStep } from '../components/honorary-volunteers/HonoraryVolunteerLoginStep';
import { HonoraryVolunteerUserTypeChoice } from '../components/honorary-volunteers/HonoraryVolunteerUserTypeChoice';
import { useAuth } from '../contexts/AuthContext';
import { honoraryVolunteersApi } from '../lib/honorary-volunteers';
import {
  NEED_PREFILL_QUERY_PARAM,
  getNeedPrefillNotice,
  needToRegisterPrefill,
  splitFullName,
} from '../lib/honorary-volunteer-register-prefill';
import { guestTheme } from '../lib/guest-theme';
import { usersApi } from '../lib/users';
import type { HonoraryVolunteerApplication } from '../types';

type RegisterLocationState = {
  fromNeed?: HonoraryVolunteerApplication;
};

type RegisterStep = 'choose' | 'login' | 'form';
type UserKind = 'existing' | 'new';

function IconHand() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

export function HonoraryVolunteerRegisterPage() {
  const navigate = useNavigate();
  const { user, login, setSession } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const needIdParam = searchParams.get(NEED_PREFILL_QUERY_PARAM);
  const stateNeed = (location.state as RegisterLocationState | null)?.fromNeed;

  const [step, setStep] = useState<RegisterStep>('choose');
  const [userKind, setUserKind] = useState<UserKind | null>(null);
  const [sessionUserId, setSessionUserId] = useState<number | null>(user?.id ?? null);

  const { data: publicNeeds = [], isLoading: loadingNeed } = useQuery({
    queryKey: ['honorary-volunteer-needs-prefill', needIdParam],
    queryFn: () => honoraryVolunteersApi.listPublicNeeds(),
    enabled: !stateNeed && Boolean(needIdParam),
  });

  const fromNeed = useMemo(() => {
    if (stateNeed) return stateNeed;
    if (!needIdParam) return undefined;
    const id = Number(needIdParam);
    if (!Number.isFinite(id)) return undefined;
    return publicNeeds.find((need) => need.id === id);
  }, [stateNeed, needIdParam, publicNeeds]);

  const activeUserId = sessionUserId ?? user?.id ?? null;

  const { data: profile } = useQuery({
    queryKey: ['profile', activeUserId, 'honorary-register'],
    queryFn: usersApi.getMe,
    enabled: userKind === 'existing' && step === 'form' && activeUserId != null,
  });

  const needPrefill = useMemo(
    () => (fromNeed ? needToRegisterPrefill(fromNeed) : undefined),
    [fromNeed],
  );

  const lockedPersonalInfo = useMemo(() => {
    if (userKind !== 'existing') return undefined;
    const source = profile ?? user;
    if (!source) return undefined;

    const { firstName, lastName } = splitFullName(source.fullName);
    return {
      firstName,
      lastName,
      mobileNumber: source.mobileNumber,
      province: 'province' in source ? source.province ?? '' : '',
      city: 'city' in source ? source.city ?? '' : '',
    };
  }, [userKind, profile, user]);

  const prefillNotice = fromNeed ? getNeedPrefillNotice(fromNeed) : undefined;

  const handleChoose = (kind: UserKind) => {
    setUserKind(kind);
    if (kind === 'new') {
      setStep('form');
      return;
    }

    if (user) {
      setSessionUserId(user.id);
      setStep('form');
      return;
    }

    setStep('login');
  };

  const handleLogin = async (mobileNumber: string, password: string) => {
    await login(mobileNumber, password);
    const stored = localStorage.getItem('user');
    const parsed = stored ? (JSON.parse(stored) as { id: number }) : null;
    setSessionUserId(parsed?.id ?? null);
    setStep('form');
  };

  const handleBackToChoose = () => {
    setStep('choose');
    setUserKind(null);
  };

  const handleBackFromForm = () => {
    if (userKind === 'existing' && !user) {
      setStep('login');
      return;
    }
    handleBackToChoose();
  };

  const navigateToSuccess = (trackingCode: string) => {
    navigate(
      `/guest/honorary-volunteer/success?trackingCode=${encodeURIComponent(trackingCode)}`,
    );
  };

  if (!stateNeed && needIdParam && loadingNeed) {
    return (
      <GuestShell maxWidth="lg">
        <div className={`${guestTheme.card} p-8 text-center text-slate-500`}>
          در حال بارگذاری اطلاعات درخواست...
        </div>
      </GuestShell>
    );
  }

  const pageTitle = 'اعلام آمادگی خادم‌یاری';
  const pageSubtitle =
    fromNeed?.mawkib
      ? `اعلام آمادگی برای همکاری با ${fromNeed.mawkib.name}`
      : 'آمادگی خود را برای خدمت در موکب‌ها اعلام کنید';

  if (step === 'choose') {
    return (
      <GuestShell maxWidth="lg">
        <GuestPageHeader icon={<IconHand />} title={pageTitle} subtitle={pageSubtitle} />
        <HonoraryVolunteerUserTypeChoice onSelect={handleChoose} />
      </GuestShell>
    );
  }

  if (step === 'login') {
    return (
      <GuestShell maxWidth="lg">
        <GuestPageHeader
          icon={<IconHand />}
          title={pageTitle}
          subtitle="ورود با حساب کاربری موجود"
        />
        <HonoraryVolunteerLoginStep onBack={handleBackToChoose} onLogin={handleLogin} />
      </GuestShell>
    );
  }

  if (userKind === 'existing' && !lockedPersonalInfo) {
    return (
      <GuestShell maxWidth="lg">
        <div className={`${guestTheme.card} p-8 text-center text-slate-500`}>
          در حال بارگذاری اطلاعات کاربر...
        </div>
      </GuestShell>
    );
  }

  return (
    <HonoraryVolunteerForm
      key={`${userKind}-${fromNeed?.id ?? 'register'}-${activeUserId ?? 'guest'}`}
      title={pageTitle}
      subtitle={pageSubtitle}
      submitLabel="ثبت اعلام آمادگی"
      initialValues={needPrefill}
      prefillNotice={prefillNotice}
      hidePersonalFields={userKind === 'existing'}
      lockedPersonalInfo={lockedPersonalInfo}
      showPassword={userKind === 'new'}
      onBack={handleBackFromForm}
      onSubmit={async (values) => {
        if (userKind === 'existing') {
          const result = await honoraryVolunteersApi.createMyApplication({
            mawkibId: values.mawkibId ?? undefined,
            description: values.description || undefined,
            serviceTypes: values.serviceTypes,
            serviceDescription: values.serviceDescription || undefined,
            availabilityStartDate: values.availabilityStartDate,
            availabilityEndDate: values.availabilityEndDate,
            availabilityDescription: values.availabilityDescription || undefined,
          });
          navigateToSuccess(result.trackingCode);
          return;
        }

        const result = await honoraryVolunteersApi.createApplication({
          firstName: values.firstName,
          lastName: values.lastName,
          mobileNumber: values.mobileNumber,
          password: values.password,
          province: values.province || undefined,
          city: values.city || undefined,
          mawkibId: values.mawkibId ?? undefined,
          description: values.description || undefined,
          serviceTypes: values.serviceTypes,
          serviceDescription: values.serviceDescription || undefined,
          availabilityStartDate: values.availabilityStartDate,
          availabilityEndDate: values.availabilityEndDate,
          availabilityDescription: values.availabilityDescription || undefined,
        });

        if (result.accessToken && result.user) {
          setSession({ accessToken: result.accessToken, user: result.user });
        }

        navigateToSuccess(result.trackingCode);
      }}
    />
  );
}
