import { useEffect, useState } from 'react';

export function parseGuestCountInput(value: string): number | null {
  const normalized = value.replace(/[۰-۹]/g, (digit) =>
    String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)),
  );
  const parsed = Number(normalized.trim());
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return Math.floor(parsed);
}

interface GuestCountInputProps {
  value: number;
  textValue?: string;
  disabled?: boolean;
  served?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  className?: string;
}

export function GuestCountInput({
  value,
  textValue,
  disabled = false,
  served = false,
  onChange,
  onBlur,
  className = '',
}: GuestCountInputProps) {
  const [internalText, setInternalText] = useState(String(value));
  const isControlled = textValue !== undefined;
  const text = isControlled ? textValue : internalText;

  useEffect(() => {
    if (!isControlled) {
      setInternalText(String(value));
    }
  }, [value, isControlled]);

  const handleChange = (next: string) => {
    if (!isControlled) {
      setInternalText(next);
    }
    onChange?.(next);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={text}
      disabled={disabled}
      onChange={(event) => handleChange(event.target.value)}
      onBlur={onBlur}
      onFocus={(event) => event.target.select()}
      className={`h-8 w-11 rounded-lg border text-center text-sm font-semibold tabular-nums outline-none transition-colors ${
        served
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : disabled
            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
            : 'border-slate-300 bg-white text-slate-800 focus:border-[#4a6fa5] focus:ring-1 focus:ring-[#4a6fa5]/30'
      } ${className}`}
      dir="ltr"
      aria-label="تعداد"
    />
  );
}

export function useGuestCountState(
  items: Array<{ id: number; guestCount: number; isServed: boolean }>,
) {
  const [guestCounts, setGuestCounts] = useState<Record<number, string>>({});

  useEffect(() => {
    setGuestCounts((current) => {
      const next = { ...current };
      for (const item of items) {
        if (!(item.id in next) || item.isServed) {
          next[item.id] = String(item.guestCount);
        }
      }
      return next;
    });
  }, [items]);

  const setGuestCount = (id: number, value: string) => {
    setGuestCounts((current) => ({ ...current, [id]: value }));
  };

  const parseGuestCount = (id: number, fallback: number): number | null => {
    return parseGuestCountInput(guestCounts[id] ?? String(fallback));
  };

  return { guestCounts, setGuestCount, parseGuestCount };
}
