import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi, MIN_PILGRIM_SEARCH_LENGTH, type PilgrimOption } from '../../lib/users';
import { filterInputClass } from '../../lib/styles';

interface PilgrimFilterSelectProps {
  value: string;
  onChange: (
    pilgrimUserId: string,
    pilgrim?: Pick<PilgrimOption, 'fullName' | 'mobileNumber'>,
  ) => void;
  className?: string;
  placeholder?: string;
}

export function PilgrimFilterSelect({
  value,
  onChange,
  className = filterInputClass,
  placeholder = 'جستجو در همه زائران — حداقل ۲ کاراکتر',
}: PilgrimFilterSelectProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const pilgrimId = value ? Number(value) : 0;

  const { data: selectedPilgrim } = useQuery({
    queryKey: ['pilgrim-filter', pilgrimId],
    queryFn: () => usersApi.getOne(pilgrimId),
    enabled: pilgrimId > 0,
  });

  const trimmedSearch = search.trim();
  const canSearch = trimmedSearch.length >= MIN_PILGRIM_SEARCH_LENGTH;

  const { data: pilgrims = [], isLoading } = useQuery({
    queryKey: ['pilgrims-search-filter', 'all', trimmedSearch],
    queryFn: () => usersApi.searchPilgrims(trimmedSearch),
    enabled: open && canSearch,
  });

  useEffect(() => {
    if (pilgrimId > 0 && selectedPilgrim) {
      setSearch(`${selectedPilgrim.fullName} — ${selectedPilgrim.mobileNumber}`);
      return;
    }

    if (pilgrimId > 0) {
      setSearch("در حال بارگذاری زائر...");
      return;
    }

    setSearch("");
  }, [selectedPilgrim, pilgrimId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (selectedPilgrim && pilgrimId > 0) {
          setSearch(`${selectedPilgrim.fullName} — ${selectedPilgrim.mobileNumber}`);
        } else if (!pilgrimId) {
          setSearch('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedPilgrim, pilgrimId]);

  const handleClear = () => {
    onChange('');
    setSearch('');
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
          if (value) onChange('');
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={className}
      />

      {open && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={handleClear}
            className={`block w-full border-b border-slate-100 px-3 py-2 text-right text-sm hover:bg-slate-50 ${
              !value ? 'bg-[#f0f4fa] font-medium text-[#4a6fa5]' : 'text-slate-500'
            }`}
          >
            همه زائرین
          </button>
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
                  onChange(String(p.id), {
                    fullName: p.fullName,
                    mobileNumber: p.mobileNumber,
                  });
                  setSearch(`${p.fullName} — ${p.mobileNumber}`);
                  setOpen(false);
                }}
                className={`block w-full px-3 py-2 text-right text-sm hover:bg-slate-50 ${
                  value === String(p.id) ? 'bg-[#f0f4fa] text-[#3d5d8a]' : 'text-slate-700'
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
