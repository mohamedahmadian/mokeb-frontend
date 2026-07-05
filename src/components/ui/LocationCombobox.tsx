import { useEffect, useMemo, useRef, useState } from 'react';
import { guestTheme } from '../../lib/guest-theme';

interface LocationComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  inputClassName?: string;
  loading?: boolean;
  /** وقتی لیست خالی است به کاربر یادآوری می‌کند که می‌تواند دستی وارد کند */
  manualEntryHint?: string;
}

export function LocationCombobox({
  value,
  onChange,
  options,
  placeholder = 'انتخاب یا وارد کردن',
  disabled = false,
  inputClassName,
  loading = false,
  manualEntryHint,
}: LocationComboboxProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputClass = inputClassName ?? guestTheme.input;

  useEffect(() => {
    if (!open) {
      setQuery(value);
    }
  }, [value, open]);

  const filtered = useMemo(() => {
    const term = query.trim();
    if (!term) return options;
    return options.filter((option) => option.includes(term));
  }, [options, query]);

  const commitValue = (next: string) => {
    const trimmed = next.trim();
    onChange(trimmed);
    setQuery(trimmed);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        if (open) {
          commitValue(query);
        }
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, query]);

  const showDropdown = open && !loading && filtered.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={open ? query : value}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          onChange(next);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery(value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commitValue(query);
          }
        }}
        placeholder={loading ? 'در حال بارگذاری...' : placeholder}
        className={`${inputClass} min-h-[2.875rem]`}
        disabled={disabled || loading}
        autoComplete="off"
      />
      {manualEntryHint && !loading && options.length === 0 && !value && (
        <p className="mt-1 text-xs text-slate-400">{manualEntryHint}</p>
      )}
      {showDropdown && (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {filtered.map((option) => (
            <li key={option}>
              <button
                type="button"
                className="w-full px-3 py-2 text-right text-sm text-slate-700 hover:bg-slate-50"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => commitValue(option)}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
