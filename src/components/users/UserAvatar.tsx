import { useState } from 'react';

export const USER_DEFAULT_AVATAR = '/images/user-default.svg';

interface UserAvatarProps {
  fullName: string;
  imageUrl?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8',
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
  const src = trimmedUrl && !failed ? trimmedUrl : USER_DEFAULT_AVATAR;
  const sizeClass = sizeClasses[size];

  return (
    <img
      src={src}
      alt={fullName}
      className={`${sizeClass} shrink-0 rounded-full object-cover bg-[#e8eef6] ring-2 ring-[#c5d4e8] ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
