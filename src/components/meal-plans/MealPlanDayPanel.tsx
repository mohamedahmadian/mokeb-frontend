import { useEffect, useMemo, useState } from 'react';
import { formatPersianDate } from '../ui/PersianDateInput';
import { mealPlansApi } from '../../lib/meal-plans';
import {
  MEAL_TYPES,
  MEAL_TYPE_LABELS,
  plansToRows,
  type MealPlanRow,
} from '../../lib/meal-plan-utils';
import { toast, toastApiError } from '../../lib/toast';
import type { MealPlan, MealType, Reservation } from '../../types';
import { MealPlanMealCell } from './MealPlanMealCell';

interface MealPlanDayPanelProps {
  reservation: Reservation;
  plans: MealPlan[];
  date: string;
  onPlansUpdated: (plans: MealPlan[]) => void;
}

function rowForDate(plans: MealPlan[], date: string): MealPlanRow {
  const rows = plansToRows(plans);
  const existing = rows.find((row) => row.date === date);
  if (existing) return existing;

  return {
    date,
    Breakfast: { isRequired: false, isServed: false },
    Lunch: { isRequired: false, isServed: false },
    Dinner: { isRequired: false, isServed: false },
  };
}

export function MealPlanDayPanel({
  reservation,
  plans,
  date,
  onPlansUpdated,
}: MealPlanDayPanelProps) {
  const sourceRow = useMemo(() => rowForDate(plans, date), [plans, date]);
  const [row, setRow] = useState<MealPlanRow>(sourceRow);
  const [togglingMealType, setTogglingMealType] = useState<MealType | null>(null);
  const [servingId, setServingId] = useState<number | null>(null);

  const syncedKey = useMemo(
    () =>
      MEAL_TYPES.map(
        (mealType) =>
          `${sourceRow[mealType].id ?? 'new'}:${sourceRow[mealType].isRequired}:${sourceRow[mealType].isServed}:${sourceRow[mealType].servedAt ?? ''}`,
      ).join('|'),
    [sourceRow],
  );

  useEffect(() => {
    setRow(sourceRow);
  }, [syncedKey, reservation.id, date]);

  const handleToggle = async (mealType: MealType, checked: boolean) => {
    setTogglingMealType(mealType);
    setRow((prev) => ({
      ...prev,
      [mealType]: { ...prev[mealType], isRequired: checked },
    }));

    try {
      const updated = await mealPlansApi.upsertEntry(reservation.id, {
        date,
        mealType,
        isRequired: checked,
      });
      onPlansUpdated(updated);
    } catch (err) {
      setRow(sourceRow);
      toastApiError(err, 'خطا در به‌روزرسانی برنامه غذایی');
    } finally {
      setTogglingMealType(null);
    }
  };

  const handleServe = async (mealPlanId: number) => {
    setServingId(mealPlanId);
    try {
      await mealPlansApi.serve(mealPlanId);
      const updated = await mealPlansApi.getByReservation(reservation.id);
      onPlansUpdated(updated);
      toast.success('وعده غذایی تحویل داده شد');
    } catch (err) {
      toastApiError(err, 'خطا در ثبت تحویل');
    } finally {
      setServingId(null);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-3 py-3 text-right">تاریخ</th>
            {MEAL_TYPES.map((mealType) => (
              <th key={mealType} className="px-3 py-3 text-center">
                {MEAL_TYPE_LABELS[mealType]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-slate-100">
            <td className="px-3 py-3 align-top">
              <p className="text-sm font-medium text-slate-800">{formatPersianDate(date)}</p>
              <p className="mt-1 text-[11px] text-slate-500" dir="ltr">
                {date}
              </p>
            </td>
            {MEAL_TYPES.map((mealType) => (
              <td key={mealType} className="px-3 py-2 align-top">
                <MealPlanMealCell
                  mealType={mealType}
                  cell={row[mealType]}
                  onToggle={(checked) => void handleToggle(mealType, checked)}
                  onServe={() => row[mealType].id && void handleServe(row[mealType].id!)}
                  toggling={togglingMealType === mealType}
                  serving={servingId === row[mealType].id}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
