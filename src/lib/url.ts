/** Ensure external links open correctly when user omits the scheme. */
export function normalizeExternalUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function formatPilgrimAddress(pilgrim: {
  address?: string | null;
  province?: string | null;
  city?: string | null;
}): string {
  const parts = [
    pilgrim.address?.trim(),
    pilgrim.city?.trim(),
    pilgrim.province?.trim(),
  ].filter(Boolean);
  return parts.join('، ') || '—';
}
