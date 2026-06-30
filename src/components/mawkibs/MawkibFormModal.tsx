import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import { MAWKIB_STATUS_OPTIONS } from "../../lib/constants";
import { PersianDateInput } from "../ui/PersianDateInput";
import { NavIcon } from "../ui/NavIcons";
import { MawkibOwnerFilterSelect } from "./MawkibOwnerFilterSelect";
import {
  MawkibExtraFields,
  emptyMawkibExtraFields,
  mawkibExtraFieldsFromMawkib,
  mawkibExtraFieldsToPayload,
  type MawkibExtraFormValues,
} from "./MawkibExtraFields";
import {
  IconClock,
  IconPhone,
  IconPhoto,
  MawkibFormHero,
} from "./mawkib-form-ui";
import { MawkibLocationMapTrigger } from "./MawkibLocationMapTrigger";
import { MawkibCardPrintButton } from "./MawkibCardPrintButton";
import { MawkibRulesPrintButton } from "./MawkibRulesPrintButton";
import { mawkibToCardData } from "../../lib/mawkib-card";
import { buildMawkibRulesPrintDataFromForm } from "../../lib/mawkib-rules-print";
import { FieldLabel, FormSection, MapPinIcon } from "../users/user-form-ui";
import type { Mawkib, MawkibStatus } from "../../types";
import type {
  CreateMawkibPayload,
  UpdateMawkibPayload,
} from "../../lib/mawkibs";
import {
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_CHECK_OUT_TIME,
} from "../../lib/format-time";
import {
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputClass as formInputClass,
} from "../../lib/styles";
import { toast } from "../../lib/toast";

interface MawkibFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (
    payload: CreateMawkibPayload | UpdateMawkibPayload,
  ) => Promise<void>;
  mawkib?: Mawkib | null;
  isAdmin: boolean;
  currentUserId?: number;
  readOnly?: boolean;
}

interface FormState {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  phoneNumber: string;
  description: string;
  facilities: string;
  services: string;
  serviceStartDate: string;
  serviceEndDate: string;
  maleCapacity: string;
  femaleCapacity: string;
  imageUrl: string;
  ownerUserId: string;
  status: MawkibStatus;
  defaultCheckInTime: string;
  defaultCheckOutTime: string;
  onlineReservationEnabled: boolean;
  extra: MawkibExtraFormValues;
}

const emptyForm: FormState = {
  name: "",
  address: "",
  latitude: "",
  longitude: "",
  phoneNumber: "",
  description: "",
  facilities: "",
  services: "",
  serviceStartDate: "",
  serviceEndDate: "",
  maleCapacity: "0",
  femaleCapacity: "0",
  imageUrl: "",
  ownerUserId: "",
  status: "Approved",
  defaultCheckInTime: DEFAULT_CHECK_IN_TIME,
  defaultCheckOutTime: DEFAULT_CHECK_OUT_TIME,
  onlineReservationEnabled: true,
  extra: emptyMawkibExtraFields(),
};

function toDateInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function MawkibFormModal({
  open,
  onClose,
  onSubmit,
  mawkib,
  isAdmin,
  currentUserId,
  readOnly = false,
}: MawkibFormModalProps) {
  const isEdit = !!mawkib;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(
    null,
  );

  const showPendingReviewActions =
    !readOnly && isAdmin && isEdit && form.status === "Pending";
  const fieldProps = readOnly ? { disabled: true, readOnly: true } : {};

  useEffect(() => {
    if (!open) return;

    if (mawkib) {
      setForm({
        name: mawkib.name,
        address: mawkib.address,
        latitude: mawkib.latitude?.toString() ?? "",
        longitude: mawkib.longitude?.toString() ?? "",
        phoneNumber: mawkib.phoneNumber,
        description: mawkib.description ?? "",
        facilities: mawkib.facilities ?? "",
        services: mawkib.services ?? "",
        serviceStartDate: toDateInput(mawkib.serviceStartDate),
        serviceEndDate: toDateInput(mawkib.serviceEndDate),
        maleCapacity: mawkib.maleCapacity.toString(),
        femaleCapacity: mawkib.femaleCapacity.toString(),
        imageUrl: mawkib.imageUrl ?? "",
        ownerUserId: (mawkib.ownerUserId ?? mawkib.owner?.id ?? "").toString(),
        status: mawkib.status,
        defaultCheckInTime: mawkib.defaultCheckInTime ?? DEFAULT_CHECK_IN_TIME,
        defaultCheckOutTime:
          mawkib.defaultCheckOutTime ?? DEFAULT_CHECK_OUT_TIME,
        onlineReservationEnabled: mawkib.onlineReservationEnabled !== false,
        extra: mawkibExtraFieldsFromMawkib(mawkib),
      });
    } else {
      setForm({
        ...emptyForm,
        ownerUserId: !isAdmin && currentUserId ? currentUserId.toString() : "",
      });
    }
  }, [open, mawkib, isAdmin, currentUserId]);

  const buildPayload = (
    statusOverride?: MawkibStatus,
  ): CreateMawkibPayload | UpdateMawkibPayload | null => {
    const maleCapacity = parseInt(form.maleCapacity, 10);
    const femaleCapacity = parseInt(form.femaleCapacity, 10);
    if (Number.isNaN(maleCapacity) || maleCapacity < 0) {
      toast.error("ظرفیت آقایان باید عدد معتبر باشد");
      return null;
    }
    if (Number.isNaN(femaleCapacity) || femaleCapacity < 0) {
      toast.error("ظرفیت بانوان باید عدد معتبر باشد");
      return null;
    }

    const maxDays = form.extra.maxReservationDays.trim()
      ? parseInt(form.extra.maxReservationDays, 10)
      : undefined;
    if (form.extra.maxReservationDays.trim() && (!maxDays || maxDays < 1)) {
      toast.error("حداکثر بازه رزرو باید عددی بزرگ‌تر از صفر باشد");
      return null;
    }

    const status = statusOverride ?? form.status;

    const base = {
      name: form.name,
      address: form.address,
      latitude: form.latitude ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      phoneNumber: form.phoneNumber,
      description: form.description || undefined,
      facilities: form.facilities || undefined,
      services: form.services || undefined,
      serviceStartDate: form.serviceStartDate || undefined,
      serviceEndDate: form.serviceEndDate || undefined,
      maleCapacity,
      femaleCapacity,
      imageUrl: form.imageUrl || undefined,
      defaultCheckInTime: form.defaultCheckInTime || DEFAULT_CHECK_IN_TIME,
      defaultCheckOutTime: form.defaultCheckOutTime || DEFAULT_CHECK_OUT_TIME,
      onlineReservationEnabled: form.onlineReservationEnabled,
      ...mawkibExtraFieldsToPayload(form.extra),
    };

    if (isEdit) {
      const payload: UpdateMawkibPayload = { ...base };
      if (isAdmin) {
        payload.ownerUserId = parseInt(form.ownerUserId, 10);
        payload.status = status;
      }
      return payload;
    }

    if (!form.ownerUserId) {
      toast.error("مسئول موکب را انتخاب کنید");
      return null;
    }

    return {
      ...base,
      ownerUserId: parseInt(form.ownerUserId, 10),
      status: isAdmin ? status : "Pending",
    };
  };

  const handleReview = async (action: "approve" | "reject") => {
    setReviewAction(action);
    setLoading(true);

    try {
      const payload = buildPayload(
        action === "approve" ? "Approved" : "Rejected",
      );
      if (!payload) return;
      await onSubmit?.(payload);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در بررسی موکب");
    } finally {
      setLoading(false);
      setReviewAction(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly || !onSubmit) return;
    setLoading(true);

    try {
      const payload = buildPayload();
      if (!payload) {
        setLoading(false);
        return;
      }
      await onSubmit?.(payload);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در ذخیره موکب");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = formInputClass;

  const modalTitle = readOnly
    ? "جزئیات موکب"
    : isEdit
      ? "ویرایش موکب"
      : "افزودن موکب";

  return (
    <Modal open={open} onClose={onClose} title={modalTitle} size="lg">
      <form
        onSubmit={handleSubmit}
        className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
      >
        {!readOnly && <MawkibFormHero isEdit={isEdit} />}

        {showPendingReviewActions && (
          <div className="overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-l from-amber-50 to-white px-4 py-3 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <NavIcon name="mawkibs" className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    این موکب در انتظار تایید است
                  </p>
                  <p className="text-xs text-amber-700">
                    پس از بررسی اطلاعات، موکب را تایید یا رد کنید.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
                <button
                  type="button"
                  onClick={() => void handleReview("approve")}
                  disabled={loading}
                  className={`${btnPrimary} w-full !min-h-9 !text-xs sm:w-auto`}
                >
                  {reviewAction === "approve"
                    ? "در حال تایید..."
                    : "تایید موکب"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleReview("reject")}
                  disabled={loading}
                  className={`${btnDanger} w-full !min-h-9 !text-xs sm:w-auto`}
                >
                  {reviewAction === "reject" ? "در حال رد..." : "رد موکب"}
                </button>
              </div>
            </div>
          </div>
        )}

        <FormSection
          title="اطلاعات اصلی"
          icon={<NavIcon name="mawkibs" className="h-4 w-4" />}
        >
          <label className="block">
            <FieldLabel label="نام موکب" required />
            <input
              type="text"
              required={!readOnly}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              {...fieldProps}
            />
          </label>

          {readOnly ? (
            <label className="block">
              <FieldLabel label="مسئول موکب" />
              <input
                type="text"
                value={mawkib?.owner?.fullName ?? "—"}
                className={inputClass}
                {...fieldProps}
              />
            </label>
          ) : (
            isAdmin && (
              <label className="block">
                <FieldLabel label="مسئول موکب" required />
                <MawkibOwnerFilterSelect
                  value={form.ownerUserId}
                  onChange={(ownerUserId) => setForm({ ...form, ownerUserId })}
                  className={inputClass}
                  allowClear={false}
                  placeholder="جستجو با نام یا موبایل موکب‌دار..."
                />
              </label>
            )
          )}

          <label className="block">
            <FieldLabel label="شماره تماس" required />
            <div className="relative">
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#4a6fa5]">
                <IconPhone />
              </span>
              <input
                type="text"
                required={!readOnly}
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value })
                }
                className={`${inputClass} pr-11`}
                {...fieldProps}
              />
            </div>
          </label>

          <label className="block">
            <FieldLabel label="لینک تصویر" hint="اختیاری" />
            <div className="relative">
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#4a6fa5]">
                <IconPhoto />
              </span>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className={`${inputClass} pr-11`}
                placeholder="https://..."
                dir="ltr"
                {...fieldProps}
              />
            </div>
          </label>
        </FormSection>

        <FormSection title="موقعیت" icon={<MapPinIcon />}>
          <label className="block">
            <FieldLabel label="آدرس" required />
            <textarea
              required={!readOnly}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={2}
              className={inputClass}
              {...fieldProps}
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <FieldLabel label="عرض جغرافیایی" hint="اختیاری" />
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                className={inputClass}
                dir="ltr"
                {...fieldProps}
              />
            </label>
            <label className="block">
              <FieldLabel label="طول جغرافیایی" hint="اختیاری" />
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) =>
                  setForm({ ...form, longitude: e.target.value })
                }
                className={inputClass}
                dir="ltr"
                {...fieldProps}
              />
            </label>
          </div>

          <div>
            <FieldLabel label="موقعیت روی نقشه" />
            {readOnly ? (
              <MawkibLocationMapTrigger
                latitude={
                  form.latitude && Number.isFinite(parseFloat(form.latitude))
                    ? parseFloat(form.latitude)
                    : null
                }
                longitude={
                  form.longitude && Number.isFinite(parseFloat(form.longitude))
                    ? parseFloat(form.longitude)
                    : null
                }
                mawkibName={form.name || undefined}
              />
            ) : isEdit ? (
              <MawkibLocationMapTrigger
                editable
                latitude={
                  form.latitude && Number.isFinite(parseFloat(form.latitude))
                    ? parseFloat(form.latitude)
                    : null
                }
                longitude={
                  form.longitude && Number.isFinite(parseFloat(form.longitude))
                    ? parseFloat(form.longitude)
                    : null
                }
                mawkibName={form.name || undefined}
                fallbackCountry={form.extra.country}
                fallbackCity={form.extra.mawkibCity}
                onPositionChange={(lat, lng) =>
                  setForm((prev) => ({
                    ...prev,
                    latitude: lat.toFixed(6),
                    longitude: lng.toFixed(6),
                  }))
                }
              />
            ) : (
              <MawkibLocationMapTrigger
                latitude={
                  form.latitude && Number.isFinite(parseFloat(form.latitude))
                    ? parseFloat(form.latitude)
                    : null
                }
                longitude={
                  form.longitude && Number.isFinite(parseFloat(form.longitude))
                    ? parseFloat(form.longitude)
                    : null
                }
                mawkibName={form.name || undefined}
              />
            )}
          </div>
        </FormSection>

        <FormSection
          title="ظرفیت"
          icon={<NavIcon name="users" className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <FieldLabel label="ظرفیت آقایان" required />
              <input
                type="number"
                required={!readOnly}
                min={0}
                value={form.maleCapacity}
                onChange={(e) =>
                  setForm({ ...form, maleCapacity: e.target.value })
                }
                className={inputClass}
                {...fieldProps}
              />
            </label>
            <label className="block">
              <FieldLabel label="ظرفیت بانوان" required />
              <input
                type="number"
                required={!readOnly}
                min={0}
                value={form.femaleCapacity}
                onChange={(e) =>
                  setForm({ ...form, femaleCapacity: e.target.value })
                }
                className={inputClass}
                {...fieldProps}
              />
            </label>
          </div>
        </FormSection>

        <FormSection
          title="زمان‌بندی خدمات"
          icon={<NavIcon name="reserve" className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PersianDateInput
              label="شروع خدمات"
              value={form.serviceStartDate}
              onChange={(serviceStartDate) =>
                setForm({ ...form, serviceStartDate })
              }
              disabled={readOnly}
              clearable={!readOnly}
            />
            <PersianDateInput
              label="پایان خدمات"
              value={form.serviceEndDate}
              onChange={(serviceEndDate) =>
                setForm({ ...form, serviceEndDate })
              }
              disabled={readOnly}
              clearable={!readOnly}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <FieldLabel
                label="ساعت ورود پیش‌فرض"
                hint="معمولاً ساعت تحویل اسکان (مثلاً ۱۴:۰۰)"
              />
              <div className="relative">
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#4a6fa5]">
                  <IconClock />
                </span>
                <input
                  type="time"
                  value={form.defaultCheckInTime}
                  onChange={(e) =>
                    setForm({ ...form, defaultCheckInTime: e.target.value })
                  }
                  className={`${inputClass} pr-11`}
                  {...fieldProps}
                />
              </div>
            </label>
            <label className="block">
              <FieldLabel
                label="ساعت خروج پیش‌فرض"
                hint="معمولاً ساعت تخلیه (مثلاً ۱۱:۰۰)"
              />
              <div className="relative">
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#4a6fa5]">
                  <IconClock />
                </span>
                <input
                  type="time"
                  value={form.defaultCheckOutTime}
                  onChange={(e) =>
                    setForm({ ...form, defaultCheckOutTime: e.target.value })
                  }
                  className={`${inputClass} pr-11`}
                  {...fieldProps}
                />
              </div>
            </label>
          </div>

          <label className="mt-1 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
            <input
              type="checkbox"
              checked={form.onlineReservationEnabled}
              onChange={(e) =>
                setForm({ ...form, onlineReservationEnabled: e.target.checked })
              }
              disabled={readOnly}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[#4a6fa5] focus:ring-[#4a6fa5]"
            />
            <span className="text-sm leading-relaxed text-slate-700">
              <span className="font-medium">امکان رزرو آنلاین</span>
              <span className="mt-1 block text-xs text-slate-500">
                در صورت غیرفعال بودن، زائران و مهمانان نمی‌توانند این موکب را
                به‌صورت آنلاین رزرو نمایند و عملیات رزرو صرفا ت وسط موکب دار
                محترم انجام خواهد شد
              </span>
            </span>
          </label>
        </FormSection>

        <FormSection
          title="توضیحات و خدمات"
          icon={<NavIcon name="book" className="h-4 w-4" />}
        >
          <label className="block">
            <FieldLabel label="توضیحات" hint="اختیاری" />
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
              className={inputClass}
              {...fieldProps}
            />
          </label>

          <label className="block">
            <FieldLabel
              label="امکانات"
              hint="اختیاری — اسکان، پارکینگ، حمام..."
            />
            <textarea
              value={form.facilities}
              onChange={(e) => setForm({ ...form, facilities: e.target.value })}
              rows={2}
              className={inputClass}
              placeholder="اسکان، پارکینگ، حمام..."
              {...fieldProps}
            />
          </label>

          <label className="block">
            <FieldLabel label="خدمات" hint="اختیاری — غذا، درمانگاه..." />
            <textarea
              value={form.services}
              onChange={(e) => setForm({ ...form, services: e.target.value })}
              rows={2}
              className={inputClass}
              placeholder="غذا، درمانگاه..."
              {...fieldProps}
            />
          </label>
        </FormSection>

        <MawkibExtraFields
          values={form.extra}
          onChange={(extra) => setForm((prev) => ({ ...prev, extra }))}
          readOnly={readOnly}
        />

        {isAdmin && (
          <FormSection
            title="وضعیت"
            icon={<NavIcon name="check" className="h-4 w-4" />}
          >
            <label className="block">
              <FieldLabel label="وضعیت تأیید موکب" />
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as MawkibStatus })
                }
                className={inputClass}
                disabled={readOnly}
              >
                {MAWKIB_STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </FormSection>
        )}

        {!readOnly && (
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            {isEdit && mawkib && (
              <div className="flex w-full flex-col gap-2 sm:mr-auto sm:w-auto sm:flex-row">
                <MawkibCardPrintButton
                  data={mawkibToCardData(mawkib)}
                  className={`${btnSecondary} w-full sm:w-auto`}
                />
                <MawkibRulesPrintButton
                  data={buildMawkibRulesPrintDataFromForm(mawkib, {
                    name: form.name,
                    phoneNumber: form.phoneNumber,
                    rules: form.extra.rules,
                  })}
                  className={`${btnSecondary} w-full border-[#c5d4e8] bg-[#f0f4fa] text-[#4a6fa5] hover:bg-[#e8eef6] sm:w-auto`}
                />
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={btnSecondary}
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`${btnPrimary} w-full sm:w-auto`}
            >
              {loading && !reviewAction
                ? "در حال ذخیره..."
                : isEdit
                  ? "ذخیره تغییرات"
                  : "افزودن موکب"}
            </button>
          </div>
        )}

        {isEdit && mawkib && readOnly && (
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`${btnSecondary} w-full sm:w-auto`}
            >
              بستن
            </button>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <MawkibCardPrintButton
                data={mawkibToCardData(mawkib)}
                className={`${btnPrimary} w-full sm:w-auto`}
              />
              <MawkibRulesPrintButton
                data={buildMawkibRulesPrintDataFromForm(mawkib, {
                  name: form.name,
                  phoneNumber: form.phoneNumber,
                  rules: form.extra.rules,
                })}
                className={`${btnSecondary} w-full border-[#c5d4e8] bg-[#f0f4fa] text-[#4a6fa5] hover:bg-[#e8eef6] sm:w-auto`}
              />
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
