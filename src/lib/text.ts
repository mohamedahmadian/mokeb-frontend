/** نمایش ابتدای متن با محدودیت تعداد کاراکتر */
export function truncateText(text: string, maxLength = 60): string {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized) return "—";
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength)}…`;
}
