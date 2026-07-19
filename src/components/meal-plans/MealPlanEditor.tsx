import { useEffect, useMemo, useState } from 'react';
import { PersianDateInput, formatPersianDate } from '../ui/PersianDateInput';
import { mealPlansApi } from '../../lib/meal-plans';
import {
  MEAL_TYPES,
  MEAL_TYPE_LABELS,
  emptyMealPlanRow,
  plansToRows,
  rowsToSaveEntries,
  type MealPlanRow,
} from '../../lib/meal-plan-utils';
import { addGregorianDays } from '../../lib/date-range';
import { inputClass } from '../../lib/styles';
import { toast, toastApiError } from '../../lib/toast';
import type { MealPlan, MealType, Reservation } from '../../types';
import { NavIcon } from '../ui/NavIcons';
import {
  mealPlanDangerBtn,
  mealPlanIconClass,
  mealPlanSecondaryBtn,
} from './meal-plans-ui';
import { MealPlanMealCell } from './MealPlanMealCell';

interface MealPlanEditorProps {
  reservation: Reservation;
  plans: MealPlan[];
  onPlansUpdated: (plans: MealPlan[]) => void;
}

export function MealPlanEditor({
  reservation,
  plans,
  onPlansUpdated,
}: MealPlanEditorProps) {
  const [rows, setRows] = useState<MealPlanRow[]>(() => plansToRows(plans));
  const [saving, setSaving] = useState(false);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [servingId, setServingId] = useState<number | null>(null);

  const defaultGuestCount = Math.max(
    1,
    reservation.maleGuestCount + reservation.femaleGuestCount,
  );

  const syncedKey = useMemo(
    () =>
      plans
        .map((p) => `${p.id}:${p.isRequired}:${p.isServed}:${p.guestCount}`)
        .join('|'),
    [plans],
  );

  useEffect(() => {
    setRows(plansToRows(plans));
  }, [syncedKey, reservation.id]);

  const updateCell = (
    rowIndex: number,
    mealType: MealType,
    patch: Partial<MealPlanRow[MealType]>,
  ) => {
    setRows((prev) =>
      prev.map((row, index) =>
        index === rowIndex
          ? { ...row, [mealType]: { ...row[mealType], ...patch } }
          : row,
      ),
    );
  };

  const handleToggleRequired = async (
    rowIndex: number,
    mealType: MealType,
    checked: boolean,
  ) => {
    const row = rows[rowIndex];
    if (!row) return;

    const toggleKey = `${rowIndex}-${mealType}`;
    setTogglingKey(toggleKey);
    updateCell(rowIndex, mealType, { isRequired: checked });

    try {
      const updated = await mealPlansApi.upsertEntry(reservation.id, {
        date: row.date,
        mealType,
        isRequired: checked,
      });
      onPlansUpdated(updated);
    } catch (err) {
      setRows(plansToRows(plans));
      toastApiError(err, 'خطا در ذخیره برنامه غذایی');
    } finally {
      setTogglingKey(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await mealPlansApi.save(
        reservation.id,
        rowsToSaveEntries(rows),
      );
      onPlansUpdated(updated);
      toast.success('برنامه غذایی ذخیره شد');
    } catch (err) {
      toastApiError(err, 'خطا در ذخیره برنامه غذایی');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDay = () => {
    const lastDate =
      rows.length > 0
        ? rows[rows.length - 1].date
        : reservation.reservationDate.slice(0, 10);
    const nextDate = addGregorianDays(lastDate, 1);
    setRows((prev) => [...prev, emptyMealPlanRow(nextDate, defaultGuestCount)]);
  };

  const handleRemoveDay = (rowIndex: number) => {
    setRows((prev) => prev.filter((_, index) => index !== rowIndex));
  };

  const handleServe = async (mealPlanId: number, guestCount: number) => {
    setServingId(mealPlanId);
    try {
      await mealPlansApi.serve(mealPlanId, guestCount);
      const updated = await mealPlansApi.getByReservation(reservation.id);
      onPlansUpdated(updated);
      toast.success('وعده غذایی تحویل داده شد');
    } catch (err) {
      toastApiError(err, 'خطا در ثبت تحویل');
    } finally {
      setServingId(null);
    }
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500">
        برنامه غذایی ثبت نشده است. با دکمه «ایجاد برنامه غذایی» برای بازه اقامت
        رزرو، وعده‌ها را بسازید.
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
              <th className="px-3 py-3 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${row.date}-${rowIndex}`} className="border-t border-slate-100">
                <td className="px-3 py-3 align-top">
                  <PersianDateInput
                    compact
                    value={row.date}
                    onChange={(date) =>
                      setRows((prev) =>
                        prev.map((item, index) =>
                          index === rowIndex ? { ...item, date } : item,
                        ),
                      )
                    }
                    inputClassName={`${inputClass} !min-h-9 !py-1.5 !text-sm`}
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    {formatPersianDate(row.date)}
                  </p>
                </td>
                {MEAL_TYPES.map((mealType) => (
                  <td key={mealType} className="px-3 py-2 align-top">
                    <MealPlanMealCell
                      mealType={mealType}
                      cell={row[mealType]}
                      onToggle={(checked) =>
                        void handleToggleRequired(rowIndex, mealType, checked)
                      }
                      onGuestCountChange={(guestCount) =>
                        updateCell(rowIndex, mealType, { guestCount })
                      }
                      onServe={(guestCount) =>
                        row[mealType].id &&
                        handleServe(row[mealType].id!, guestCount)
                      }
                      toggling={togglingKey === `${rowIndex}-${mealType}`}
                      serving={servingId === row[mealType].id}
                    />
                  </td>
                ))}
                <td className="px-3 py-3 align-top text-center">
        <button
          type="button"
          onClick={() => handleRemoveDay(rowIndex)}
          className={mealPlanDangerBtn}
        >
          <NavIcon name="x" className={mealPlanIconClass} strokeWidth={1.75} />
          حذف روز
        </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={handleAddDay} className={mealPlanSecondaryBtn}>
          <NavIcon name="honoraryAdd" className={mealPlanIconClass} strokeWidth={1.75} />
          افزودن روز
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`${mealPlanSecondaryBtn} ms-auto`}
        >
          <NavIcon name="check" className={mealPlanIconClass} strokeWidth={1.75} />
          {saving ? 'در حال ذخیره...' : 'ذخیره برنامه غذایی'}
        </button>
      </div>
    </div>
  );
}
