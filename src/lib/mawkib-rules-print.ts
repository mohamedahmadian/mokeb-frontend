import type { Mawkib } from '../types';

export const DEFAULT_MAWKIB_RULES_LINES = [
  'لطفاً هنگام پذیرش، کارت شناسایی معتبر خود را همراه داشته باشید.',
  'از شما خواهشمندیم با رعایت شئونات اسلامی و احترام متقابل، فضایی آرام و صمیمی برای همه زائران فراهم کنید.',
  'برای حفظ سلامت و آسایش همه عزیزان، از استعمال دخانیات در فضای داخلی موکب خودداری فرمایید.',
  'لطفاً در حفظ نظافت محل اسکان کوشا باشید و هنگام خروج، فضا را در وضعیت مناسب تحویل دهید.',
  'برای حفظ امنیت، لطفاً از اموال شخصی خود مراقبت کنید. مسئولیت نگهداری از وسایل شخصی بر عهده زائر است.',
  'به‌منظور حفظ نظم و امنیت، پذیرش و اقامت فقط برای افراد ثبت‌شده در سامانه امکان‌پذیر است.',
  'برای آسایش سایر زائران، به‌ویژه در ساعات استراحت، از ایجاد سر و صدای غیرمتعارف خودداری فرمایید.',
  'اگر به هر دلیلی امکان سفر برای شما فراهم نشد، لطفاً رزرو خود را در اسرع وقت لغو کنید تا ظرفیت در اختیار سایر زائران قرار گیرد.',
  'هدف ما میزبانی شایسته از زائران گرامی است. در صورت رعایت نشدن قوانین موکب، ممکن است امکان ادامه اقامت یا پذیرش فراهم نباشد.',
] as const;

export const DEFAULT_MAWKIB_RULES = DEFAULT_MAWKIB_RULES_LINES.join('\n');

export interface MawkibRulesPrintData {
  id: number;
  name: string;
  phoneNumber: string;
  ownerFullName: string;
  rules: string[];
}

function normalizeMawkibRuleLine(line: string): string {
  return line
    .trim()
    .replace(/^[\u2022\-–—*•·]\s*/, '')
    .replace(/^\d+[.)]\s*/, '')
    .trim();
}

export function parseMawkibRulesLines(rules?: string | null): string[] {
  if (!rules?.trim()) return [];

  return rules
    .split(/\r?\n/)
    .map(normalizeMawkibRuleLine)
    .filter(Boolean);
}

/** Split stored rules into editable rows (always at least one row in forms). */
export function mawkibRulesToEditorItems(rules?: string | null): string[] {
  if (rules === undefined || rules === null || rules === '') return [''];

  const lines = rules.split(/\r?\n/).map(normalizeMawkibRuleLine);
  return lines.length > 0 ? lines : [''];
}

/** Join editor rows back into the stored rules string. */
export function serializeMawkibRules(lines: string[]): string {
  return lines.join('\n');
}

/** Clean rules for API payload and public display. */
export function normalizeMawkibRulesText(rules?: string | null): string | undefined {
  const cleaned = parseMawkibRulesLines(rules).join('\n');
  return cleaned || undefined;
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
