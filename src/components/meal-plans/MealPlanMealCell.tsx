import { MEAL_TYPE_LABELS } from '../../lib/meal-plan-utils';
import { formatTimeFromIso } from '../../lib/format-time';
import type { MealPlanCell } from '../../lib/meal-plan-utils';
import type { MealType } from '../../types';
import { NavIcon } from '../ui/NavIcons';
import { mealPlanIconClass, mealPlanPrimaryBtn } from './meal-plans-ui';

interface MealPlanMealCellProps {
  mealType: MealType;
  cell: MealPlanCell;
  onToggle: (checked: boolean) => void;
  onServe: () => void;
  toggling?: boolean;
  serving?: boolean;
}

export function MealPlanMealCell({
  mealType,
  cell,
  onToggle,
  onServe,
  toggling = false,
  serving = false,
}: MealPlanMealCellProps) {
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
          onClick={onServe}
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
