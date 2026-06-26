import type {
  CompanionsFormState,
  CompanionMember,
} from "../../lib/companions";
import { genderLabel } from "../../lib/companions";
import { reservationFormInputClass } from "./reservation-form-ui";

interface CompanionsTableProps {
  value: CompanionsFormState;
  onChange: (value: CompanionsFormState) => void;
  inputClassName?: string;
}

function GenderBadge({ gender }: { gender: CompanionMember["gender"] }) {
  const isMale = gender === "male";
  return (
    <span
      className={`inline-flex min-w-[3.25rem] items-center justify-center rounded-lg px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
        isMale
          ? "bg-[#e8eef6] text-[#3d5d8a] ring-[#c5d4e8]"
          : "bg-rose-50 text-rose-700 ring-rose-100"
      }`}
    >
      {genderLabel(gender)}
    </span>
  );
}

export function CompanionsTable({
  value,
  onChange,
  inputClassName = reservationFormInputClass,
}: CompanionsTableProps) {
  const updateMember = (index: number, patch: Partial<CompanionMember>) => {
    onChange({
      ...value,
      members: value.members.map((m) =>
        m.index === index ? { ...m, ...patch } : m,
      ),
    });
  };

  const updateNotes = (notes: string) => {
    onChange({ ...value, notes });
  };

  if (value.members.length === 0) {
    return (
      <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        ابتدا تعداد آقایان یا خانم‌ها را مشخص کنید.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[24rem] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-600">
              <th className="w-14 px-3 py-3 text-center font-medium">شماره</th>
              <th className="w-24 px-3 py-3 text-center font-medium">جنسیت</th>
              <th className="px-3 py-3 text-right font-medium">
                نام و نام خانوادگی
              </th>
            </tr>
          </thead>
          <tbody>
            {value.members.map((member) => (
              <tr key={member.index} className="border-b border-slate-50">
                <td className="px-3 py-2.5 text-center font-mono text-slate-500">
                  {member.index.toLocaleString("fa-IR")}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <GenderBadge gender={member.gender} />
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="text"
                    value={member.fullName}
                    onChange={(e) =>
                      updateMember(member.index, { fullName: e.target.value })
                    }
                    className={`${inputClassName} !py-2 text-sm`}
                    placeholder=""
                  />
                </td>
              </tr>
            ))}
            <tr className="bg-amber-50/40">
              <td className="px-3 py-3 text-center text-slate-400">—</td>
              <td className="px-3 py-3 text-center">
                <span className="text-xs font-medium text-amber-800">
                  توضیحات
                </span>
              </td>
              <td className="px-3 py-3">
                <textarea
                  value={value.notes ?? ""}
                  onChange={(e) => updateNotes(e.target.value)}
                  rows={2}
                  className={`${inputClassName} resize-none text-sm`}
                  placeholder="مثلاً مشخصات نوزاد، نسبت، نیاز ویژه و..."
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="border-t border-slate-100 px-4 py-2.5 text-xs leading-relaxed text-slate-400">
        تعداد سطرها بر اساس مجموع آقایان و خانم‌ها تنظیم شده است. سطر آخر برای
        توضیحات تکمیلی (مثل نوزاد) اختیاری است.
      </p>
    </div>
  );
}
