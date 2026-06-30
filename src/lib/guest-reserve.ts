function buildReserveSearchParams(mawkibId: number, reservationDate?: string) {
  const params = new URLSearchParams({ mawkibId: String(mawkibId) });
  if (reservationDate) {
    params.set('date', reservationDate.slice(0, 10));
  }
  return params;
}

export function buildGuestReserveUrl(
  mawkibId: number,
  reservationDate?: string,
): string {
  return `/guest/reserve?${buildReserveSearchParams(mawkibId, reservationDate).toString()}`;
}

export function buildPanelReserveUrl(
  mawkibId: number,
  reservationDate?: string,
): string {
  return `/reservations/new?${buildReserveSearchParams(mawkibId, reservationDate).toString()}`;
}
