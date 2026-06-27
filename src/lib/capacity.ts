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

/** ظرفیت باقی‌مانده / ظرفیت کل — مثلاً ۳/۱۰ */
export function formatCapacityFraction(available: number | undefined, total: number) {
  const remaining = available ?? total;
  return `${remaining}/${total}`;
}
