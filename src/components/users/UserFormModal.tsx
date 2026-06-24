import { useEffect, useState } from 'react';
import { Modal } from '../Modal';
import { ProvinceCitySelect } from '../ui/ProvinceCitySelect';
import { ROLE_OPTIONS } from '../../lib/constants';
import {
  UserSocialFields,
  emptyUserSocialFields,
  userSocialFieldsFromUser,
  userSocialFieldsToPayload,
  type UserSocialFormValues,
} from './UserSocialFields';
import type { AdminUser, RoleName } from '../../types';
import type { CreateUserPayload, UpdateUserPayload } from '../../lib/users';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateUserPayload | UpdateUserPayload) => Promise<void>;
  user?: AdminUser | null;
  fixedRole?: RoleName;
  title?: string;
  hideRoles?: boolean;
}

interface FormState {
  fullName: string;
  mobileNumber: string;
  password: string;
  province: string;
  city: string;
  description: string;
  social: UserSocialFormValues;
  isActive: boolean;
  roles: RoleName[];
}

const emptyForm: FormState = {
  fullName: '',
  mobileNumber: '',
  password: '',
  province: '',
  city: '',
  description: '',
  social: emptyUserSocialFields(),
  isActive: true,
  roles: ['Pilgrim'],
};

export function UserFormModal({
  open,
  onClose,
  onSubmit,
  user,
  fixedRole,
  title,
  hideRoles = false,
}: UserFormModalProps) {
  const isEdit = !!user;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (user) {
      setForm({
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        password: '',
        province: user.province ?? '',
        city: user.city ?? '',
        description: user.description ?? '',
        social: userSocialFieldsFromUser(user),
        isActive: user.isActive,
        roles: user.roles.map((r) => r.role.name),
      });
    } else {
      setForm({
        ...emptyForm,
        roles: fixedRole ? [fixedRole] : emptyForm.roles,
      });
    }
    setError('');
  }, [open, user, fixedRole]);

  const toggleRole = (role: RoleName) => {
    setForm((prev) => {
      const exists = prev.roles.includes(role);
      if (exists) {
        if (prev.roles.length === 1) return prev;
        return { ...prev, roles: prev.roles.filter((r) => r !== role) };
      }
      return { ...prev, roles: [...prev.roles, role] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        const payload: UpdateUserPayload = {
          fullName: form.fullName,
          province: form.province || undefined,
          city: form.city || undefined,
          description: form.description || undefined,
          ...userSocialFieldsToPayload(form.social),
        };
        if (!hideRoles) {
          payload.isActive = form.isActive;
          payload.roles = fixedRole ? [fixedRole] : form.roles;
        }
        if (form.password) payload.password = form.password;
        await onSubmit(payload);
      } else {
        if (!form.password || form.password.length < 6) {
          setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
          setLoading(false);
          return;
        }
        await onSubmit({
          fullName: form.fullName,
          mobileNumber: form.mobileNumber,
          password: form.password,
          province: form.province || undefined,
          city: form.city || undefined,
          description: form.description || undefined,
          ...userSocialFieldsToPayload(form.social),
          roles: fixedRole ? [fixedRole] : form.roles,
        });
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'خطا در ذخیره اطلاعات کاربر',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        title ??
        (isEdit
          ? fixedRole === 'MawkibOwner'
            ? 'ویرایش موکب‌دار'
            : fixedRole === 'Pilgrim'
              ? 'ویرایش زائر'
              : 'ویرایش کاربر'
          : fixedRole === 'MawkibOwner'
            ? 'افزودن موکب‌دار'
            : fixedRole === 'Pilgrim'
              ? 'افزودن زائر'
              : 'افزودن کاربر')
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">نام کامل *</span>
          <input
            type="text"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">شماره موبایل *</span>
          <input
            type="text"
            required
            disabled={isEdit}
            value={form.mobileNumber}
            onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
            placeholder="09121234567"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">
            {isEdit ? 'رمز عبور جدید (اختیاری)' : 'رمز عبور *'}
          </span>
          <input
            type="password"
            required={!isEdit}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            minLength={isEdit ? undefined : 6}
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <UserSocialFields
          values={form.social}
          onChange={(social) => setForm((prev) => ({ ...prev, social }))}
        />

        {!fixedRole && !hideRoles && (
          <fieldset>
            <legend className="mb-2 text-sm text-slate-600">نقش‌ها *</legend>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((role) => (
                <label
                  key={role.value}
                  className={`cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    form.roles.includes(role.value)
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.roles.includes(role.value)}
                    onChange={() => toggleRole(role.value)}
                  />
                  {role.label}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {isEdit && !hideRoles && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-600">کاربر فعال است</span>
          </label>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50 sm:w-auto w-full"
          >
            {loading ? 'در حال ذخیره...' : isEdit ? 'ذخیره تغییرات' : 'افزودن کاربر'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
