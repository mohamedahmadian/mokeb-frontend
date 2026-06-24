import type { HonoraryVolunteerServiceType } from './honorary-volunteer';
import type { HonoraryVolunteerApplication } from '../types';
import type { HonoraryVolunteerFormValues } from '../components/honorary-volunteers/HonoraryVolunteerForm';

export const NEED_PREFILL_QUERY_PARAM = 'needId';

export function buildHonoraryVolunteerRegisterFromNeedUrl(needId: number): string {
  return `/guest/honorary-volunteer/register?${NEED_PREFILL_QUERY_PARAM}=${needId}`;
}

export function needToRegisterPrefill(
  need: HonoraryVolunteerApplication,
): Partial<HonoraryVolunteerFormValues> {
  return {
    mawkibId: need.mawkibId ?? null,
    serviceTypes: need.serviceTypes as HonoraryVolunteerServiceType[],
    serviceDescription: need.serviceDescription ?? '',
    availabilityStartDate: need.availabilityStartDate.slice(0, 10),
    availabilityEndDate: need.availabilityEndDate.slice(0, 10),
    availabilityDescription: need.availabilityDescription ?? '',
    description: need.description ?? '',
  };
}

export function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? '';
  const lastName = parts.slice(1).join(' ') || firstName;
  return { firstName, lastName };
}

export function getNeedPrefillNotice(need: HonoraryVolunteerApplication): string {
  const mawkibName = need.mawkib?.name ?? 'موکب';
  return `اطلاعات درخواست «${mawkibName}» در فرم زیر پیش‌پر شده است. در صورت نیاز می‌توانید همه فیلدها را ویرایش کنید.`;
}
