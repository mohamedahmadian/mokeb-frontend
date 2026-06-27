export const PIN_PASSWORD_LENGTH = 4;

export const PIN_PASSWORD_REGEX = /^\d{4}$/;

export const PIN_PASSWORD_ERROR = 'رمز عبور باید ۴ رقم باشد';

export const PIN_PASSWORD_HINT = '۴ رقم عددی (مثلاً ۴ رقم آخر موبایل)';

export function isValidPinPassword(value: string): boolean {
  return PIN_PASSWORD_REGEX.test(value);
}

export function sanitizePinPasswordInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, PIN_PASSWORD_LENGTH);
}
