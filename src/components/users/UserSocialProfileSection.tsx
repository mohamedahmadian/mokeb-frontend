import { SOCIAL_FIELD_CONFIG } from './UserSocialFields';
import type { UserSocialFields } from '../../types';

interface UserSocialProfileSectionProps {
  user: Partial<UserSocialFields>;
}

export function UserSocialProfileSection({ user }: UserSocialProfileSectionProps) {
  const items = SOCIAL_FIELD_CONFIG.filter(({ key }) => user[key]?.trim());

  if (items.length === 0) return null;

  return (
    <div className="border-t border-slate-100 pt-3">
      <p className="mb-2 text-sm text-slate-500">شبکه‌های اجتماعی</p>
      <div className="space-y-2">
        {items.map(({ key, label }) => (
          <div key={key}>
            <p className="text-xs text-slate-400">{label}</p>
            <p
              className={`text-slate-800 ${key === 'email' ? 'font-mono text-sm' : ''}`}
              dir={key === 'email' ? 'ltr' : undefined}
            >
              {user[key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
