export function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: '', lastName: '' };
  }
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ') || firstName;
  return { firstName, lastName };
}

export function companionMemberFullName(member: {
  fullName?: string;
  firstName?: string;
  lastName?: string;
}): string {
  if (member.fullName?.trim()) return member.fullName.trim();
  return [member.firstName, member.lastName].filter(Boolean).join(' ').trim();
}
