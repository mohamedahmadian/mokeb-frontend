import { formatMobileForLookup, isCompleteIranMobile } from './mobile';
import { buildPilgrimCardUrl } from './reservation-track';
import type { Reservation } from '../types';

export function buildQuickReservationSmsBody(reservation: Reservation): string | null {
  const trackingCode = reservation.trackingCode?.trim();
  if (!trackingCode) return null;

  const cardUrl = buildPilgrimCardUrl(trackingCode);
  const address = reservation.mawkib.address?.trim() || '—';

  return [
    `کد رزرو: ${trackingCode}`,
    `زائر کارت: ${cardUrl}`,
    `آدرس موکب: ${address}`,
  ].join('\n');
}

export function buildQuickReservationSmsHref(
  reservation: Reservation,
): string | null {
  const mobile = formatMobileForLookup(reservation.pilgrimMobile);
  if (!isCompleteIranMobile(mobile)) return null;

  const body = buildQuickReservationSmsBody(reservation);
  if (!body) return null;

  return `sms:${mobile}?body=${encodeURIComponent(body)}`;
}
