import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../lib/users';
import { filterInputClass } from '../../lib/styles';

interface MawkibOwnerFilterSelectProps {
  value: string;
  onChange: (ownerUserId: string) => void;
  className?: string;
  placeholder?: string;
  allowClear?: boolean;
}

export function MawkibOwnerFilterSelect({
  value,
  onChange,
  className = filterInputClass,
  placeholder = 'همه موکب‌داران — جستجو با نام یا موبایل',
  allowClear = true,
}: MawkibOwnerFilterSelectProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const ownerId = value ? Number(value) : 0;

  const { data: selectedOwner } = useQuery({
    queryKey: ['mawkib-owner-filter', ownerId],
    queryFn: () => usersApi.getOne(ownerId),
    enabled: ownerId > 0,
  });

  const { data: owners = [], isLoading } = useQuery({
    queryKey: ['mawkib-owners-search-filter', search],
    queryFn: () => usersApi.searchMawkibOwners(search),
    enabled: open,
  });

  useEffect(() => {
    if (!open && selectedOwner && ownerId > 0) {
      setSearch(`${selectedOwner.fullName} — ${selectedOwner.mobileNumber}`);
    }
    if (!ownerId) {
      setSearch('');
    }
  }, [selectedOwner, ownerId, open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (selectedOwner && ownerId > 0) {
          setSearch(`${selectedOwner.fullName} — ${selectedOwner.mobileNumber}`);
        } else if (!ownerId) {
          setSearch('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOwner, ownerId]);

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
          {allowClear && (
            <button
              type="button"
              onClick={handleClear}
              className={`block w-full border-b border-slate-100 px-3 py-2 text-right text-sm hover:bg-slate-50 ${
                !value ? 'bg-[#f0f4fa] font-medium text-[#4a6fa5]' : 'text-slate-500'
              }`}
            >
              همه موکب‌داران
            </button>
          )}
          {isLoading ? (
            <p className="px-3 py-2 text-sm text-slate-400">در حال جستجو...</p>
          ) : owners.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-400">موکب‌داری یافت نشد</p>
          ) : (
            owners.map((owner) => (
              <button
                key={owner.id}
                type="button"
                onClick={() => {
                  onChange(String(owner.id));
                  setSearch(`${owner.fullName} — ${owner.mobileNumber}`);
                  setOpen(false);
                }}
                className={`block w-full px-3 py-2 text-right text-sm hover:bg-slate-50 ${
                  value === String(owner.id) ? 'bg-[#f0f4fa] text-[#3d5d8a]' : 'text-slate-700'
                }`}
              >
                <span className="font-medium">{owner.fullName}</span>
                <span className="mr-2 font-mono text-slate-500">{owner.mobileNumber}</span>
                {owner.city && (
                  <span className="mr-2 text-xs text-slate-400">({owner.city})</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
