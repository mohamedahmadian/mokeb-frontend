const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

function toLatinDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (ch) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(ch);
    if (persianIndex >= 0) return String(persianIndex);
    const arabicIndex = ARABIC_DIGITS.indexOf(ch);
    return arabicIndex >= 0 ? String(arabicIndex) : ch;
  });
}

/** Keep only latin digits from any mobile input. */
export function normalizeMobileDigits(value: string): string {
  return toLatinDigits(value).replace(/\D/g, '');
}

/** Normalize typed mobile while preserving common formatting characters. */
export function normalizeMobileInput(value: string): string {
  return toLatinDigits(value);
}

/** Canonical 11-digit Iranian mobile (09xxxxxxxxx) when complete enough to lookup. */
export function formatMobileForLookup(value: string): string {
  const digits = normalizeMobileDigits(value);
  if (/^9\d{9}$/.test(digits)) return `0${digits}`;
  return digits;
}

export function isCompleteIranMobile(value: string): boolean {
  const digits = normalizeMobileDigits(value);
  return digits.length === 11 && digits.startsWith('09');
}
