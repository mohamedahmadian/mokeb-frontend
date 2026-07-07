import { useEffect, useRef, useState } from "react";
import { Modal } from "../Modal";
import { NavIcon } from "../ui/NavIcons";
import { ROLE_OPTIONS, getApiErrorMessage } from "../../lib/constants";
import {
  emptyUserSocialFields,
  userSocialFieldsFromUser,
  userSocialFieldsToPayload,
  type UserSocialFormValues,
} from "./UserSocialFields";
import { FormSection, RoleBadge, RoleHero, roleNavIcon } from "./user-form-ui";
import { UserFormSections, type MobileCheckStatus } from "./UserFormSections";
import { NationalIdCardUpload } from "../ui/NationalIdCardUpload";
import { ProfileImageUpload } from "../ui/ProfileImageUpload";
import { PilgrimLatestCardActions } from "./PilgrimLatestCardActions";
import type { AdminUser, RoleName, UserGender } from "../../types";
import type {
  CreateQuickPilgrimPayload,
  CreateUserPayload,
  UpdateUserPayload,
} from "../../lib/users";
import { usersApi } from "../../lib/users";
import { authApi } from "../../lib/auth";
import { splitFullName } from "../../lib/full-name";
import { useRoleAccess } from "../../hooks/useRoleAccess";
import { btnPrimary, btnSecondary } from "../../lib/styles";
import { toast } from "../../lib/toast";
import { formatPersianDateTimeFromIso } from "../ui/PersianDateInput";

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
  /** ثبت سریع زائر: API مخصوص */
  quickPilgrim?: boolean;
  /** محدود کردن چاپ زائر کارت به موکب‌های موکب‌دار */
  pilgrimCardOwnerScope?: boolean;
}

interface FormState {
  fullName: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  nationalId: string;
  gender: UserGender | "";
  birthDate: string;
  country: string;
  passportNumber: string;
  password: string;
  province: string;
  city: string;
  description: string;
  social: UserSocialFormValues;
  isActive: boolean;
  roles: RoleName[];
}

const emptyForm: FormState = {
  fullName: "",
  firstName: "",
  lastName: "",
  mobileNumber: "",
  nationalId: "",
  gender: "",
  birthDate: "",
  country: "",
  passportNumber: "",
  password: "",
  province: "",
  city: "",
  description: "",
  social: emptyUserSocialFields(),
  isActive: true,
  roles: ["Pilgrim"],
};

const roleLabels: Record<RoleName, string> = {
  Admin: "مدیر",
  Pilgrim: "زائر",
  MawkibOwner: "موکب‌دار",
  HonoraryServant: "خادم افتخاری",
};

function resolveTitle(
  isEdit: boolean,
  fixedRole?: RoleName,
  customTitle?: string,
) {
  if (customTitle) return customTitle;
  const prefix = isEdit ? "ویرایش" : "افزودن";
  if (fixedRole === "MawkibOwner") return `${prefix} موکب‌دار`;
  if (fixedRole === "Pilgrim") return `${prefix} زائر`;
  if (fixedRole === "HonoraryServant") return `${prefix} خادم`;
  if (fixedRole === "Admin") return `${prefix} مدیر`;
  return isEdit ? "ویرایش کاربر" : "افزودن کاربر";
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
  pilgrimCardOwnerScope = false,
}: UserFormModalProps) {
  const isEdit = !!user;
  const { isAdmin } = useRoleAccess();
  const isQuickCreate = quickPilgrim && !isEdit;
  const isMawkibOwnerCreate = fixedRole === "MawkibOwner" && !isEdit;
  const showNationalIdCardUpload =
    hideRoles ||
    fixedRole === "Pilgrim" ||
    (isEdit && (user?.roles.some((r) => r.role.name === "Pilgrim") ?? false));
  const [form, setForm] = useState<FormState>(emptyForm);
  const showBirthDate =
    hideRoles ||
    fixedRole === "Pilgrim" ||
    isQuickCreate ||
    (isEdit && (user?.roles.some((r) => r.role.name === "Pilgrim") ?? false)) ||
    (!fixedRole && form.roles.includes("Pilgrim"));
  const showGender =
    hideRoles ||
    fixedRole === "Pilgrim" ||
    fixedRole === "MawkibOwner" ||
    (isEdit &&
      (user?.roles.some(
        (r) => r.role.name === "Pilgrim" || r.role.name === "MawkibOwner",
      ) ??
        false)) ||
    (!fixedRole &&
      (form.roles.includes("Pilgrim") || form.roles.includes("MawkibOwner")));
  const [nationalIdCardImageUrl, setNationalIdCardImageUrl] = useState<
    string | null
  >(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [mobileCheckStatus, setMobileCheckStatus] =
    useState<MobileCheckStatus>("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const mobileCheckRequestId = useRef(0);

  const modalTitle = resolveTitle(isEdit, fixedRole, title);

  useEffect(() => {
    if (!open) return;

    if (user) {
      const nameParts = user.fullName.trim().split(/\s+/);
      setForm({
        fullName: user.fullName,
        firstName: nameParts[0] ?? "",
        lastName: nameParts.slice(1).join(" "),
        mobileNumber: user.mobileNumber,
        nationalId: user.nationalId ?? "",
        gender: user.gender ?? "",
        birthDate: user.birthDate?.slice(0, 10) ?? "",
        country: user.country ?? "",
        passportNumber: user.passportNumber ?? "",
        password: "",
        province: user.province ?? "",
        city: user.city ?? "",
        description: user.description ?? "",
        social: userSocialFieldsFromUser(user),
        isActive: user.isActive,
        roles: user.roles.map((r) => r.role.name),
      });
      setNationalIdCardImageUrl(user.nationalIdCardImageUrl ?? null);
      setImageUrl(user.imageUrl ?? null);
    } else {
      setForm({
        ...emptyForm,
        roles: fixedRole ? [fixedRole] : emptyForm.roles,
      });
      setNationalIdCardImageUrl(null);
      setImageUrl(null);
    }
    setMobileCheckStatus("idle");
    setSubmitError("");
  }, [open, user, fixedRole]);

  const checkMobileDuplicate = async (mobile: string) => {
    const trimmed = mobile.trim();
    const digits = trimmed.replace(/\D/g, "");
    if (digits.length < 10) {
      setMobileCheckStatus("idle");
      return;
    }

    setMobileCheckStatus("checking");
    const requestId = ++mobileCheckRequestId.current;
    try {
      const result = await authApi.isMobileRegistered(trimmed);
      if (requestId !== mobileCheckRequestId.current) return;
      setMobileCheckStatus(result.registered ? "duplicate" : "available");
    } catch {
      if (requestId === mobileCheckRequestId.current) {
        setMobileCheckStatus("idle");
      }
    }
  };

  const handleMobileBlur = (mobile: string) => {
    if (!isMawkibOwnerCreate) return;
    void checkMobileDuplicate(mobile);
  };

  useEffect(() => {
    if (!open || !isQuickCreate) return;

    const mobile = form.mobileNumber.trim();
    const digits = mobile.replace(/\D/g, "");
    if (digits.length < 10) {
      setMobileCheckStatus("idle");
      return;
    }

    setMobileCheckStatus("checking");
    const requestId = ++mobileCheckRequestId.current;
    const timer = setTimeout(async () => {
      try {
        const users = await usersApi.getAll({ mobileNumber: mobile });
        if (requestId !== mobileCheckRequestId.current) return;
        const exists = users.some((u) => u.mobileNumber.trim() === mobile);
        setMobileCheckStatus(exists ? "duplicate" : "available");
      } catch {
        if (requestId === mobileCheckRequestId.current) {
          setMobileCheckStatus("idle");
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [form.mobileNumber, open, isQuickCreate]);

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
    setSubmitError("");

    try {
      if (isEdit) {
        const payload: UpdateUserPayload = {
          fullName: form.fullName,
          nationalId: form.nationalId.trim(),
          province: form.province || undefined,
          city: form.city || undefined,
          description: form.description || undefined,
          ...userSocialFieldsToPayload(form.social),
        };
        if (showGender) {
          payload.gender = form.gender || null;
        }
        if (showBirthDate) {
          payload.birthDate = form.birthDate || null;
          payload.country = form.country || null;
          payload.passportNumber = form.passportNumber || null;
        }
        if (showNationalIdCardUpload) {
          payload.nationalIdCardImageUrl = nationalIdCardImageUrl;
        }
        if (hideRoles) {
          payload.imageUrl = imageUrl;
        }
        if (!hideRoles && isAdmin) {
          payload.isActive = form.isActive;
          payload.roles = fixedRole ? [fixedRole] : form.roles;
        }
        if (form.password) {
          if (form.password.length < 4) {
            toast.error("رمز عبور باید حداقل ۴ کاراکتر باشد");
            setLoading(false);
            return;
          }
          payload.password = form.password;
        }
        await onSubmit(payload);
      } else if (isQuickCreate) {
        const password = form.password.trim();
        if (password && password.length < 4) {
          toast.error("رمز عبور باید حداقل ۴ کاراکتر باشد");
          setLoading(false);
          return;
        }
        if (!form.fullName.trim()) {
          toast.error("نام و نام خانوادگی زائر را وارد کنید");
          setLoading(false);
          return;
        }
        if (mobileCheckStatus === "duplicate") {
          toast.error("این شماره تلفن همراه قبلا در سیستم ثبت نام شده است");
          setLoading(false);
          return;
        }
        const { firstName, lastName } = splitFullName(form.fullName);
        await onSubmit({
          firstName,
          lastName,
          mobileNumber: form.mobileNumber.trim(),
          nationalId: form.nationalId.trim() || undefined,
          gender: form.gender || undefined,
          birthDate: form.birthDate || undefined,
          country: form.country || undefined,
          passportNumber: form.passportNumber || undefined,
          ...(showNationalIdCardUpload
            ? { nationalIdCardImageUrl: nationalIdCardImageUrl ?? undefined }
            : {}),
          password: password || undefined,
          province: form.province || undefined,
          city: form.city || undefined,
          description: form.description || undefined,
          ...userSocialFieldsToPayload(form.social),
        });
      } else if (isMawkibOwnerCreate) {
        if (mobileCheckStatus === "duplicate") {
          setSubmitError("این شماره موبایل تکراری است");
          setLoading(false);
          return;
        }
        const fullName = form.fullName.trim();
        if (!fullName) {
          setSubmitError("نام و نام خانوادگی را وارد کنید");
          setLoading(false);
          return;
        }
        if (!form.password || form.password.length < 4) {
          setSubmitError("رمز عبور باید حداقل ۴ کاراکتر باشد");
          setLoading(false);
          return;
        }
        await onSubmit({
          fullName,
          mobileNumber: form.mobileNumber.trim(),
          nationalId: form.nationalId.trim() || undefined,
          gender: form.gender || undefined,
          password: form.password,
          province: form.province || undefined,
          city: form.city || undefined,
          description: form.description || undefined,
          ...userSocialFieldsToPayload(form.social),
          roles: ["MawkibOwner"],
        });
      } else {
        if (!form.password || form.password.length < 4) {
          toast.error("رمز عبور باید حداقل ۴ کاراکتر باشد");
          setLoading(false);
          return;
        }
        await onSubmit({
          fullName: form.fullName,
          mobileNumber: form.mobileNumber,
          nationalId: form.nationalId.trim() || undefined,
          ...(showGender ? { gender: form.gender || undefined } : {}),
          ...(showBirthDate
            ? {
                birthDate: form.birthDate || undefined,
                country: form.country || undefined,
                passportNumber: form.passportNumber || undefined,
              }
            : {}),
          ...(showNationalIdCardUpload
            ? { nationalIdCardImageUrl: nationalIdCardImageUrl ?? undefined }
            : {}),
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
      const message = getApiErrorMessage(err, "خطا در ذخیره اطلاعات کاربر");
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  const submitLabel = isEdit
    ? "ذخیره تغییرات"
    : fixedRole
      ? `افزودن ${roleLabels[fixedRole]}`
      : "افزودن کاربر";

  const passwordPlaceholder = isQuickCreate
    ? form.mobileNumber.replace(/\D/g, "").slice(-4) || undefined
    : undefined;

  return (
    <Modal open={open} onClose={onClose} title={modalTitle} size="lg">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
      >
        {fixedRole && (
          <RoleHero
            role={fixedRole}
            title={roleLabels[fixedRole]}
            subtitle={
              isEdit
                ? "ویرایش اطلاعات حساب کاربری"
                : isQuickCreate
                  ? undefined
                  : "ثبت حساب جدید در سامانه"
            }
          />
        )}

        {hideRoles && isEdit && user && (
          <ProfileImageUpload
            fullName={form.fullName || user.fullName}
            value={imageUrl}
            onChange={setImageUrl}
            disabled={loading}
          />
        )}

        <UserFormSections
          values={form}
          onChange={(patch) => {
            setSubmitError("");
            setForm((prev) => ({ ...prev, ...patch }));
            if (isMawkibOwnerCreate && "mobileNumber" in patch) {
              setMobileCheckStatus("idle");
            }
          }}
          nameMode="fullName"
          primaryLayout={
            isQuickCreate
              ? "quickPilgrim"
              : isMawkibOwnerCreate
                ? "mawkibOwner"
                : "default"
          }
          mobileDisabled={isEdit}
          mobileCheckStatus={
            isQuickCreate || isMawkibOwnerCreate ? mobileCheckStatus : undefined
          }
          onMobileBlur={isMawkibOwnerCreate ? handleMobileBlur : undefined}
          passwordRequired={!isEdit && !isQuickCreate}
          passwordPlaceholder={passwordPlaceholder}
          passwordHint={
            isEdit
              ? "در صورت خالی بودن، رمز تغییر نمی‌کند"
              : isQuickCreate
                ? undefined
                : isMawkibOwnerCreate
                  ? ""
                  : "حداقل ۴ کاراکتر"
          }
          hideOptionalLabels={isQuickCreate}
          onPasswordEnter={
            isQuickCreate ? () => formRef.current?.requestSubmit() : undefined
          }
          extraFields="inline"
          locationInPrimary={hideRoles}
          descriptionLabel="درباره کاربر"
          showGender={showGender && !isMawkibOwnerCreate}
          showBirthDate={showBirthDate}
        />

        {showNationalIdCardUpload && (
          <NationalIdCardUpload
            value={nationalIdCardImageUrl}
            onChange={setNationalIdCardImageUrl}
            disabled={loading}
          />
        )}

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
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          >
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[#4a6fa5] focus:ring-[#4a6fa5]"
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    کاربر فعال است
                  </p>
                  <p className="text-xs text-slate-500">
                    کاربر غیرفعال نمی‌تواند وارد سامانه شود
                  </p>
                </div>
              </label>

              {user?.createdAt && (
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3">
                  <p className="text-xs text-slate-500">تاریخ ثبت</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-800">
                    {formatPersianDateTimeFromIso(user.createdAt)}
                  </p>
                </div>
              )}
            </div>
          </FormSection>
        )}

        {submitError && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {submitError}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          {isEdit && fixedRole === "Pilgrim" && user && (
            <PilgrimLatestCardActions
              pilgrimUserId={user.id}
              ownerScope={pilgrimCardOwnerScope}
            />
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
            {loading ? "در حال ذخیره..." : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
