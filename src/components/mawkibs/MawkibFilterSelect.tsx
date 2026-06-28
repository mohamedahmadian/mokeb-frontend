import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mawkibsApi } from '../../lib/mawkibs';
import { filterInputClass } from '../../lib/styles';
import { SearchableSelect } from '../ui/SearchableSelect';

interface MawkibFilterSelectProps {
  value: string;
  onChange: (mawkibId: string) => void;
  className?: string;
  placeholder?: string;
  scope?: 'my' | 'admin';
}

export function MawkibFilterSelect({
  value,
  onChange,
  className = filterInputClass,
  placeholder = 'همه موکب‌ها',
  scope = 'my',
}: MawkibFilterSelectProps) {
  const { data: mawkibs = [], isLoading } = useQuery({
    queryKey: ['mawkibs-filter', scope],
    queryFn: () =>
      scope === 'admin' ? mawkibsApi.getAdminList() : mawkibsApi.getMyList(),
  });

  const options = useMemo(
    () =>
      mawkibs.map((mawkib) => ({
        value: String(mawkib.id),
        label: mawkib.name,
      })),
    [mawkibs],
  );

  return (
    <SearchableSelect
      value={value}
      onChange={onChange}
      options={options}
      placeholder={isLoading ? 'در حال بارگذاری...' : placeholder}
      searchPlaceholder="جستجوی موکب..."
      disabled={isLoading}
      className={className}
      emptyMessage="موکبی یافت نشد"
    />
  );
}
