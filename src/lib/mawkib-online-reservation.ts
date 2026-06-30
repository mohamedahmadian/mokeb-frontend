import type { Mawkib } from '../types';

export function isMawkibOnlineReservationEnabled(
  mawkib: Pick<Mawkib, 'onlineReservationEnabled'>,
) {
  return mawkib.onlineReservationEnabled !== false;
}

/** مهمان یا زائر در پنل — رزرو آنلاین فقط برای موکب‌های فعال */
export function isRestrictedOnlineReserver(
  isPanel: boolean,
  roles?: string[],
) {
  if (!isPanel) return true;
  const isAdmin = roles?.includes('Admin') ?? false;
  const isOwner = roles?.includes('MawkibOwner') ?? false;
  return !isAdmin && !isOwner;
}

export function canUserReserveMawkibOnline(
  mawkib: Pick<Mawkib, 'onlineReservationEnabled'>,
  isPanel: boolean,
  roles?: string[],
) {
  if (isMawkibOnlineReservationEnabled(mawkib)) return true;
  return !isRestrictedOnlineReserver(isPanel, roles);
}

export const ONLINE_RESERVATION_DISABLED_LABEL = 'رزرو آنلاین غیرفعال';
