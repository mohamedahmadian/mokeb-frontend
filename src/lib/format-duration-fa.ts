const ONES: Record<number, string> = {
  0: 'صفر',
  1: 'یک',
  2: 'دو',
  3: 'سه',
  4: 'چهار',
  5: 'پنج',
  6: 'شش',
  7: 'هفت',
  8: 'هشت',
  9: 'نه',
  10: 'ده',
  11: 'یازده',
  12: 'دوازده',
  13: 'سیزده',
  14: 'چهارده',
  15: 'پانزده',
  16: 'شانزده',
  17: 'هفده',
  18: 'هجده',
  19: 'نوزده',
};

function numberToPersianWords(value: number): string {
  if (value < 0) return String(value);
  if (value < 20) return ONES[value] ?? String(value);
  if (value < 100) {
    const tens = Math.floor(value / 10);
    const ones = value % 10;
    const tensWord =
      tens === 2
        ? 'بیست'
        : tens === 3
          ? 'سی'
          : tens === 4
            ? 'چهل'
            : tens === 5
              ? 'پنجاه'
              : tens === 6
                ? 'شصت'
                : `${ONES[tens]}ده`;
    return ones === 0 ? tensWord : `${tensWord} و ${ONES[ones]}`;
  }
  return value.toLocaleString('fa-IR');
}

/** e.g. «پنج دقیقه» یا «یک ساعت و ده دقیقه» */
export function formatDurationFaWords(totalMs: number): string {
  if (totalMs < 60_000) return 'کمتر از یک دقیقه';

  const totalMinutes = Math.floor(totalMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${numberToPersianWords(minutes)} دقیقه`;
  }
  if (minutes === 0) {
    return `${numberToPersianWords(hours)} ساعت`;
  }
  return `${numberToPersianWords(hours)} ساعت و ${numberToPersianWords(minutes)} دقیقه`;
}
