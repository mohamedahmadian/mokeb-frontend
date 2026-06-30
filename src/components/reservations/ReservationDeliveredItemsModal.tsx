import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import { formatPersianDateTimeFromIso } from "../ui/PersianDateInput";
import { RESERVATION_DELIVERED_ITEM_STATUS_LABELS } from "../../lib/constants";
import {
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputClass,
} from "../../lib/styles";
import { toast } from "../../lib/toast";
import type { ReservationDeliveredItem } from "../../types";

export interface DeliveredItemFormValues {
  itemName: string;
  quantity: number;
  description: string;
}

interface ReservationDeliveredItemFormProps {
  initialValues?: DeliveredItemFormValues;
  onSubmit: (values: DeliveredItemFormValues) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

const defaultValues: DeliveredItemFormValues = {
  itemName: "",
  quantity: 1,
  description: "",
};

export function ReservationDeliveredItemForm({
  initialValues,
  onSubmit,
  onCancel,
  isEdit = false,
}: ReservationDeliveredItemFormProps) {
  const [values, setValues] = useState<DeliveredItemFormValues>(
    initialValues ?? defaultValues,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValues(initialValues ?? defaultValues);
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemName = values.itemName.trim();
    if (!itemName) {
      toast.error("نام امانتی را وارد کنید");
      return;
    }
    if (values.quantity < 1) {
      toast.error("تعداد باید حداقل ۱ باشد");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...values,
        itemName,
        description: values.description.trim(),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در ذخیره");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4"
    >
      {!isEdit && (
        <p className="text-sm leading-relaxed text-slate-600">
          با ثبت امانتی، تحویل آن به زائر در سیستم ثبت می‌شود.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm text-slate-600">نام امانتی *</span>
          <input
            required
            value={values.itemName}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, itemName: e.target.value }))
            }
            maxLength={200}
            className={inputClass}
            placeholder="مثلاً پتو، بالش..."
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">تعداد *</span>
          <input
            required
            type="number"
            min={1}
            value={values.quantity}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                quantity: Math.max(1, Number(e.target.value) || 1),
              }))
            }
            className={inputClass}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm text-slate-600">توضیحات</span>
        <textarea
          value={values.description}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
          maxLength={1000}
          className={`${inputClass} resize-none`}
          placeholder="توضیحات تکمیلی..."
        />
      </label>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className={btnSecondary}>
          انصراف
        </button>
        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "ثبت امانتی"}
        </button>
      </div>
    </form>
  );
}

function itemToFormValues(
  item: ReservationDeliveredItem,
): DeliveredItemFormValues {
  return {
    itemName: item.itemName,
    quantity: item.quantity,
    description: item.description ?? "",
  };
}

function statusBadgeClass(status: ReservationDeliveredItem["status"]) {
  return status === "DeliveredToGuest"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-amber-100 text-amber-700";
}

interface ReservationDeliveredItemsModalProps {
  open: boolean;
  onClose: () => void;
  items: ReservationDeliveredItem[];
  canManage: boolean;
  onCreate: (values: DeliveredItemFormValues) => Promise<void>;
  onUpdate: (itemId: number, values: DeliveredItemFormValues) => Promise<void>;
  onReceive: (itemId: number) => Promise<void>;
  onRemove: (itemId: number) => Promise<void>;
}

export function ReservationDeliveredItemsModal({
  open,
  onClose,
  items,
  canManage,
  onCreate,
  onUpdate,
  onReceive,
  onRemove,
}: ReservationDeliveredItemsModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] =
    useState<ReservationDeliveredItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [receivingId, setReceivingId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setShowForm(false);
      setEditingItem(null);
      setDeletingId(null);
      setReceivingId(null);
    }
  }, [open]);

  const handleCreate = async (values: DeliveredItemFormValues) => {
    await onCreate(values);
    setShowForm(false);
  };

  const handleUpdate = async (values: DeliveredItemFormValues) => {
    if (!editingItem) return;
    await onUpdate(editingItem.id, values);
    setEditingItem(null);
  };

  const handleReceive = async (itemId: number) => {
    setReceivingId(itemId);
    try {
      await onReceive(itemId);
    } finally {
      setReceivingId(null);
    }
  };

  const handleRemove = async (itemId: number) => {
    setDeletingId(itemId);
    try {
      await onRemove(itemId);
    } finally {
      setDeletingId(null);
    }
  };

  const listLocked = showForm || !!editingItem;

  return (
    <Modal open={open} onClose={onClose} title="مدیریت امانات" size="xl">
      <div className="min-h-[min(62vh,28rem)] space-y-4">
        {canManage && !listLocked && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className={btnPrimary}
            >
              افزودن امانتی
            </button>
          </div>
        )}

        {showForm && (
          <ReservationDeliveredItemForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        )}

        {editingItem && (
          <ReservationDeliveredItemForm
            initialValues={itemToFormValues(editingItem)}
            onSubmit={handleUpdate}
            onCancel={() => setEditingItem(null)}
            isEdit
          />
        )}

        {items.length === 0 && !listLocked ? (
          <p className="py-6 text-center text-sm text-slate-500">
            {canManage
              ? "هنوز امانتی ثبت نشده است."
              : "امانتی تحویلی برای این رزرو ثبت نشده است."}
          </p>
        ) : items.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-right text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-2.5 font-medium">تاریخ تحویل امانتی</th>
                  <th className="px-3 py-2.5 font-medium">تاریخ دریافت امانتی</th>
                  <th className="px-3 py-2.5 font-medium">امانتی</th>
                  <th className="px-3 py-2.5 font-medium">تعداد</th>
                  <th className="px-3 py-2.5 font-medium">توضیحات</th>
                  <th className="px-3 py-2.5 font-medium">وضعیت</th>
                  {canManage && (
                    <th className="px-3 py-2.5 font-medium">عملیات</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {items.map((item) => {
                  const isDelivered = item.status === "DeliveredToGuest";
                  return (
                    <tr key={item.id} className="align-top">
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-600">
                        {formatPersianDateTimeFromIso(item.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-600">
                        {item.receivedAt ? (
                          formatPersianDateTimeFromIso(item.receivedAt)
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-800">
                        {item.itemName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                        {item.quantity.toLocaleString("fa-IR")}
                      </td>
                      <td className="max-w-[12rem] px-3 py-3 text-slate-600">
                        {item.description?.trim() ? (
                          <span className="line-clamp-3 whitespace-pre-wrap">
                            {item.description}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(item.status)}`}
                        >
                          {
                            RESERVATION_DELIVERED_ITEM_STATUS_LABELS[
                              item.status
                            ]
                          }
                        </span>
                      </td>
                      {canManage && (
                        <td className="px-3 py-3">
                          {!listLocked && (
                            <div className="flex min-w-[9rem] flex-col gap-1.5">
                              {isDelivered && (
                                <button
                                  type="button"
                                  onClick={() => handleReceive(item.id)}
                                  disabled={receivingId === item.id}
                                  className={`${btnPrimary} !min-h-8 !px-2.5 !py-1.5 !text-xs`}
                                >
                                  {receivingId === item.id
                                    ? "..."
                                    : "دریافت امانتی"}
                                </button>
                              )}
                              {isDelivered && (
                                <div className="flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingItem(item)}
                                    className={`${btnSecondary} !min-h-8 flex-1 !px-2 !py-1.5 !text-xs`}
                                  >
                                    ویرایش
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemove(item.id)}
                                    disabled={deletingId === item.id}
                                    className={`${btnDanger} !min-h-8 flex-1 !px-2 !py-1.5 !text-xs`}
                                  >
                                    {deletingId === item.id ? "..." : "حذف"}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
