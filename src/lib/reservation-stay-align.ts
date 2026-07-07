import { formatPersianNumber } from './capacity';
import type { AlignReservationEndResult } from './date-range';

export function reservationStayAlignAlertMessage(
  result: AlignReservationEndResult,
): string | null {
  if (!result.adjusted || result.limitDays == null || !result.reason) {
    return null;
  }

  const days = formatPersianNumber(result.limitDays);
  if (result.reason === 'below-min') {
    return `حداقل بازه رزرو برای این موکب ${days} روز است؛ تاریخ پایان تنظیم شد.`;
  }
  return `حداکثر بازه رزرو برای این موکب ${days} روز است؛ تاریخ پایان تنظیم شد.`;
}
