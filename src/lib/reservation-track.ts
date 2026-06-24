const TRACK_QUERY_PARAM = 'trackingCode';

export function buildReservationTrackUrl(trackingCode: string): string {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : '';
  const params = new URLSearchParams({
    [TRACK_QUERY_PARAM]: trackingCode.trim(),
  });
  return `${origin}/guest/track?${params.toString()}`;
}

export function getTrackingCodeFromSearchParams(
  params: URLSearchParams,
): string {
  return (params.get(TRACK_QUERY_PARAM) ?? params.get('code') ?? '').trim();
}
