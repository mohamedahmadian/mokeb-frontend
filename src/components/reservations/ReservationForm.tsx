import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ProvinceCitySelect } from "../ui/ProvinceCitySelect";
import { PersianDateInput } from "../ui/PersianDateInput";
import { formatPersianDate } from "../ui/PersianDateInput";
import { formatPersianNumber } from "../../lib/capacity";
import {
  isOnOrAfterServiceStart,
  isWithinMaxReservationDays,
} from "../../lib/date-range";
import { toast, toastApiError } from "../../lib/toast";
import { guestApi } from "../../lib/guest";
import { mawkibsApi } from "../../lib/mawkibs";
import { reservationsApi } from "../../lib/reservations";
import { usersApi, type PilgrimOption } from "../../lib/users";
import { useAuth } from "../../contexts/AuthContext";
import { guestTheme } from "../../lib/guest-theme";
import {
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_CHECK_OUT_TIME,
} from "../../lib/format-time";
import { btnSecondary } from "../../lib/styles";
import { PilgrimSearchSelect } from "./PilgrimSearchSelect";
import { PilgrimInfoCard } from "./PilgrimInfoCard";
import { CompanionsTable } from "./CompanionsTable";
import {
  buildCompanionMembers,
  createEmptyCompanionsForm,
  serializeCompanions,
  type CompanionsFormState,
} from "../../lib/companions";
import { splitFullName } from "../../lib/full-name";
import {
  isMawkibOnlineReservationEnabled,
  isRestrictedOnlineReserver,
} from "../../lib/mawkib-online-reservation";
import {
  GuestCountStepper,
  IconCalendar,
  IconChat,
  IconHome,
  IconUser,
  IconUsers,
  MawkibCard,
  SectionHeader,
  reservationFormInputClass,
  todayDateString,
} from "./reservation-form-ui";
import {
  hasMawkibRules,
  MawkibRulesAcceptanceModal,
} from "./MawkibRulesAcceptanceModal";

type PilgrimMode = "select" | "new";

export type ReservationFormSuccess =
  | {
      variant: "guest";
      message: string;
      mawkibName: string;
      reservationDate: string;
      reservationEndDate: string;
      maleGuestCount: number;
      femaleGuestCount: number;
      trackingCode: string;
      mobileNumber: string;
      loginPasswordHint: string;
      companions?: string;
    }
  | {
      variant: "panel";
      reservationId: number;
    };

export interface ReservationFormProps {
  variant: "guest" | "panel";
  initialMawkibId?: number | null;
  initialReservationDate?: string | null;
  initialPilgrimUserId?: number | null;
  onSuccess: (result: ReservationFormSuccess) => void;
  onCancel?: () => void;
  onSelectedMawkibChange?: (mawkib: { id: number; name: string } | null) => void;
}

function parseInitialMawkibId(value: number | null | undefined) {
  if (value == null) return null;
  return Number.isNaN(value) ? null : value;
}

function parseInitialReservationDate(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function mawkibMatchesNameQuery(name: string, query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;
  return name.includes(trimmed);
}

export function ReservationForm({
  variant,
  initialMawkibId,
  initialReservationDate,
  initialPilgrimUserId,
  onSuccess,
  onCancel,
  onSelectedMawkibChange,
}: ReservationFormProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isPanel = variant === "panel";
  const isAdmin = isPanel && (user?.roles.includes("Admin") ?? false);
  const isMawkibOwner =
    isPanel && (user?.roles.includes("MawkibOwner") ?? false);
  const isPilgrim =
    isPanel &&
    (user?.roles.includes("Pilgrim") ?? false) &&
    !isAdmin &&
    !isMawkibOwner;
  const canManagePilgrim = isPanel && !isPilgrim;

  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const today = todayDateString();
  const initialDate = parseInitialReservationDate(initialReservationDate) ?? today;
  const [dateStart, setDateStart] = useState(initialDate);
  const [dateEnd, setDateEnd] = useState(initialDate);
  const [maleGuestCount, setMaleGuestCount] = useState(1);
  const [femaleGuestCount, setFemaleGuestCount] = useState(0);
  const [selectedMawkibId, setSelectedMawkibId] = useState<number | null>(() =>
    parseInitialMawkibId(initialMawkibId ?? null),
  );
  const [companionsForm, setCompanionsForm] = useState<CompanionsFormState>(
    () => createEmptyCompanionsForm(1, 0),
  );
  const [description, setDescription] = useState("");
  const [plannedCheckInTime, setPlannedCheckInTime] = useState(
    DEFAULT_CHECK_IN_TIME,
  );
  const [plannedCheckOutTime, setPlannedCheckOutTime] = useState(
    DEFAULT_CHECK_OUT_TIME,
  );
  const [submitting, setSubmitting] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [skipCapacityCheck, setSkipCapacityCheck] = useState(false);
  const [mawkibSearchQuery, setMawkibSearchQuery] = useState("");

  const [pilgrimMode, setPilgrimMode] = useState<PilgrimMode>("select");
  const [selectedPilgrim, setSelectedPilgrim] = useState<PilgrimOption | null>(
    null,
  );

  useEffect(() => {
    if (initialMawkibId != null) {
      setSelectedMawkibId(parseInitialMawkibId(initialMawkibId));
    }
  }, [initialMawkibId]);

  useEffect(() => {
    const parsed = parseInitialReservationDate(initialReservationDate);
    if (!parsed) return;
    setDateStart(parsed);
    setDateEnd(parsed);
  }, [initialReservationDate]);

  useEffect(() => {
    setMawkibSearchQuery("");
  }, [dateStart, dateEnd, maleGuestCount, femaleGuestCount, skipCapacityCheck]);

  useEffect(() => {
    if (!initialPilgrimUserId || !canManagePilgrim) return;
    const pilgrimId = Number(initialPilgrimUserId);
    if (!pilgrimId) return;

    usersApi
      .getOne(pilgrimId)
      .then((pilgrimUser) => {
        setSelectedPilgrim({
          id: pilgrimUser.id,
          fullName: pilgrimUser.fullName,
          mobileNumber: pilgrimUser.mobileNumber,
          city: pilgrimUser.city,
        });
        setPilgrimMode("select");
      })
      .catch(() => {});
  }, [initialPilgrimUserId, canManagePilgrim]);

  useEffect(() => {
    if (initialPilgrimUserId || !isPilgrim || !user) return;
    setSelectedPilgrim({
      id: user.id,
      fullName: user.fullName,
      mobileNumber: user.mobileNumber,
    });
    setPilgrimMode("select");
  }, [initialPilgrimUserId, isPilgrim, user]);

  const canBypassCapacity = isPanel && (isAdmin || isMawkibOwner);
  const restrictedOnlineReserver = isRestrictedOnlineReserver(isPanel, user?.roles);

  const mawkibFilters =
    canBypassCapacity && skipCapacityCheck
      ? {
          reservationDateFrom: dateStart,
          reservationDateTo: dateEnd,
        }
      : {
          reservationDateFrom: dateStart,
          reservationDateTo: dateEnd,
          hasAvailability: true,
          minAvailableMaleCapacity: maleGuestCount,
          minAvailableFemaleCapacity: femaleGuestCount,
        };

  const mawkibQueryKey = isPanel
    ? isMawkibOwner
      ? "mawkibs-my-reservation-form"
      : isAdmin
        ? "mawkibs-public-reservation-form"
        : "mawkibs-public-reservation-form"
    : "guest-mawkibs-reservation-form";

  const {
    data: mawkibs = [],
    isLoading: mawkibsLoading,
    isError: mawkibsError,
  } = useQuery({
    queryKey: [
      mawkibQueryKey,
      dateStart,
      dateEnd,
      maleGuestCount,
      femaleGuestCount,
      skipCapacityCheck,
      isMawkibOwner ? user?.id : null,
    ],
    queryFn: () => {
      if (isPanel && isMawkibOwner) {
        return mawkibsApi
          .getMyList(mawkibFilters)
          .then((list) => list.filter((m) => m.status === "Approved"));
      }
      return mawkibsApi.getPublicList(mawkibFilters);
    },
    enabled: !!dateStart && !!dateEnd && maleGuestCount + femaleGuestCount >= 1,
  });

  const reservableMawkibs = restrictedOnlineReserver
    ? mawkibs.filter((m) => isMawkibOnlineReservationEnabled(m))
    : mawkibs;

  const hasAvailableMawkibs = !mawkibsError && reservableMawkibs.length > 0;
  const capacityBlocksSubmit = !skipCapacityCheck && !hasAvailableMawkibs;

  const displayedMawkibs = useMemo(() => {
    if (!mawkibSearchQuery.trim()) return mawkibs;
    return mawkibs.filter((m) => mawkibMatchesNameQuery(m.name, mawkibSearchQuery));
  }, [mawkibs, mawkibSearchQuery]);

  const mawkibSectionSubtitle = useMemo(() => {
    if (skipCapacityCheck && canBypassCapacity) {
      return "همه موکب‌های در دسترس نمایش داده می‌شوند؛ ظرفیت در این حالت بررسی نمی‌شود";
    }
    const guestTotal = maleGuestCount + femaleGuestCount;
    const startLabel = dateStart ? formatPersianDate(dateStart) : "—";
    const endLabel = dateEnd ? formatPersianDate(dateEnd) : "—";
    return `از تاریخ ${startLabel} الی تاریخ ${endLabel} برای ${formatPersianNumber(guestTotal)} نفر`;
  }, [
    skipCapacityCheck,
    canBypassCapacity,
    dateStart,
    dateEnd,
    maleGuestCount,
    femaleGuestCount,
  ]);

  const selectedMawkib = mawkibs.find((m) => m.id === selectedMawkibId);
  const selectedMawkibBlocked =
    !!selectedMawkib &&
    restrictedOnlineReserver &&
    !isMawkibOnlineReservationEnabled(selectedMawkib);

  useEffect(() => {
    if (mawkibsLoading || mawkibsError) return;

    const pool = restrictedOnlineReserver
      ? mawkibs.filter((m) => isMawkibOnlineReservationEnabled(m))
      : mawkibs;

    if (pool.length === 1) {
      setSelectedMawkibId((current) =>
        current === pool[0].id ? current : pool[0].id,
      );
      return;
    }

    setSelectedMawkibId((current) => {
      if (current && !pool.some((m) => m.id === current)) return null;
      return current;
    });
  }, [mawkibs, mawkibsLoading, mawkibsError, restrictedOnlineReserver]);

  useEffect(() => {
    if (!selectedMawkibId) return;
    const mawkib = mawkibs.find((m) => m.id === selectedMawkibId);
    if (!mawkib) return;
    setPlannedCheckInTime(mawkib.defaultCheckInTime ?? DEFAULT_CHECK_IN_TIME);
    setPlannedCheckOutTime(
      mawkib.defaultCheckOutTime ?? DEFAULT_CHECK_OUT_TIME,
    );
  }, [selectedMawkibId, mawkibs]);

  useEffect(() => {
    setRulesModalOpen(false);
  }, [selectedMawkibId]);

  useEffect(() => {
    onSelectedMawkibChange?.(
      selectedMawkib
        ? { id: selectedMawkib.id, name: selectedMawkib.name }
        : null,
    );
  }, [selectedMawkib, onSelectedMawkibChange]);

  useEffect(() => {
    setCompanionsForm((prev) => ({
      ...prev,
      members: buildCompanionMembers(
        maleGuestCount,
        femaleGuestCount,
        prev.members,
      ),
    }));
  }, [maleGuestCount, femaleGuestCount]);

  const togglePilgrimMode = () => {
    setPilgrimMode((mode) => (mode === "select" ? "new" : "select"));
  };

  const validateGuestPersonalInfo = () => {
    if (!fullName.trim()) {
      toast.error("نام و نام خانوادگی را وارد کنید");
      return false;
    }
    if (!mobileNumber.trim()) {
      toast.error("شماره موبایل را وارد کنید");
      return false;
    }
    return true;
  };

  const validatePanelPilgrim = async (): Promise<{
    pilgrimUserId: number;
    pilgrimMobile: string;
  } | null> => {
    if (isPilgrim && user) {
      return { pilgrimUserId: user.id, pilgrimMobile: user.mobileNumber };
    }

    if (pilgrimMode === "select") {
      if (!selectedPilgrim) {
        toast.error("لطفاً زائر را انتخاب کنید");
        return null;
      }
      return {
        pilgrimUserId: selectedPilgrim.id,
        pilgrimMobile: selectedPilgrim.mobileNumber,
      };
    }

    if (!fullName.trim()) {
      toast.error("نام و نام خانوادگی زائر را وارد کنید");
      return null;
    }
    if (!mobileNumber.trim()) {
      toast.error("شماره موبایل زائر را وارد کنید");
      return null;
    }

    const { firstName, lastName } = splitFullName(fullName);

    const pilgrimUser = await usersApi.createQuickPilgrim({
      firstName,
      lastName,
      mobileNumber: mobileNumber.trim(),
      province: province.trim() || undefined,
      city: city.trim() || undefined,
    });

    return {
      pilgrimUserId: pilgrimUser.id,
      pilgrimMobile: pilgrimUser.mobileNumber,
    };
  };

  const performSubmit = async () => {
    setSubmitting(true);

    try {
      if (variant === "guest") {
        const trimmedPassword = password.trim();
        const trimmedMobile = mobileNumber.trim();
        const loginPasswordHint =
          trimmedPassword || trimmedMobile.replace(/\D/g, "").slice(-4);
        const { firstName, lastName } = splitFullName(fullName);

        const companionsPayload = serializeCompanions(companionsForm);

        const result = await guestApi.createReservation({
          firstName,
          lastName,
          mobileNumber: trimmedMobile,
          password: trimmedPassword || undefined,
          province: province.trim() || undefined,
          city: city.trim() || undefined,
          mawkibId: selectedMawkibId!,
          reservationDate: dateStart,
          reservationEndDate: dateEnd,
          maleGuestCount,
          femaleGuestCount,
          companions: companionsPayload,
          description: description.trim() || undefined,
          plannedCheckInTime: plannedCheckInTime || undefined,
          plannedCheckOutTime: plannedCheckOutTime || undefined,
        });

        setRulesModalOpen(false);
        onSuccess({
          variant: "guest",
          message: result.message,
          mawkibName: result.mawkibName,
          reservationDate: result.reservationDate,
          reservationEndDate: result.reservationEndDate,
          maleGuestCount: result.maleGuestCount,
          femaleGuestCount: result.femaleGuestCount,
          trackingCode: result.trackingCode,
          mobileNumber: trimmedMobile,
          loginPasswordHint,
          companions: companionsPayload,
        });
        return;
      }

      const pilgrim = await validatePanelPilgrim();
      if (!pilgrim) return;

      const created = await reservationsApi.create({
        mawkibId: selectedMawkibId!,
        reservationDate: dateStart,
        reservationEndDate: dateEnd,
        maleGuestCount,
        femaleGuestCount,
        pilgrimMobile: pilgrim.pilgrimMobile,
        pilgrimUserId: pilgrim.pilgrimUserId,
        description: description.trim() || undefined,
        companions: serializeCompanions(companionsForm),
        plannedCheckInTime: plannedCheckInTime || undefined,
        plannedCheckOutTime: plannedCheckOutTime || undefined,
        skipCapacityCheck: skipCapacityCheck || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["reservations-admin"] });
      queryClient.invalidateQueries({ queryKey: ["reservations-my"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["pilgrims"] });

      onSuccess({ variant: "panel", reservationId: created.id });
      toast.success("رزرو با موفقیت ثبت شد");
    } catch (err) {
      toastApiError(err, "خطا در ثبت درخواست. لطفاً دوباره تلاش کنید");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMawkibId) {
      toast.error("لطفاً یک موکب انتخاب کنید");
      return;
    }

    const mawkibForSubmit = mawkibs.find((m) => m.id === selectedMawkibId);
    if (
      mawkibForSubmit?.serviceStartDate &&
      !isOnOrAfterServiceStart(dateStart, mawkibForSubmit.serviceStartDate)
    ) {
      toast.error(
        `تاریخ شروع رزرو نمی‌تواند قبل از شروع خدمات موکب (${formatPersianDate(mawkibForSubmit.serviceStartDate.slice(0, 10))}) باشد`,
      );
      return;
    }

    if (
      mawkibForSubmit?.maxReservationDays &&
      !isWithinMaxReservationDays(
        dateStart,
        dateEnd,
        mawkibForSubmit.maxReservationDays,
      )
    ) {
      toast.error(
        `حداکثر بازه رزرو برای این موکب ${mawkibForSubmit.maxReservationDays} روز است`,
      );
      return;
    }

    if (maleGuestCount + femaleGuestCount < 1) {
      toast.error("حداقل یک نفر (آقا یا بانو) باید وارد شود");
      return;
    }

    if (capacityBlocksSubmit) {
      toast.error("در حال حاضر ظرفیت خالی وجود ندارد");
      return;
    }

    if (variant === "guest") {
      if (!validateGuestPersonalInfo()) return;

      const trimmedPassword = password.trim();
      if (trimmedPassword && trimmedPassword.length < 4) {
        toast.error("رمز عبور باید حداقل ۴ کاراکتر باشد");
        return;
      }

      if (mawkibForSubmit && hasMawkibRules(mawkibForSubmit.rules)) {
        setRulesModalOpen(true);
        return;
      }
    }

    await performSubmit();
  };

  const handleRulesConfirm = async () => {
    await performSubmit();
  };

  const handleDateStartChange = (start: string) => {
    setDateStart(start);
    if (start && dateEnd && dateEnd < start) {
      setDateEnd(start);
    }
    setSelectedMawkibId(null);
  };

  const handleDateEndChange = (end: string) => {
    if (end && dateStart && end < dateStart) {
      toast.error("تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد");
      setDateEnd(dateStart);
    } else {
      setDateEnd(end);
    }
    setSelectedMawkibId(null);
  };

  const personalSectionTitle = isPanel
    ? isPilgrim
      ? "اطلاعات شما"
      : pilgrimMode === "select"
        ? "انتخاب زائر"
        : "اطلاعات زائر"
    : "اطلاعات شما";

  const showGuestPersonalFields =
    variant === "guest" || (canManagePilgrim && pilgrimMode === "new");

  return (
    <>
    <form onSubmit={handleSubmit} className={`${guestTheme.cardLg} space-y-6`}>
      <section>
        <SectionHeader
          icon={<IconUser />}
          title={personalSectionTitle}
          action={
            canManagePilgrim ? (
              <button
                type="button"
                onClick={togglePilgrimMode}
                className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50"
              >
                {pilgrimMode === "select" ? "زائر جدید" : "انتخاب زائر"}
              </button>
            ) : undefined
          }
        />

        {isPilgrim ? (
          <PilgrimInfoCard
            fullName={user?.fullName ?? ""}
            mobileNumber={user?.mobileNumber ?? ""}
          />
        ) : canManagePilgrim && pilgrimMode === "select" ? (
          <div className="space-y-3">
            <PilgrimSearchSelect
              value={selectedPilgrim}
              onChange={setSelectedPilgrim}
            />
            {selectedPilgrim && (
              <PilgrimInfoCard
                fullName={selectedPilgrim.fullName}
                mobileNumber={selectedPilgrim.mobileNumber}
                city={selectedPilgrim.city}
              />
            )}
          </div>
        ) : showGuestPersonalFields ? (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">
                نام و نام خانوادگی *
              </span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={reservationFormInputClass}
                placeholder="مثلاً علی محمدی"
              />
            </label>
            {variant === "guest" ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm text-slate-600">
                    شماره موبایل *
                  </span>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className={reservationFormInputClass}
                    placeholder="09121234567"
                    dir="ltr"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-slate-600">
                    رمز عبور
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={reservationFormInputClass}
                    minLength={4}
                    autoComplete="new-password"
                  />
                </label>
              </div>
            ) : (
              <label className="block">
                <span className="mb-1.5 block text-sm text-slate-600">
                  شماره موبایل *
                </span>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className={reservationFormInputClass}
                  placeholder="09121234567"
                  dir="ltr"
                />
                <p className="mt-1 text-xs text-slate-400">
                  اگر این شماره قبلاً ثبت شده باشد، همان کاربر برای رزرو استفاده
                  می‌شود. رمز عبور زائر جدید: ۴ رقم آخر موبایل.
                </p>
              </label>
            )}
            {variant === "guest" && (
              <p className="rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
                در صورت عدم ورود رمز عبور، چهار رقم آخر شماره موبایل به‌عنوان
                رمز در نظر گرفته می‌شود.
              </p>
            )}
            <ProvinceCitySelect
              province={province}
              city={city}
              onProvinceChange={(value) => {
                setProvince(value);
                setCity("");
              }}
              onCityChange={setCity}
            />
          </div>
        ) : null}
      </section>

      <hr className="border-slate-100" />

      <section>
        <SectionHeader
          icon={<IconCalendar />}
          title="تاریخ اقامت"
          subtitle="تاریخ شروع و پایان اقامت و تعداد آقایان و بانوان را مشخص کنید"
        />
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PersianDateInput
              label="تاریخ شروع اقامت *"
              value={dateStart}
              onChange={handleDateStartChange}
              placeholder="انتخاب تاریخ ورود"
              minDate={today}
              inputClassName={reservationFormInputClass}
              clearable={false}
            />
            <PersianDateInput
              label="تاریخ پایان اقامت *"
              value={dateEnd}
              onChange={handleDateEndChange}
              placeholder="انتخاب تاریخ خروج"
              minDate={dateStart || today}
              inputClassName={reservationFormInputClass}
              clearable={false}
            />
          </div>
          <p className="text-xs text-slate-500">
            تاریخ پایان، آخرین روزی است که مهمان در موکب حضور دارد (شامل همان
            روز).
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">
                ساعت ورود :
              </span>
              <input
                type="time"
                value={plannedCheckInTime}
                onChange={(e) => setPlannedCheckInTime(e.target.value)}
                className={reservationFormInputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">
                ساعت خروج :
              </span>
              <input
                type="time"
                value={plannedCheckOutTime}
                onChange={(e) => setPlannedCheckOutTime(e.target.value)}
                className={reservationFormInputClass}
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <GuestCountStepper
              label="تعداد آقایان *"
              value={maleGuestCount}
              onChange={(n) => {
                setMaleGuestCount(n);
                setSelectedMawkibId(null);
              }}
            />
            <GuestCountStepper
              label="تعداد بانوان *"
              value={femaleGuestCount}
              onChange={(n) => {
                setFemaleGuestCount(n);
                setSelectedMawkibId(null);
              }}
            />
          </div>

          <p className="rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
            این ساعات تقریبی هستند و امکان هماهنگی با مدیر موکب پس از تایید رزرو
            وجود دارد
          </p>
        </div>
      </section>

      <hr className="border-slate-100" />

      <section>
        <details className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <summary className="flex cursor-pointer list-none items-center gap-3 p-4 sm:p-5 marker:content-none [&::-webkit-details-marker]:hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
              <IconUsers />
            </div>
            <h2 className="flex-1 text-base font-semibold text-slate-800 sm:text-lg">
              مشخصات همراهان (اختیاری)
            </h2>
            <svg
              className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="border-t border-slate-100 px-4 pb-4 pt-2 sm:px-5">
            <CompanionsTable value={companionsForm} onChange={setCompanionsForm} />
          </div>
        </details>
      </section>

      <hr className="border-slate-100" />

      <section>
        <SectionHeader
          icon={<IconHome />}
          title="انتخاب موکب"
          subtitle={mawkibSectionSubtitle}
        />

        {canBypassCapacity && (
          <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3">
            <input
              type="checkbox"
              checked={skipCapacityCheck}
              onChange={(e) => {
                setSkipCapacityCheck(e.target.checked);
                setSelectedMawkibId(null);
              }}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm leading-relaxed text-amber-900">
              <span className="font-medium">ثبت بدون بررسی ظرفیت</span>
              <span className="mt-1 block text-xs text-amber-800">
                با انتخاب این گزینه، ظرفیت موکب بررسی نخواهد شد و مسئولیت بر
                عهده موکب دار محترم خواهد بود
              </span>
            </span>
          </label>
        )}

        {mawkibsError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
            خطا در دریافت لیست موکب‌ها. لطفاً صفحه را رفرش کنید.
          </div>
        ) : mawkibsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c5d4e8] border-t-[#4a6fa5]" />
          </div>
        ) : mawkibs.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <IconUsers />
            </div>
            {skipCapacityCheck && canBypassCapacity ? (
              <>
                <p className="font-medium text-amber-900">
                  موکبی برای انتخاب یافت نشد
                </p>
                <p className="mt-2 text-sm text-amber-700">
                  ممکن است تاریخ انتخابی قبل از شروع خدمات موکب باشد یا موکب
                  تاییدشده‌ای در دسترس نباشد.
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-amber-900">
                  متأسفانه چون ظرفیت خالی نداریم نمی‌توانیم در خدمتتان باشیم
                </p>
                <p className="mt-2 text-sm text-amber-700">
                  لطفاً تاریخ دیگری انتخاب کنید یا بعداً دوباره مراجعه فرمایید.
                </p>
                <p className="mt-2 text-xs text-amber-600">
                  ممکن است تاریخ انتخابی شما قبل از شروع خدمات برخی موکب‌ها باشد
                  یا از حداکثر بازه رزرو آن‌ها بیشتر باشد.
                </p>
                {canBypassCapacity && (
                  <p className="mt-3 text-xs font-medium text-amber-800">
                    در صورت نیاز می‌توانید گزینه «ثبت بدون بررسی ظرفیت» را فعال
                    کنید.
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {restrictedOnlineReserver && reservableMawkibs.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                موکب‌های موجود در این بازه امکان رزرو آنلاین ندارند.
              </div>
            )}
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">
                جستجوی نام موکب
              </span>
              <input
                type="search"
                value={mawkibSearchQuery}
                onChange={(e) => setMawkibSearchQuery(e.target.value)}
                placeholder="بخشی از نام موکب را وارد کنید..."
                className={reservationFormInputClass}
                autoComplete="off"
              />
            </label>
            {displayedMawkibs.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
                موکبی با نام «{mawkibSearchQuery.trim()}» در این لیست یافت نشد.
              </div>
            ) : (
              displayedMawkibs.map((mawkib) => {
                const reservationBlocked =
                  restrictedOnlineReserver &&
                  !isMawkibOnlineReservationEnabled(mawkib);
                return (
                  <MawkibCard
                    key={mawkib.id}
                    mawkib={mawkib}
                    selected={selectedMawkibId === mawkib.id}
                    onSelect={() => setSelectedMawkibId(mawkib.id)}
                    reservationBlocked={reservationBlocked}
                  />
                );
              })
            )}
          </div>
        )}
      </section>

      <hr className="border-slate-100" />

      <section>
        <SectionHeader
          icon={<IconChat />}
          title="توضیحات (اختیاری)"
          subtitle="اگر نکته‌ای برای مدیریت دارید بنویسید"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`${reservationFormInputClass} resize-none`}
          placeholder="مثلاً نیاز به دسترسی ویلچر، زمان تقریبی ورود و..."
        />
      </section>

      {(isPanel && isAdmin) || !isPanel ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm leading-7 text-amber-900 shadow-sm ring-1 ring-amber-100"
        >
          <p>
            {isPanel && isAdmin
              ? "رزروهای ثبت‌شده توسط مدیر به‌صورت خودکار تایید می‌شوند."
              : "زائر گرامی، ثبت درخواست رزرو به منزله پذیرش کلیه قوانین تعریف شده توسط موکب‌دار گرامی می‌باشد. دقت نمایید درخواست شما در وضعیت غیرقطعی قرار دارد و پس از تایید مدیریت محترم موکب، قطعی شده و به اطلاع شما خواهد رسید."}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:flex-wrap">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={`${btnSecondary} sm:min-w-[120px]`}
          >
            انصراف
          </button>
        )}
        <button
          type="submit"
          disabled={
            submitting ||
            capacityBlocksSubmit ||
            selectedMawkibBlocked ||
            mawkibsLoading ||
            !selectedMawkibId ||
            maleGuestCount + femaleGuestCount < 1
          }
          className={`${guestTheme.btnPrimaryLg} flex-1 py-3.5 sm:min-w-[200px]`}
        >
          {submitting ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              در حال ثبت...
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
              {isPanel ? "ثبت رزرو" : "ثبت درخواست رزرو"}
            </>
          )}
        </button>
      </div>
    </form>

    {variant === "guest" &&
      selectedMawkib &&
      hasMawkibRules(selectedMawkib.rules) && (
        <MawkibRulesAcceptanceModal
          open={rulesModalOpen}
          onClose={() => {
            if (!submitting) setRulesModalOpen(false);
          }}
          mawkibName={selectedMawkib.name}
          rules={selectedMawkib.rules}
          submitting={submitting}
          onConfirm={handleRulesConfirm}
        />
      )}
  </>
  );
}
