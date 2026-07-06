export function buildGuestMawkibPath(
  mawkibId: number,
  options?: { focusMap?: boolean; trackingCode?: string },
): string {
  const params = new URLSearchParams();
  if (options?.focusMap) {
    params.set('focus', 'map');
  }
  if (options?.trackingCode?.trim()) {
    params.set('trackingCode', options.trackingCode.trim());
  }
  const query = params.toString();
  return `/guest/mawkibs/${mawkibId}${query ? `?${query}` : ''}`;
}

export function buildGuestMawkibUrl(
  mawkibId: number,
  options?: { focusMap?: boolean; trackingCode?: string },
): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}${buildGuestMawkibPath(mawkibId, options)}`;
}
