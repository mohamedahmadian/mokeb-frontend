import {
  genderLabel,
  parseCompanions,
  type CompanionsFormState,
} from '../../lib/companions';

interface CompanionsDisplayProps {
  companions?: string | null;
  compact?: boolean;
}

function StructuredTable({ data, compact }: { data: CompanionsFormState; compact?: boolean }) {
  const cellClass = compact ? 'px-2.5 py-2' : 'px-3 py-2.5';

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[20rem] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-slate-600">
              <th className={`${cellClass} w-12 text-center font-medium`}>شماره</th>
              <th className={`${cellClass} w-20 text-center font-medium`}>جنسیت</th>
              <th className={`${cellClass} text-right font-medium`}>نام و نام خانوادگی</th>
            </tr>
          </thead>
          <tbody>
            {data.members.map((member) => (
              <tr key={member.index} className="border-b border-slate-50 last:border-0">
                <td className={`${cellClass} text-center font-mono text-slate-500`}>
                  {member.index.toLocaleString('fa-IR')}
                </td>
                <td className={`${cellClass} text-center text-slate-700`}>
                  {genderLabel(member.gender)}
                </td>
                <td className={`${cellClass} text-slate-800`}>
                  {member.fullName.trim() ? (
                    member.fullName.trim()
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            {data.notes?.trim() && (
              <tr className="bg-amber-50/50">
                <td className={`${cellClass} text-center text-slate-400`}>—</td>
                <td className={`${cellClass} text-center text-xs font-medium text-amber-800`}>
                  توضیحات
                </td>
                <td className={`${cellClass} whitespace-pre-wrap text-slate-700`}>
                  {data.notes.trim()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CompanionsDisplay({ companions, compact }: CompanionsDisplayProps) {
  if (!companions?.trim()) return null;

  const structured = parseCompanions(companions);

  if (structured) {
    return <StructuredTable data={structured} compact={compact} />;
  }

  return (
    <p className="whitespace-pre-wrap font-normal leading-relaxed text-slate-700">
      {companions}
    </p>
  );
}
