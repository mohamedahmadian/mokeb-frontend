const TRACK_QUERY_PARAM = 'trackingCode';

export function buildHonoraryVolunteerTrackUrl(trackingCode: string): string {
  const url = new URL('/guest/honorary-volunteer/track', window.location.origin);
  url.searchParams.set(TRACK_QUERY_PARAM, trackingCode.trim());
  return url.pathname + url.search;
}
