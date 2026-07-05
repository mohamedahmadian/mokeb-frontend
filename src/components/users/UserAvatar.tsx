import { useState } from 'react';
import { resolveAssetUrl } from '../../lib/geo';

export const USER_DEFAULT_AVATAR = '/images/user-default.svg';

interface UserAvatarProps {
  fullName: string;
  imageUrl?: string | null;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  xs: 'h-8 w-8',
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-20 w-20',
} as const;

export function UserAvatar({
  fullName,
  imageUrl,
  className = '',
  size = 'md',
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const trimmedUrl = imageUrl?.trim();
  const resolvedUrl = trimmedUrl ? resolveAssetUrl(trimmedUrl) : '';
  const src = resolvedUrl && !failed ? resolvedUrl : USER_DEFAULT_AVATAR;
  const sizeClass = sizeClasses[size];

  return (
    <img
      src={src}
      alt={fullName}
      className={`${sizeClass} shrink-0 rounded-full object-cover bg-[#e8eef6] shadow-md shadow-slate-300/50 ring-2 ring-white ${className}`}
      onError={() => setFailed(true)}
    />
  );
}

export function UserNameWithAvatar({
  fullName,
  imageUrl,
  subtitle,
  avatarSize = 'sm',
  className = '',
}: {
  fullName: string;
  imageUrl?: string | null;
  subtitle?: string;
  avatarSize?: UserAvatarProps['size'];
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      <UserAvatar fullName={fullName} imageUrl={imageUrl} size={avatarSize} />
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-800">{fullName}</p>
        {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}
