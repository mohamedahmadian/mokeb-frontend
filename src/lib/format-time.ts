export const DEFAULT_CHECK_IN_TIME = '14:00';
export const DEFAULT_CHECK_OUT_TIME = '11:00';

export function normalizeTimeValue(value?: string | null): string {
  if (!value) return '';
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return value;
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

export function formatTimeFa(value?: string | null): string {
  const normalized = normalizeTimeValue(value);
  if (!normalized) return '—';
  const [h, m] = normalized.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTimeFa(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeFromIso(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function currentTimeInputValue(date = new Date()): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatLiveClockFa(date = new Date()): string {
  return date.toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function timeInputValueFromIso(value?: string | null): string {
  if (!value) return currentTimeInputValue();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return currentTimeInputValue();
  return currentTimeInputValue(date);
}

export function buildRecordedAtFromTime(time: string, baseDate = new Date()): string {
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    throw new Error('زمان نامعتبر است');
  }
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) {
    throw new Error('زمان نامعتبر است');
  }
  const date = new Date(baseDate);
  date.setHours(h, m, 0, 0);
  return date.toISOString();
}
