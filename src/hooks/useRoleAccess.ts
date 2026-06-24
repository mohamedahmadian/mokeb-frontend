import { useAuth } from '../contexts/AuthContext';
import type { RoleName } from '../types';

export function useRoleAccess() {
  const { user } = useAuth();
  const roles = user?.roles ?? [];

  const hasRole = (role: RoleName) => roles.includes(role);

  return {
    user,
    isAdmin: hasRole('Admin'),
    isMawkibOwner: hasRole('MawkibOwner'),
    isPilgrim: hasRole('Pilgrim'),
    hasRole,
  };
}
