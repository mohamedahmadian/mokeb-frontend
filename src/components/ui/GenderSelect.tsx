import { USER_GENDER_OPTIONS } from '../../lib/user-gender';
import { guestTheme } from '../../lib/guest-theme';
import { filterInputClass } from '../../lib/styles';
import type { UserGender } from '../../types';

interface GenderSelectProps {
  value: UserGender | '';
  onChange: (value: UserGender | '') => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  variant?: 'guest' | 'panel';
  id?: string;
}

export function GenderSelect({
  value,
  onChange,
  required = false,
  disabled = false,
  className = '',
  variant = 'panel',
  id,
}: GenderSelectProps) {
  const inputClass = variant === 'guest' ? guestTheme.input : filterInputClass;

  return (
    <select
      id={id}
      required={required}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value as UserGender | '')}
      className={`${inputClass} ${className}`}
    >
      <option value="">{required ? 'انتخاب جنسیت *' : 'انتخاب جنسیت'}</option>
      {USER_GENDER_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
