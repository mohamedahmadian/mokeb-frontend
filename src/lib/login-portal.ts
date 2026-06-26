export const LOGIN_PORTAL_PARAM = 'portal';

export type LoginPortal = 'mawkib-owner' | 'honorary';

const LOGIN_PORTAL_CONTENT: Record<
  LoginPortal,
  { title: string; subtitle: string }
> = {
  'mawkib-owner': {
    title: 'ورود به سامانه موکب‌داران',
    subtitle: 'ورود موکب‌داران به پنل مدیریت موکب',
  },
  honorary: {
    title: 'ورود به سامانه خادمین',
    subtitle: 'ورود خادمان به پنل پیگیری و مدیریت درخواست‌ها',
  },
};

const DEFAULT_CONTENT = {
  title: 'ورود به سامانه زوار',
  subtitle: 'ورود زائران به حساب کاربری در سامانه',
};

export function buildLoginUrl(portal?: LoginPortal): string {
  if (!portal) return '/login';
  return `/login?${LOGIN_PORTAL_PARAM}=${portal}`;
}

export function parseLoginPortal(value: string | null): LoginPortal | null {
  if (value === 'mawkib-owner' || value === 'honorary') return value;
  return null;
}

export function getLoginPortalContent(portal: LoginPortal | null) {
  if (!portal) return DEFAULT_CONTENT;
  return LOGIN_PORTAL_CONTENT[portal];
}
