import { useEffect, useRef, useState } from 'react';
import { MEAL_TYPE_LABELS } from '../../lib/meal-plan-utils';
import { formatTimeFromIso } from '../../lib/format-time';
import type { MealPlanCell } from '../../lib/meal-plan-utils';
import type { MealType } from '../../types';
import { NavIcon } from '../ui/NavIcons';
import { GuestCountInput, parseGuestCountInput } from './GuestCountInput';
import { mealPlanIconClass, mealPlanPrimaryBtn } from './meal-plans-ui';
import { toast } from '../../lib/toast';

interface MealPlanMealCellProps {
  mealType: MealType;
  cell: MealPlanCell;
  onToggle: (checked: boolean) => void;
  onGuestCountChange: (guestCount: number) => void;
  onServe: (guestCount: number) => void;
  toggling?: boolean;
  serving?: boolean;
}

export function MealPlanMealCell({
  mealType,
  cell,
  onToggle,
  onGuestCountChange,
  onServe,
  toggling = false,
  serving = false,
}: MealPlanMealCellProps) {
  const countDisabled = !cell.isRequired || cell.isServed || toggling || serving;
  const [countText, setCountText] = useState(String(cell.guestCount));
  const skipBlurCommitRef = useRef(false);

  useEffect(() => {
    setCountText(String(cell.guestCount));
  }, [cell.guestCount, cell.isServed]);

  const commitGuestCount = () => {
    if (skipBlurCommitRef.current) {
      skipBlurCommitRef.current = false;
      return;
    }

    const parsed = parseGuestCountInput(countText);
    if (parsed == null) {
      setCountText(String(cell.guestCount));
      return;
    }
    if (parsed !== cell.guestCount) {
      onGuestCountChange(parsed);
    }
  };

  const handleServe = () => {
    skipBlurCommitRef.current = true;
    const parsed = parseGuestCountInput(countText);
    if (parsed == null) {
      toast.error('تعداد نفرات باید حداقل ۱ باشد');
      return;
    }
    onServe(parsed);
  };

  return (
    <div className="flex min-w-[7.5rem] flex-col items-center gap-2 py-1">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={cell.isRequired}
          disabled={cell.isServed || toggling}
          onChange={(e) => onToggle(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-[#4a6fa5] focus:ring-[#4a6fa5] disabled:cursor-not-allowed disabled:opacity-60"
        />
        <span className="text-xs font-medium">{MEAL_TYPE_LABELS[mealType]}</span>
      </label>

      {cell.isRequired ? (
        <GuestCountInput
          value={cell.guestCount}
          textValue={countText}
          disabled={countDisabled}
          served={cell.isServed}
          onChange={setCountText}
          onBlur={commitGuestCount}
        />
      ) : null}

      {cell.isServed ? (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 ring-1 ring-emerald-200">
          تحویل داده شده
          {cell.servedAt && (
            <span className="mr-1 font-normal text-emerald-700" dir="ltr">
              · {formatTimeFromIso(cell.servedAt)}
            </span>
          )}
        </span>
      ) : cell.isRequired && cell.id ? (
        <button
          type="button"
          onMouseDown={() => {
            skipBlurCommitRef.current = true;
          }}
          onClick={handleServe}
          disabled={serving}
          className={mealPlanPrimaryBtn}
        >
          <NavIcon name="check" className={mealPlanIconClass} strokeWidth={1.75} />
          {serving ? '...' : 'تحویل'}
        </button>
      ) : null}
    </div>
  );
}
