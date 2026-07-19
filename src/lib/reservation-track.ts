import { formatMobileForSms } from './mobile';
import { buildReservationSmsOpeningLine } from './user-gender';

const TRACK_QUERY_PARAM = 'trackingCode';

export function buildReservationTrackUrl(trackingCode: string): string {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : '';
  const params = new URLSearchParams({
    [TRACK_QUERY_PARAM]: trackingCode.trim(),
  });
  return `${origin}/guest/track?${params.toString()}`;
}

export function buildPilgrimCardUrl(trackingCode: string): string {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : '';
  const params = new URLSearchParams({
    [TRACK_QUERY_PARAM]: trackingCode.trim(),
  });
  return `${origin}/guest/pilgrim-card?${params.toString()}`;
}

export function getTrackingCodeFromSearchParams(
  params: URLSearchParams,
): string {
  return (params.get(TRACK_QUERY_PARAM) ?? params.get('code') ?? '').trim();
}

export function reservationTrackPath(trackingCode: string): string {
  const params = new URLSearchParams({
    [TRACK_QUERY_PARAM]: trackingCode.trim(),
  });
  return `/guest/track?${params.toString()}`;
}

export function pilgrimCardPath(trackingCode: string): string {
  const params = new URLSearchParams({
    [TRACK_QUERY_PARAM]: trackingCode.trim(),
  });
  return `/guest/pilgrim-card?${params.toString()}`;
}

/** Build sms: link with reservation code, pilgrim card URL, and mawkib address. */
export function buildQuickReservationSmsHref(reservation: {
  trackingCode?: string | null;
  pilgrimMobile?: string | null;
  maleGuestCount?: number;
  femaleGuestCount?: number;
  pilgrim?: {
    fullName?: string | null;
    mobileNumber?: string | null;
    gender?: 'Male' | 'Female' | null;
  };
  mawkib?: {
    address?: string | null;
    name?: string;
    neshanAddressUrl?: string | null;
  };
}): string | null {
  const trackingCode = reservation.trackingCode?.trim();
  if (!trackingCode) return null;

  const recipient = formatMobileForSms(
    reservation.pilgrimMobile ?? reservation.pilgrim?.mobileNumber ?? '',
  );
  if (!recipient) return null;

  const cardUrl = buildPilgrimCardUrl(trackingCode);
  const mawkibName = reservation.mawkib?.name?.trim();
  const address =
    reservation.mawkib?.address?.trim() ||
    mawkibName ||
    '—';
  const neshanAddress = reservation.mawkib?.neshanAddressUrl?.trim();
  const openingLine = buildReservationSmsOpeningLine(mawkibName);

  const bodyLines = [
    ...(openingLine ? [openingLine, ''] : []),
    'کد رزرو:',
    trackingCode,
    '',
    'زائر کارت:',
    cardUrl,
    '',
    'ادرس:',
    address,
  ];

  if (neshanAddress) {
    bodyLines.push('', 'نشان:', neshanAddress);
  }

  const body = bodyLines.join('\n');

  const bodyParam =
    typeof navigator !== 'undefined' &&
    /iPhone|iPad|iPod/i.test(navigator.userAgent)
      ? '&body='
      : '?body=';
  return `sms:${recipient}${bodyParam}${encodeURIComponent(body)}`;
}
