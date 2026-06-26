import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi, type PilgrimOption, MIN_PILGRIM_SEARCH_LENGTH } from '../../lib/users';
import { inputClass } from '../../lib/styles';

interface PilgrimSearchSelectProps {
  value: PilgrimOption | null;
  onChange: (pilgrim: PilgrimOption | null) => void;
}

export function PilgrimSearchSelect({ value, onChange }: PilgrimSearchSelectProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const trimmedSearch = search.trim();
  const canSearch = trimmedSearch.length >= MIN_PILGRIM_SEARCH_LENGTH;

  const { data: pilgrims = [], isLoading } = useQuery({
    queryKey: ['pilgrims', 'all', trimmedSearch],
    queryFn: () => usersApi.searchPilgrims(trimmedSearch),
    enabled: open && canSearch,
  });

  useEffect(() => {
    if (value) {
      setSearch(`${value.fullName} — ${value.mobileNumber}`);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
          if (value) onChange(null);
        }}
        onFocus={() => setOpen(true)}
        placeholder="حداقل ۲ کاراکتر از نام یا موبایل..."
        className={inputClass}
      />

      {open && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {!canSearch ? (
            <p className="px-3 py-2 text-sm text-slate-400">
              برای جستجو در همه زائران، حداقل {MIN_PILGRIM_SEARCH_LENGTH} کاراکتر وارد کنید
            </p>
          ) : isLoading ? (
            <p className="px-3 py-2 text-sm text-slate-400">در حال جستجو...</p>
          ) : pilgrims.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-400">زائری یافت نشد</p>
          ) : (
            pilgrims.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onChange(p);
                  setSearch(`${p.fullName} — ${p.mobileNumber}`);
                  setOpen(false);
                }}
                className={`block w-full px-3 py-2 text-right text-sm hover:bg-slate-50 ${
                  value?.id === p.id ? 'bg-[#f0f4fa] text-[#3d5d8a]' : 'text-slate-700'
                }`}
              >
                <span className="font-medium">{p.fullName}</span>
                <span className="mr-2 font-mono text-slate-500">{p.mobileNumber}</span>
                {p.city && (
                  <span className="mr-2 text-xs text-slate-400">({p.city})</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
