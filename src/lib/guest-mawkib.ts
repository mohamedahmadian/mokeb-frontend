export function buildGuestMawkibUrl(
  mawkibId: number,
  options?: { focusMap?: boolean },
): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const params = new URLSearchParams();
  if (options?.focusMap) {
    params.set('focus', 'map');
  }
  const query = params.toString();
  return `${origin}/guest/mawkibs/${mawkibId}${query ? `?${query}` : ''}`;
}
