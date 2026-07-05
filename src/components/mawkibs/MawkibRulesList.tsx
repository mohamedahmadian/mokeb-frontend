import { parseMawkibRulesLines } from '../../lib/mawkib-rules-print';

function RuleCheckIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

interface MawkibRulesListProps {
  rules?: string | null;
  className?: string;
}

export function MawkibRulesList({ rules, className = '' }: MawkibRulesListProps) {
  const items = parseMawkibRulesLines(rules);

  if (items.length === 0) return null;

  return (
    <ul className={`space-y-2.5 py-1 ${className}`}>
      {items.map((rule, index) => (
        <li
          key={`${index}-${rule}`}
          className="flex items-start gap-3 rounded-xl border border-[#dce6f2] bg-gradient-to-l from-[#f8fafc] via-white to-[#f0f4fa]/40 px-3.5 py-3 shadow-sm shadow-slate-200/40"
        >
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5] ring-1 ring-[#c5d4e8]/60">
            <RuleCheckIcon />
          </span>
          <span className="min-w-0 flex-1 pt-0.5 text-sm leading-7 text-slate-700">{rule}</span>
        </li>
      ))}
    </ul>
  );
}
