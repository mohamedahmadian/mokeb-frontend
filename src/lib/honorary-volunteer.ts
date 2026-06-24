export const HONORARY_VOLUNTEER_SERVICE_OPTIONS = [
  { value: 'Transportation', label: 'حمل و نقل' },
  { value: 'Cleaning', label: 'نظافت و شست‌شو' },
  { value: 'Cooking', label: 'آشپزی' },
  { value: 'Servantship', label: 'خادم‌یاری' },
  { value: 'FoodSupply', label: 'تامین مواد غذایی' },
  { value: 'Other', label: 'سایر موارد' },
] as const;

export type HonoraryVolunteerServiceType =
  (typeof HONORARY_VOLUNTEER_SERVICE_OPTIONS)[number]['value'];

export function getServiceTypeLabel(value: string): string {
  return (
    HONORARY_VOLUNTEER_SERVICE_OPTIONS.find((o) => o.value === value)?.label ??
    value
  );
}
