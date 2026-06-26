import { useEffect, useState } from 'react';
import { Modal } from '../Modal';
import { NavIcon } from '../ui/NavIcons';
import { ROLE_OPTIONS } from '../../lib/constants';
import {
  emptyUserSocialFields,
  userSocialFieldsFromUser,
  userSocialFieldsToPayload,
  type UserSocialFormValues,
} from './UserSocialFields';
import {
  FormSection,
  RoleBadge,
  RoleHero,
  roleNavIcon,
} from './user-form-ui';
import { UserFormSections } from './UserFormSections';
import type { AdminUser, RoleName } from '../../types';
import type {
  CreateQuickPilgrimPayload,
  CreateUserPayload,
  UpdateUserPayload,
} from '../../lib/users';
import { btnPrimary, btnSecondary } from '../../lib/styles';
import { toast } from '../../lib/toast';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    payload: CreateUserPayload | UpdateUserPayload | CreateQuickPilgrimPayload,
  ) => Promise<void>;
  user?: AdminUser | null;
  fixedRole?: RoleName;
  title?: string;
  hideRoles?: boolean;
  /** ثبت سریع زائر: نام/نام‌خانوادگی جدا، رمز اختیاری، API مخصوص */
  quickPilgrim?: boolean;
}

interface FormState {
  fullName: string;
  firstName: string;
  lastName: string;
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
  firstName: '',
  lastName: '',
  mobileNumber: '',
  password: '',
  province: '',
  city: '',
  description: '',
  social: emptyUserSocialFields(),
  isActive: true,
  roles: ['Pilgrim'],
};

const roleLabels: Record<RoleName, string> = {
  Admin: 'مدیر',
  Pilgrim: 'زائر',
  MawkibOwner: 'موکب‌دار',
  HonoraryServant: 'خادم افتخاری',
};

function resolveTitle(isEdit: boolean, fixedRole?: RoleName, customTitle?: string) {
  if (customTitle) return customTitle;
  const prefix = isEdit ? 'ویرایش' : 'افزودن';
  if (fixedRole === 'MawkibOwner') return `${prefix} موکب‌دار`;
  if (fixedRole === 'Pilgrim') return `${prefix} زائر`;
  if (fixedRole === 'HonoraryServant') return `${prefix} خادم`;
  if (fixedRole === 'Admin') return `${prefix} مدیر`;
  return isEdit ? 'ویرایش کاربر' : 'افزودن کاربر';
}

export function UserFormModal({
  open,
  onClose,
  onSubmit,
  user,
  fixedRole,
  title,
  hideRoles = false,
  quickPilgrim = false,
}: UserFormModalProps) {
  const isEdit = !!user;
  const isQuickCreate = quickPilgrim && !isEdit;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);

  const modalTitle = resolveTitle(isEdit, fixedRole, title);

  useEffect(() => {
    if (!open) return;

    if (user) {
      const nameParts = user.fullName.trim().split(/\s+/);
      setForm({
        fullName: user.fullName,
        firstName: nameParts[0] ?? '',
        lastName: nameParts.slice(1).join(' '),
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
        if (form.password) {
          if (form.password.length < 4) {
            toast.error('رمز عبور باید حداقل ۴ کاراکتر باشد');
            setLoading(false);
            return;
          }
          payload.password = form.password;
        }
        await onSubmit(payload);
      } else if (isQuickCreate) {
        const password = form.password.trim();
        if (password && password.length < 4) {
          toast.error('رمز عبور باید حداقل ۴ کاراکتر باشد');
          setLoading(false);
          return;
        }
        await onSubmit({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          mobileNumber: form.mobileNumber.trim(),
          password: password || undefined,
          province: form.province || undefined,
          city: form.city || undefined,
          description: form.description || undefined,
          ...userSocialFieldsToPayload(form.social),
        });
      } else {
        if (!form.password || form.password.length < 4) {
          toast.error('رمز عبور باید حداقل ۴ کاراکتر باشد');
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
      toast.error(
        err instanceof Error ? err.message : 'خطا در ذخیره اطلاعات کاربر',
      );
    } finally {
      setLoading(false);
    }
  };

  const submitLabel = isEdit
    ? 'ذخیره تغییرات'
    : fixedRole
      ? `افزودن ${roleLabels[fixedRole]}`
      : 'افزودن کاربر';

  return (
    <Modal open={open} onClose={onClose} title={modalTitle} size="lg">
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        {fixedRole && (
          <RoleHero
            role={fixedRole}
            title={roleLabels[fixedRole]}
            subtitle={
              isEdit
                ? 'ویرایش اطلاعات حساب کاربری'
                : isQuickCreate
                  ? 'ثبت سریع — در صورت تکراری بودن موبایل، همان کاربر انتخاب می‌شود'
                  : 'ثبت حساب جدید در سامانه'
            }
          />
        )}

        <UserFormSections
          values={form}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          nameMode={isQuickCreate ? 'splitName' : 'fullName'}
          mobileDisabled={isEdit}
          passwordRequired={!isEdit && !isQuickCreate}
          passwordPlaceholder={
            isQuickCreate ? 'در صورت خالی بودن: ۴ رقم آخر موبایل' : undefined
          }
          passwordHint={
            isEdit
              ? 'در صورت خالی بودن، رمز تغییر نمی‌کند'
              : isQuickCreate
                ? 'اختیاری — در صورت خالی بودن، ۴ رقم آخر موبایل'
                : 'حداقل ۴ کاراکتر'
          }
          extraFields="inline"
          descriptionLabel="درباره کاربر"
        />

        {!fixedRole && !hideRoles && (
          <FormSection
            title="نقش‌ها"
            icon={<NavIcon name="dashboard" className="h-4 w-4" />}
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {ROLE_OPTIONS.map((role) => (
                <RoleBadge
                  key={role.value}
                  label={role.label}
                  icon={roleNavIcon(role.value)}
                  selected={form.roles.includes(role.value)}
                  onToggle={() => toggleRole(role.value)}
                />
              ))}
            </div>
          </FormSection>
        )}

        {isEdit && !hideRoles && (
          <FormSection
            title="وضعیت حساب"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-[#4a6fa5] focus:ring-[#4a6fa5]"
              />
              <div>
                <p className="text-sm font-medium text-slate-800">کاربر فعال است</p>
                <p className="text-xs text-slate-500">
                  کاربر غیرفعال نمی‌تواند وارد سامانه شود
                </p>
              </div>
            </label>
          </FormSection>
        )}

        {isQuickCreate && (
          <p className="flex items-start gap-2 rounded-xl border border-[#c5d4e8]/50 bg-[#f0f4fa]/60 px-3.5 py-2.5 text-xs text-slate-500">
            <NavIcon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-[#4a6fa5]" />
            اگر شماره موبایل قبلاً ثبت شده باشد، همان کاربر بدون ایجاد حساب جدید برگردانده می‌شود.
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
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
            {loading ? 'در حال ذخیره...' : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
