import type { Mawkib } from '../types';

export interface MawkibRulesPrintData {
  id: number;
  name: string;
  phoneNumber: string;
  ownerFullName: string;
  rules: string[];
}

export function parseMawkibRulesLines(rules?: string | null): string[] {
  if (!rules?.trim()) return [];

  return rules
    .split(/\r?\n/)
    .map((line) =>
      line
        .trim()
        .replace(/^[\u2022\-–—*•·]\s*/, '')
        .replace(/^\d+[.)]\s*/, '')
        .trim(),
    )
    .filter(Boolean);
}

export function mawkibToRulesPrintData(
  mawkib: Pick<Mawkib, 'id' | 'name' | 'phoneNumber' | 'owner' | 'rules'>,
  rulesOverride?: string | null,
): MawkibRulesPrintData {
  const rulesText = rulesOverride ?? mawkib.rules;

  return {
    id: mawkib.id,
    name: mawkib.name.trim(),
    phoneNumber: mawkib.phoneNumber?.trim() || '—',
    ownerFullName: mawkib.owner?.fullName?.trim() || '—',
    rules: parseMawkibRulesLines(rulesText),
  };
}

export function buildMawkibRulesPrintDataFromForm(
  mawkib: Mawkib,
  form: {
    name: string;
    phoneNumber: string;
    rules: string;
  },
): MawkibRulesPrintData {
  return {
    id: mawkib.id,
    name: form.name.trim() || mawkib.name,
    phoneNumber: form.phoneNumber.trim() || '—',
    ownerFullName: mawkib.owner?.fullName?.trim() || '—',
    rules: parseMawkibRulesLines(form.rules),
  };
}

export function hasMawkibRulesForPrint(data: MawkibRulesPrintData): boolean {
  return data.rules.length > 0;
}
