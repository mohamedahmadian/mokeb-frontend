import {
  formatLatinNumber,
  formatPersianNumber,
} from '../../lib/capacity';

/** Persian labels use Vazir; capacity counts stay monospace. */
const vazirClass = 'font-[Vazir,ui-sans-serif,system-ui,sans-serif]';

interface RemainingCapacityHintProps {
  available: number;
  numerals?: 'latin' | 'persian';
  className?: string;
  fullClassName?: string;
}

export function RemainingCapacityHint({
  available,
  numerals = 'persian',
  className = 'text-slate-500',
  fullClassName = 'text-[11px] font-semibold text-red-600',
}: RemainingCapacityHintProps) {
  const formatNum =
    numerals === 'latin' ? formatLatinNumber : formatPersianNumber;

  if (available <= 0) {
    return (
      <span className={`${vazirClass} font-bold ${fullClassName}`}>(تکمیل ظرفیت)</span>
    );
  }

  return (
    <span className={`${vazirClass} font-bold ${className}`}>
      ({formatNum(available)} خالی)
    </span>
  );
}
