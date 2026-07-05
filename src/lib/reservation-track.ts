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
