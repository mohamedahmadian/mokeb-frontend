import { useEffect, useId, useRef, useState } from 'react';
import {
  HOUR_OPTIONS,
  buildTimeFromHour,
  formatHourFa,
  parseHourFromTimeValue,
} from '../../lib/format-time';

interface PersianTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  inputClassName?: string;
  disabled?: boolean;
}

export function PersianTimeInput({
  value,
  onChange,
  label,
  inputClassName = '',
  disabled = false,
}: PersianTimeInputProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selectedHour = parseHourFromTimeValue(value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const selectedEl = listRef.current?.querySelector('[aria-selected="true"]');
    selectedEl?.scrollIntoView({ block: 'center' });
  }, [open, selectedHour]);

  const hourTextClass = 'font-[Vazir] text-base font-bold tabular-nums';
  const hourListItemClass =
    'block w-full px-3 py-2 text-center font-[Vazir] text-sm tabular-nums transition hover:bg-slate-50';

  const selectHour = (hour: number) => {
    onChange(buildTimeFromHour(hour));
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="flex items-center gap-3" dir="rtl">
      {label && (
        <span className="shrink-0 text-sm text-slate-600">{label}</span>
      )}
      <div className="relative min-w-0 flex-1">
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((prev) => !prev)}
          className={`${inputClassName} flex w-full items-center justify-center gap-2`}
          dir="ltr"
        >
          <span className={hourTextClass}>{formatHourFa(selectedHour)}</span>
          <svg
            className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {open && !disabled && (
          <ul
            id={listId}
            ref={listRef}
            role="listbox"
            aria-label={label ?? 'انتخاب ساعت'}
            className="absolute z-30 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          >
            {HOUR_OPTIONS.map((hour) => {
              const selected = hour === selectedHour;
              return (
                <li key={hour} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectHour(hour)}
                    className={`${hourListItemClass} ${
                      selected
                        ? 'bg-[#f0f4fa] font-bold text-[#3d5d8a]'
                        : 'font-normal text-slate-700'
                    }`}
                  >
                    {formatHourFa(hour)}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
