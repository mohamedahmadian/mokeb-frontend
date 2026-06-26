import { companionMemberFullName } from './full-name';

export type CompanionGender = 'male' | 'female';

export interface CompanionMember {
  index: number;
  gender: CompanionGender;
  fullName: string;
}

export interface CompanionsFormState {
  v: 1;
  members: CompanionMember[];
  notes?: string;
}

export function genderLabel(gender: CompanionGender): string {
  return gender === 'male' ? 'آقا' : 'خانم';
}

export function buildCompanionMembers(
  maleCount: number,
  femaleCount: number,
  previous: Array<
    CompanionMember & { firstName?: string; lastName?: string }
  > = [],
): CompanionMember[] {
  const members: CompanionMember[] = [];
  let index = 1;

  const prevMales = previous.filter((m) => m.gender === 'male');
  const prevFemales = previous.filter((m) => m.gender === 'female');

  for (let m = 0; m < maleCount; m++) {
    const prev = prevMales[m];
    members.push({
      index,
      gender: 'male',
      fullName: prev ? companionMemberFullName(prev) : '',
    });
    index++;
  }

  for (let f = 0; f < femaleCount; f++) {
    const prev = prevFemales[f];
    members.push({
      index,
      gender: 'female',
      fullName: prev ? companionMemberFullName(prev) : '',
    });
    index++;
  }

  return members;
}

export function createEmptyCompanionsForm(
  maleCount: number,
  femaleCount: number,
): CompanionsFormState {
  return {
    v: 1,
    members: buildCompanionMembers(maleCount, femaleCount),
    notes: '',
  };
}

export function hasCompanionsContent(state: CompanionsFormState): boolean {
  if (state.notes?.trim()) return true;
  return state.members.some((m) => m.fullName.trim().length > 0);
}

export function serializeCompanions(state: CompanionsFormState): string | undefined {
  if (!hasCompanionsContent(state)) return undefined;

  return JSON.stringify({
    v: 1,
    members: state.members.map((m) => ({
      index: m.index,
      gender: m.gender,
      fullName: m.fullName.trim(),
    })),
    notes: state.notes?.trim() || undefined,
  });
}

function normalizeCompanionMember(
  m: Record<string, unknown>,
): CompanionMember | null {
  if (typeof m !== 'object' || m === null || typeof m.index !== 'number') {
    return null;
  }
  if (m.gender !== 'male' && m.gender !== 'female') return null;

  const fullName =
    typeof m.fullName === 'string'
      ? m.fullName
      : companionMemberFullName({
          firstName: typeof m.firstName === 'string' ? m.firstName : '',
          lastName: typeof m.lastName === 'string' ? m.lastName : '',
        });

  return {
    index: m.index,
    gender: m.gender,
    fullName,
  };
}

export function parseCompanions(raw?: string | null): CompanionsFormState | null {
  if (!raw?.trim()) return null;

  const trimmed = raw.trim();
  if (!trimmed.startsWith('{')) return null;

  try {
    const parsed = JSON.parse(trimmed) as {
      v?: number;
      members?: unknown[];
      notes?: string;
    };
    if (parsed.v !== 1 || !Array.isArray(parsed.members)) return null;

    const members = parsed.members
      .map((m) =>
        normalizeCompanionMember(
          typeof m === 'object' && m !== null ? (m as Record<string, unknown>) : {},
        ),
      )
      .filter((m): m is CompanionMember => m !== null);

    if (members.length === 0 && !parsed.notes?.trim()) return null;

    return {
      v: 1,
      members,
      notes: typeof parsed.notes === 'string' ? parsed.notes : undefined,
    };
  } catch {
    return null;
  }
}

export function formatCompanionsLegacyText(state: CompanionsFormState): string {
  const lines = state.members.map((m) => {
    const name = m.fullName.trim();
    const namePart = name ? ` — ${name}` : '';
    return `${m.index.toLocaleString('fa-IR')}. ${genderLabel(m.gender)}${namePart}`;
  });

  if (state.notes?.trim()) {
    lines.push('', `توضیحات تکمیلی: ${state.notes.trim()}`);
  }

  return lines.join('\n');
}
