import { useEffect, useState } from 'react';
import { Modal } from '../Modal';
import { ProvinceCitySelect } from '../ui/ProvinceCitySelect';
import {
  UserSocialFields,
  emptyUserSocialFields,
  userSocialFieldsToPayload,
} from './UserSocialFields';
import { getApiErrorMessage } from '../../lib/constants';
import { btnPrimary, btnSecondary, inputClass } from '../../lib/styles';
import type { CreateQuickPilgrimPayload } from '../../lib/users';

interface PilgrimFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateQuickPilgrimPayload) => Promise<void>;
}

const emptyForm = {
  firstName: '',
  lastName: '',
  mobileNumber: '',
  password: '',
  description: '',
  province: '',
  city: '',
  social: emptyUserSocialFields(),
};

export function PilgrimFormModal({ open, onClose, onSubmit }: PilgrimFormModalProps) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm);
    setError('');
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const password = form.password.trim();
      if (password && password.length < 4) {
        setError('رمز عبور باید حداقل ۴ کاراکتر باشد');
        setLoading(false);
        return;
      }

      await onSubmit({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        password: password || undefined,
        description: form.description.trim() || undefined,
        province: form.province.trim() || undefined,
        city: form.city.trim() || undefined,
        ...userSocialFieldsToPayload(form.social),
      });
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'خطا در ثبت زائر'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="افزودن زائر" size="lg">
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">نام *</span>
            <input
              type="text"
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">نام خانوادگی *</span>
            <input
              type="text"
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className={inputClass}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">شماره موبایل *</span>
          <input
            type="text"
            required
            value={form.mobileNumber}
            onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
            className={inputClass}
            placeholder="09121234567"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">رمز عبور (اختیاری)</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
            placeholder="در صورت خالی بودن: ۴ رقم آخر موبایل"
            minLength={4}
          />
        </label>

        <ProvinceCitySelect
          province={form.province}
          city={form.city}
          onProvinceChange={(province) => setForm((prev) => ({ ...prev, province, city: '' }))}
          onCityChange={(city) => setForm((prev) => ({ ...prev, city }))}
        />

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">توضیحات</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className={inputClass}
          />
        </label>

        <UserSocialFields
          values={form.social}
          onChange={(social) => setForm((prev) => ({ ...prev, social }))}
        />

        <p className="text-xs text-slate-400">
          اگر موبایل تکراری باشد، همان کاربر برگردانده می‌شود.
        </p>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={loading} className={btnSecondary}>
            انصراف
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`${btnPrimary} w-full sm:w-auto disabled:opacity-50`}
          >
            {loading ? 'در حال ذخیره...' : 'افزودن زائر'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
