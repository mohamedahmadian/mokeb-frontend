import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '../Modal';
import { MAWKIB_STATUS_OPTIONS } from '../../lib/constants';
import { usersApi } from '../../lib/users';
import { PersianDateInput } from '../ui/PersianDateInput';
import {
  MawkibExtraFields,
  emptyMawkibExtraFields,
  mawkibExtraFieldsFromMawkib,
  mawkibExtraFieldsToPayload,
  type MawkibExtraFormValues,
} from './MawkibExtraFields';
import type { Mawkib, MawkibStatus } from '../../types';
import type { CreateMawkibPayload, UpdateMawkibPayload } from '../../lib/mawkibs';
import { btnPrimary, inputClass as formInputClass } from '../../lib/styles';

interface MawkibFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateMawkibPayload | UpdateMawkibPayload) => Promise<void>;
  mawkib?: Mawkib | null;
  isAdmin: boolean;
  currentUserId?: number;
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
  extra: MawkibExtraFormValues;
}

const emptyForm: FormState = {
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  phoneNumber: '',
  description: '',
  facilities: '',
  services: '',
  serviceStartDate: '',
  serviceEndDate: '',
  maleCapacity: '',
  femaleCapacity: '',
  imageUrl: '',
  ownerUserId: '',
  status: 'Approved',
  extra: emptyMawkibExtraFields(),
};

function toDateInput(value?: string | null) {
  if (!value) return '';
  return value.slice(0, 10);
}

export function MawkibFormModal({
  open,
  onClose,
  onSubmit,
  mawkib,
  isAdmin,
  currentUserId,
}: MawkibFormModalProps) {
  const isEdit = !!mawkib;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: ownerOptions = [] } = useQuery({
    queryKey: ['mawkib-owners'],
    queryFn: () => usersApi.getMawkibOwners(),
    enabled: open && isAdmin,
  });

  useEffect(() => {
    if (!open) return;

    if (mawkib) {
      setForm({
        name: mawkib.name,
        address: mawkib.address,
        latitude: mawkib.latitude?.toString() ?? '',
        longitude: mawkib.longitude?.toString() ?? '',
        phoneNumber: mawkib.phoneNumber,
        description: mawkib.description ?? '',
        facilities: mawkib.facilities ?? '',
        services: mawkib.services ?? '',
        serviceStartDate: toDateInput(mawkib.serviceStartDate),
        serviceEndDate: toDateInput(mawkib.serviceEndDate),
        maleCapacity: mawkib.maleCapacity.toString(),
        femaleCapacity: mawkib.femaleCapacity.toString(),
        imageUrl: mawkib.imageUrl ?? '',
        ownerUserId: (mawkib.ownerUserId ?? mawkib.owner?.id ?? '').toString(),
        status: mawkib.status,
        extra: mawkibExtraFieldsFromMawkib(mawkib),
      });
    } else {
      setForm({
        ...emptyForm,
        ownerUserId: !isAdmin && currentUserId ? currentUserId.toString() : '',
      });
    }
    setError('');
  }, [open, mawkib, isAdmin, currentUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const maleCapacity = parseInt(form.maleCapacity, 10);
      const femaleCapacity = parseInt(form.femaleCapacity, 10);
      if (Number.isNaN(maleCapacity) || maleCapacity < 0) {
        setError('ظرفیت آقایان باید عدد معتبر باشد');
        setLoading(false);
        return;
      }
      if (Number.isNaN(femaleCapacity) || femaleCapacity < 0) {
        setError('ظرفیت خانم‌ها باید عدد معتبر باشد');
        setLoading(false);
        return;
      }
      if (maleCapacity + femaleCapacity < 1) {
        setError('مجموع ظرفیت آقایان و خانم‌ها باید حداقل ۱ باشد');
        setLoading(false);
        return;
      }

      const maxDays = form.extra.maxReservationDays.trim()
        ? parseInt(form.extra.maxReservationDays, 10)
        : undefined;
      if (form.extra.maxReservationDays.trim() && (!maxDays || maxDays < 1)) {
        setError('حداکثر بازه رزرو باید عددی بزرگ‌تر از صفر باشد');
        setLoading(false);
        return;
      }

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
        ...mawkibExtraFieldsToPayload(form.extra),
      };

      if (isEdit) {
        const payload: UpdateMawkibPayload = { ...base };
        if (isAdmin) {
          payload.ownerUserId = parseInt(form.ownerUserId, 10);
          payload.status = form.status;
        }
        await onSubmit(payload);
      } else {
        if (!form.ownerUserId) {
          setError('مسئول موکب را انتخاب کنید');
          setLoading(false);
          return;
        }
        await onSubmit({
          ...base,
          ownerUserId: parseInt(form.ownerUserId, 10),
          status: isAdmin ? form.status : 'Pending',
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره موکب');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = formInputClass;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'ویرایش موکب' : 'افزودن موکب'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">نام موکب *</span>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </label>

        {isAdmin && (
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">مسئول موکب *</span>
            <select
              required
              value={form.ownerUserId}
              onChange={(e) => setForm({ ...form, ownerUserId: e.target.value })}
              className={inputClass}
              disabled={isEdit && !isAdmin}
            >
              <option value="">انتخاب کنید</option>
              {ownerOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} — {u.mobileNumber}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">شماره تماس *</span>
          <input
            type="text"
            required
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">آدرس *</span>
          <textarea
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={2}
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">عرض جغرافیایی</span>
            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">طول جغرافیایی</span>
            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              className={inputClass}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">لینک تصویر</span>
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className={inputClass}
            placeholder="https://..."
          />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">ظرفیت آقایان *</span>
            <input
              type="number"
              required
              min={0}
              value={form.maleCapacity}
              onChange={(e) => setForm({ ...form, maleCapacity: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">ظرفیت خانم‌ها *</span>
            <input
              type="number"
              required
              min={0}
              value={form.femaleCapacity}
              onChange={(e) => setForm({ ...form, femaleCapacity: e.target.value })}
              className={inputClass}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PersianDateInput
            label="شروع خدمات"
            value={form.serviceStartDate}
            onChange={(serviceStartDate) => setForm({ ...form, serviceStartDate })}
          />
          <PersianDateInput
            label="پایان خدمات"
            value={form.serviceEndDate}
            onChange={(serviceEndDate) => setForm({ ...form, serviceEndDate })}
          />
        </div>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">توضیحات</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">امکانات</span>
          <textarea
            value={form.facilities}
            onChange={(e) => setForm({ ...form, facilities: e.target.value })}
            rows={2}
            className={inputClass}
            placeholder="اسکان، پارکینگ، حمام..."
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">خدمات</span>
          <textarea
            value={form.services}
            onChange={(e) => setForm({ ...form, services: e.target.value })}
            rows={2}
            className={inputClass}
            placeholder="غذا، درمانگاه..."
          />
        </label>

        <MawkibExtraFields
          values={form.extra}
          onChange={(extra) => setForm((prev) => ({ ...prev, extra }))}
        />

        {isAdmin && (
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">وضعیت</span>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as MawkibStatus })
              }
              className={inputClass}
            >
              {MAWKIB_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`${btnPrimary} disabled:opacity-50`}
          >
            {loading ? 'در حال ذخیره...' : isEdit ? 'ذخیره تغییرات' : 'افزودن موکب'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
