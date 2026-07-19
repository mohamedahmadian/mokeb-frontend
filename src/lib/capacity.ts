export interface MawkibCapacitySnapshot {
  maleCapacity: number;
  femaleCapacity: number;
  availableMale: number;
  availableFemale: number;
}

export function totalCapacity(snapshot: Pick<MawkibCapacitySnapshot, 'maleCapacity' | 'femaleCapacity'>) {
  return snapshot.maleCapacity + snapshot.femaleCapacity;
}

export function totalAvailable(snapshot: Pick<MawkibCapacitySnapshot, 'availableMale' | 'availableFemale'>) {
  return snapshot.availableMale + snapshot.availableFemale;
}

export function formatCapacityLine(snapshot: MawkibCapacitySnapshot, mode: 'total' | 'available' = 'total') {
  if (mode === 'available') {
    return `آقایان: ${snapshot.availableMale} — بانوان: ${snapshot.availableFemale} (مجموع: ${totalAvailable(snapshot)})`;
  }
  return `آقایان: ${snapshot.maleCapacity} — بانوان: ${snapshot.femaleCapacity} (مجموع: ${totalCapacity(snapshot)})`;
}

export function formatGuestCount(male: number, female: number) {
  const parts: string[] = [];
  if (male > 0) parts.push(`آقایان: ${male}`);
  if (female > 0) parts.push(`بانوان: ${female}`);
  if (parts.length === 0) return '۰ نفر';
  return `${parts.join(' — ')} (مجموع: ${male + female})`;
}

/** عدد با ارقام فارسی — مثلاً ۱۲ */
export function formatPersianNumber(value: number): string {
  return value.toLocaleString('fa-IR');
}

/** ظرفیت پرشده از روی باقی‌مانده */
export function occupiedFromAvailable(
  total: number,
  available: number | undefined | null,
): number {
  const remaining = Math.max(0, available ?? 0);
  return Math.max(0, total - remaining);
}

/** ظرفیت پرشده / ظرفیت کل — مثلاً ۹/۱۰ */
export function formatOccupiedFraction(occupied: number, total: number) {
  return `${formatPersianNumber(occupied)}/${formatPersianNumber(total)}`;
}

/** ظرفیت پرشده / ظرفیت کل — available و total از API */
export function formatCapacityFraction(
  available: number | undefined | null,
  total: number,
) {
  return formatOccupiedFraction(occupiedFromAvailable(total, available), total);
}

/** عدد لاتین — برای نمایش ظرفیت در صفحات عمومی */
export function formatLatinNumber(value: number): string {
  return String(Math.max(0, value));
}

/** ظرفیت پرشده / کل با ارقام لاتین */
export function formatCapacityFractionLatin(
  available: number | undefined | null,
  total: number,
) {
  const occupied = occupiedFromAvailable(total, available);
  return formatOccupiedFractionLatin(occupied, total);
}

/** تعداد پرشده / ظرفیت کل — حتی وقتی از ظرفیت بیشتر باشد (مثلاً ۱۲/۱۰) */
export function formatOccupiedFractionLatin(occupied: number, total: number) {
  return `${formatLatinNumber(occupied)}/${formatLatinNumber(total)}`;
}

export function isCapacityOverflow(occupied: number, total: number): boolean {
  return total > 0 && occupied > total;
}

/** تعداد واقعی ثبت‌شده/حاضر با در نظر گرفتن رزرو، ظرفیت و تعداد حاضر */
export function resolveOccupiedCount(options: {
  total: number;
  available: number;
  reserved?: number | null;
  presentCount?: number | null;
}): number {
  const { total, available, reserved, presentCount } = options;
  const fromAvailable = occupiedFromAvailable(total, available);
  let count =
    reserved != null && reserved >= 0 ? reserved : fromAvailable;
  if (presentCount != null && presentCount >= 0) {
    count = Math.max(count, presentCount);
  }
  return count;
}

/** پرانتز ظرفیت خالی — مثلاً (1 خالی) */
export function formatRemainingCapacityHint(available: number): string {
  if (available <= 0) return '(تکمیل ظرفیت)';
  return `(${formatPersianNumber(available)} خالی)`;
}

/** پرانتز ظرفیت خالی با ارقام لاتین */
export function formatRemainingCapacityHintLatin(available: number): string {
  if (available <= 0) return '(تکمیل ظرفیت)';
  return `(${formatLatinNumber(available)} خالی)`;
}

export function mawkibAvailableMale(mawkib: { availableMaleCapacity?: number | null }) {
  return mawkib.availableMaleCapacity ?? 0;
}

export function mawkibAvailableFemale(mawkib: { availableFemaleCapacity?: number | null }) {
  return mawkib.availableFemaleCapacity ?? 0;
}
