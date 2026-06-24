import { useEffect, useId, useMemo, useRef, useState } from 'react';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[] | string[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  emptyMessage?: string;
  clearable?: boolean;
}

function normalizeOptions(options: SearchableSelectOption[] | string[]): SearchableSelectOption[] {
  if (options.length === 0) return [];
  if (typeof options[0] === 'string') {
    return (options as string[]).map((item) => ({ value: item, label: item }));
  }
  return options as SearchableSelectOption[];
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'انتخاب کنید',
  searchPlaceholder = 'جستجو...',
  disabled = false,
  className = '',
  emptyMessage = 'موردی یافت نشد',
  clearable = true,
}: SearchableSelectProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const normalizedOptions = useMemo(() => normalizeOptions(options), [options]);

  const selectedLabel =
    normalizedOptions.find((option) => option.value === value)?.label ?? '';

  const filteredOptions = useMemo(() => {
    const q = query.trim();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter((option) => option.label.includes(q));
  }, [normalizedOptions, query]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => !prev);
          if (open) setQuery('');
        }}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-right text-sm transition focus:border-emerald-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${className}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
      >
        <span className={selectedLabel ? 'text-slate-800' : 'text-slate-400'}>
          {selectedLabel || placeholder}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 p-2">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <ul id={listId} role="listbox" className="max-h-52 overflow-y-auto py-1">
            {clearable && (
              <li>
                <button
                  type="button"
                  onClick={() => handleSelect('')}
                  className={`w-full px-3 py-2 text-right text-sm hover:bg-emerald-50 ${
                    !value ? 'bg-emerald-50 font-medium text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {placeholder}
                </button>
              </li>
            )}
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-3 text-center text-sm text-slate-400">{emptyMessage}</li>
            ) : (
              filteredOptions.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-3 py-2 text-right text-sm hover:bg-emerald-50 ${
                      option.value === value
                        ? 'bg-emerald-50 font-medium text-emerald-700'
                        : 'text-slate-800'
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
