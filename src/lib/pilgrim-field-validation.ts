import { isCompleteIranMobile, normalizeMobileDigits } from './mobile';

export function normalizeNationalIdDigits(value: string): string {
  return normalizeMobileDigits(value);
}

/** کد ملی اختیاری است؛ اگر خالی باشد معتبر است. */
export function getNationalIdValidationError(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const digits = normalizeNationalIdDigits(trimmed);
  if (digits.length !== 10) {
    return 'کد ملی باید ۱۰ رقم باشد';
  }

  return null;
}

export function getMobileValidationError(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'شماره موبایل را وارد کنید';
  }

  if (!isCompleteIranMobile(trimmed)) {
    return 'شماره موبایل باید ۱۱ رقم باشد (مثلاً 09121234567)';
  }

  return null;
}
