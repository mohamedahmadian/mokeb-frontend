import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CapacityInfoBox } from "../components/reservations/CapacityInfoBox";
import { PilgrimSearchSelect } from "../components/reservations/PilgrimSearchSelect";
import { ProvinceCitySelect } from "../components/ui/ProvinceCitySelect";
import { PersianDateRangePicker } from "../components/ui/PersianDateRangePicker";
import { formatPersianDate } from "../components/ui/PersianDateInput";
import {
  countDaysInRange,
  getMinCapacityInRange,
  isOnOrAfterServiceStart,
  isWithinMaxReservationDays,
  toDateOnlyString,
} from "../lib/date-range";
import { useAuth } from "../contexts/AuthContext";
import { getApiErrorMessage } from "../lib/constants";
import { mawkibsApi } from "../lib/mawkibs";
import { reservationsApi } from "../lib/reservations";
import { usersApi, type PilgrimOption } from "../lib/users";
import { btnPrimary, btnSecondary, inputClass } from "../lib/styles";
import type { Mawkib } from "../types";

type PilgrimMode = "select" | "new";

function todayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function NewReservationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.roles.includes("Admin") ?? false;
  const isMawkibOwner = user?.roles.includes("MawkibOwner") ?? false;
  const isPilgrim =
    (user?.roles.includes("Pilgrim") ?? false) && !isAdmin && !isMawkibOwner;
  const [searchParams] = useSearchParams();
  const initialMawkibId = searchParams.get("mawkibId") ?? "";
  const initialPilgrimUserId = searchParams.get("pilgrimUserId") ?? "";

  const [selectedMawkibId, setSelectedMawkibId] = useState(initialMawkibId);
  const today = todayDateString();
  const [dateStart, setDateStart] = useState(today);
  const [dateEnd, setDateEnd] = useState(today);
  const [maleGuestCount, setMaleGuestCount] = useState("1");
  const [femaleGuestCount, setFemaleGuestCount] = useState("0");
  const [description, setDescription] = useState("");
  const [companions, setCompanions] = useState("");
  const [error, setError] = useState("");
  const [maleCapacityError, setMaleCapacityError] = useState("");
  const [femaleCapacityError, setFemaleCapacityError] = useState("");
  const [serviceStartError, setServiceStartError] = useState("");
  const [maxDaysError, setMaxDaysError] = useState("");
  const [pilgrimMode, setPilgrimMode] = useState<PilgrimMode>("select");
  const [selectedPilgrim, setSelectedPilgrim] = useState<PilgrimOption | null>(
    null,
  );
  const [newPilgrim, setNewPilgrim] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    province: "",
    city: "",
  });

  const mawkibId = Number(selectedMawkibId);

  useEffect(() => {
    if (initialMawkibId) setSelectedMawkibId(initialMawkibId);
  }, [initialMawkibId]);

  useEffect(() => {
    if (!initialPilgrimUserId) return;

    const pilgrimId = Number(initialPilgrimUserId);
    if (!pilgrimId) return;

    usersApi
      .getOne(pilgrimId)
      .then((user) => {
        setSelectedPilgrim({
          id: user.id,
          fullName: user.fullName,
          mobileNumber: user.mobileNumber,
          city: user.city,
        });
        setPilgrimMode("select");
      })
      .catch(() => {});
  }, [initialPilgrimUserId]);

  useEffect(() => {
    if (initialPilgrimUserId || !isPilgrim || !user) return;
    setSelectedPilgrim({
      id: user.id,
      fullName: user.fullName,
      mobileNumber: user.mobileNumber,
    });
    setPilgrimMode("select");
  }, [initialPilgrimUserId, isPilgrim, user]);

  const { data: mawkibs = [], isLoading: mawkibsLoading } = useQuery({
    queryKey: isAdmin
      ? ["mawkibs-admin"]
      : isPilgrim
        ? ["mawkibs-public"]
        : ["mawkibs-my"],
    queryFn: () => {
      if (isAdmin) return mawkibsApi.getAdminList();
      if (isPilgrim) return mawkibsApi.getPublicList();
      return mawkibsApi.getMyList();
    },
  });

  const approvedMawkibs = mawkibs.filter(
    (m: Mawkib) => m.status === "Approved",
  );
  const maleGuests = parseInt(maleGuestCount, 10) || 0;
  const femaleGuests = parseInt(femaleGuestCount, 10) || 0;
  const selectableMawkibs = approvedMawkibs.filter(
    (m: Mawkib) =>
      maleGuests <= m.maleCapacity && femaleGuests <= m.femaleCapacity,
  );
  const mawkib = approvedMawkibs.find((m: Mawkib) => m.id === mawkibId);
  const mawkibServiceStart = toDateOnlyString(mawkib?.serviceStartDate);

  useEffect(() => {
    if (!mawkibServiceStart) {
      setServiceStartError("");
      return;
    }
    if (dateStart && !isOnOrAfterServiceStart(dateStart, mawkibServiceStart)) {
      setServiceStartError(
        `تاریخ شروع رزرو نمی‌تواند قبل از شروع خدمات موکب (${formatPersianDate(mawkibServiceStart)}) باشد`,
      );
    } else {
      setServiceStartError("");
    }
  }, [dateStart, mawkibServiceStart]);

  useEffect(() => {
    if (!mawkibServiceStart || !dateStart) return;
    if (dateStart < mawkibServiceStart) {
      setDateStart(mawkibServiceStart);
      if (!dateEnd || dateEnd < mawkibServiceStart) {
        setDateEnd(mawkibServiceStart);
      }
    }
  }, [mawkib?.id, mawkibServiceStart]);

  useEffect(() => {
    if (!mawkib?.maxReservationDays || !dateStart || !dateEnd) {
      setMaxDaysError("");
      return;
    }
    const days = countDaysInRange(dateStart, dateEnd);
    if (
      !isWithinMaxReservationDays(dateStart, dateEnd, mawkib.maxReservationDays)
    ) {
      setMaxDaysError(
        `حداکثر بازه رزرو برای این موکب ${mawkib.maxReservationDays} روز است (انتخاب شما: ${days} روز)`,
      );
    } else {
      setMaxDaysError("");
    }
  }, [dateStart, dateEnd, mawkib?.maxReservationDays]);

  const { data: capacitySnapshot, isFetching: capacityLoading } = useQuery({
    queryKey: ["mawkib-capacity-range", mawkibId, dateStart, dateEnd],
    queryFn: () =>
      getMinCapacityInRange(
        (date) => reservationsApi.getCapacity(mawkibId, date),
        dateStart,
        dateEnd,
      ),
    enabled: !!mawkibId && !!dateStart && !!dateEnd,
  });

  useEffect(() => {
    if (!dateStart || !dateEnd || !capacitySnapshot) {
      setMaleCapacityError("");
      setFemaleCapacityError("");
      return;
    }
    const males = parseInt(maleGuestCount, 10) || 0;
    const females = parseInt(femaleGuestCount, 10) || 0;
    if (mawkib) {
      if (males > mawkib.maleCapacity) {
        setMaleCapacityError(
          `تعداد آقایان از ظرفیت کل موکب (${mawkib.maleCapacity} نفر) بیشتر است`,
        );
      } else if (capacitySnapshot && males > capacitySnapshot.availableMale) {
        setMaleCapacityError(
          `تعداد آقایان از ظرفیت باقی‌مانده (${capacitySnapshot.availableMale} نفر) بیشتر است`,
        );
      } else {
        setMaleCapacityError("");
      }
      if (females > mawkib.femaleCapacity) {
        setFemaleCapacityError(
          `تعداد خانم‌ها از ظرفیت کل موکب (${mawkib.femaleCapacity} نفر) بیشتر است`,
        );
      } else if (capacitySnapshot && females > capacitySnapshot.availableFemale) {
        setFemaleCapacityError(
          `تعداد خانم‌ها از ظرفیت باقی‌مانده (${capacitySnapshot.availableFemale} نفر) بیشتر است`,
        );
      } else {
        setFemaleCapacityError("");
      }
      return;
    }
    if (capacitySnapshot) {
      if (males > capacitySnapshot.availableMale) {
        setMaleCapacityError(
          `تعداد آقایان از ظرفیت باقی‌مانده (${capacitySnapshot.availableMale} نفر) بیشتر است`,
        );
      } else {
        setMaleCapacityError("");
      }
      if (females > capacitySnapshot.availableFemale) {
        setFemaleCapacityError(
          `تعداد خانم‌ها از ظرفیت باقی‌مانده (${capacitySnapshot.availableFemale} نفر) بیشتر است`,
        );
      } else {
        setFemaleCapacityError("");
      }
      return;
    }
    setMaleCapacityError("");
    setFemaleCapacityError("");
  }, [maleGuestCount, femaleGuestCount, capacitySnapshot, dateStart, dateEnd, mawkib]);

  const [submitting, setSubmitting] = useState(false);

  const togglePilgrimMode = () => {
    setPilgrimMode((m) => (m === "select" ? "new" : "select"));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!mawkibId) {
      setError("لطفاً موکب را انتخاب کنید");
      return;
    }

    const males = parseInt(maleGuestCount, 10) || 0;
    const females = parseInt(femaleGuestCount, 10) || 0;
    if (males + females < 1) {
      setError("حداقل یک نفر (آقا یا خانم) باید برای رزرو وارد شود");
      return;
    }

    if (!dateStart || !dateEnd) {
      setError("بازه تاریخ رزرو را انتخاب کنید");
      return;
    }

    if (dateEnd < dateStart) {
      setError("تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد");
      return;
    }

    if (
      mawkibServiceStart &&
      !isOnOrAfterServiceStart(dateStart, mawkibServiceStart)
    ) {
      setError(
        `تاریخ شروع رزرو نمی‌تواند قبل از شروع خدمات موکب (${formatPersianDate(mawkibServiceStart)}) باشد`,
      );
      return;
    }

    if (
      mawkib?.maxReservationDays &&
      !isWithinMaxReservationDays(dateStart, dateEnd, mawkib.maxReservationDays)
    ) {
      setError(
        `حداکثر بازه رزرو برای این موکب ${mawkib.maxReservationDays} روز است`,
      );
      return;
    }

    if (mawkib) {
      if (males > mawkib.maleCapacity) {
        setError(
          `تعداد آقایان از ظرفیت کل موکب (${mawkib.maleCapacity} نفر) بیشتر است`,
        );
        return;
      }
      if (females > mawkib.femaleCapacity) {
        setError(
          `تعداد خانم‌ها از ظرفیت کل موکب (${mawkib.femaleCapacity} نفر) بیشتر است`,
        );
        return;
      }
    }

    if (capacitySnapshot) {
      if (males > capacitySnapshot.availableMale) {
        setError(
          `ظرفیت آقایان کافی نیست. باقی‌مانده: ${capacitySnapshot.availableMale} نفر`,
        );
        return;
      }
      if (females > capacitySnapshot.availableFemale) {
        setError(
          `ظرفیت خانم‌ها کافی نیست. باقی‌مانده: ${capacitySnapshot.availableFemale} نفر`,
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      let pilgrimUserId: number;
      let pilgrimMobile: string;

      if (pilgrimMode === "select") {
        if (!selectedPilgrim && !isPilgrim) {
          setError("لطفاً زائر را انتخاب کنید");
          setSubmitting(false);
          return;
        }
        if (isPilgrim && user) {
          pilgrimUserId = user.id;
          pilgrimMobile = user.mobileNumber;
        } else if (selectedPilgrim) {
          pilgrimUserId = selectedPilgrim.id;
          pilgrimMobile = selectedPilgrim.mobileNumber;
        } else {
          setError("لطفاً زائر را انتخاب کنید");
          setSubmitting(false);
          return;
        }
      } else {
        if (!newPilgrim.firstName.trim() || !newPilgrim.lastName.trim()) {
          setError("نام و نام خانوادگی زائر را وارد کنید");
          setSubmitting(false);
          return;
        }
        if (!newPilgrim.mobileNumber.trim()) {
          setError("شماره موبایل زائر را وارد کنید");
          setSubmitting(false);
          return;
        }

        const pilgrimUser = await usersApi.createQuickPilgrim({
          firstName: newPilgrim.firstName.trim(),
          lastName: newPilgrim.lastName.trim(),
          mobileNumber: newPilgrim.mobileNumber.trim(),
          province: newPilgrim.province.trim() || undefined,
          city: newPilgrim.city.trim() || undefined,
        });
        pilgrimUserId = pilgrimUser.id;
        pilgrimMobile = pilgrimUser.mobileNumber;
      }

      const created = await reservationsApi.create({
        mawkibId,
        reservationDate: dateStart,
        reservationEndDate: dateEnd,
        maleGuestCount: males,
        femaleGuestCount: females,
        pilgrimMobile,
        pilgrimUserId,
        description: description || undefined,
        companions: companions.trim() || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["reservations-admin"] });
      queryClient.invalidateQueries({ queryKey: ["reservations-my"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["pilgrims"] });
      navigate(`/reservations/${created.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "خطا در ثبت رزرو"));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!mawkibId) return;
    const stillSelectable = selectableMawkibs.some((m) => m.id === mawkibId);
    if (!stillSelectable) {
      setSelectedMawkibId("");
    }
  }, [mawkibId, selectableMawkibs]);

  const hasCapacityIssue = !!maleCapacityError || !!femaleCapacityError;
  const hasServiceStartIssue = !!serviceStartError;
  const hasMaxDaysIssue = !!maxDaysError;

  if (mawkibsLoading) {
    return <p className="text-slate-500">در حال بارگذاری...</p>;
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="mb-4 text-xl font-bold text-slate-800 sm:mb-6 sm:text-2xl">
        رزرو موکب
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl bg-white p-4 shadow-sm sm:p-6"
      >
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">موکب *</span>
          <select
            required
            value={selectedMawkibId}
            onChange={(e) => setSelectedMawkibId(e.target.value)}
            className={inputClass}
          >
            <option value="">انتخاب موکب</option>
            {selectableMawkibs.map((m: Mawkib) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {approvedMawkibs.length > 0 && selectableMawkibs.length === 0 && (
            <p className="mt-1 text-xs text-amber-700">
              هیچ موکبی با ظرفیت کافی برای تعداد آقایان و خانم‌های انتخابی وجود ندارد.
            </p>
          )}
        </label>

        {mawkib && (
          <div className="space-y-2">
            <CapacityInfoBox
              snapshot={
                capacitySnapshot ?? {
                  maleCapacity: mawkib.maleCapacity,
                  femaleCapacity: mawkib.femaleCapacity,
                  availableMale:
                    mawkib.availableMaleCapacity ?? mawkib.maleCapacity,
                  availableFemale:
                    mawkib.availableFemaleCapacity ?? mawkib.femaleCapacity,
                }
              }
              loading={capacityLoading}
              missingDates={!dateStart || !dateEnd}
            />
            {mawkibServiceStart && (
              <p className="text-sm text-slate-600">
                شروع خدمات موکب:{" "}
                <span className="font-semibold text-slate-800">
                  {formatPersianDate(mawkibServiceStart)}
                </span>
              </p>
            )}
            {mawkib.maxReservationDays && (
              <p className="text-sm text-slate-600">
                حداکثر بازه رزرو:{" "}
                <span className="font-semibold text-slate-800">
                  {mawkib.maxReservationDays} روز
                </span>
              </p>
            )}
          </div>
        )}

        <div className="rounded-lg border border-slate-200 p-4">
          {!isPilgrim && (
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold text-slate-700">
                {pilgrimMode === "select" ? "انتخاب زائر" : "اطلاعات زائر"}
              </h2>
              <button
                type="button"
                onClick={togglePilgrimMode}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 sm:py-1"
              >
                {pilgrimMode === "select" ? "زائر جدید" : "انتخاب زائر"}
              </button>
            </div>
          )}

          {isPilgrim ? (
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-medium text-slate-800">{user?.fullName}</p>
              <p className="mt-1 font-mono">{user?.mobileNumber}</p>
            </div>
          ) : pilgrimMode === "select" ? (
            <PilgrimSearchSelect
              value={selectedPilgrim}
              onChange={setSelectedPilgrim}
            />
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-600">
                    نام *
                  </span>
                  <input
                    type="text"
                    required
                    value={newPilgrim.firstName}
                    onChange={(e) =>
                      setNewPilgrim({
                        ...newPilgrim,
                        firstName: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-600">
                    نام خانوادگی *
                  </span>
                  <input
                    type="text"
                    required
                    value={newPilgrim.lastName}
                    onChange={(e) =>
                      setNewPilgrim({ ...newPilgrim, lastName: e.target.value })
                    }
                    className={inputClass}
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-sm text-slate-600">
                  شماره موبایل *
                </span>
                <input
                  type="text"
                  required
                  value={newPilgrim.mobileNumber}
                  onChange={(e) =>
                    setNewPilgrim({
                      ...newPilgrim,
                      mobileNumber: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="09121234567"
                />
              </label>
              <ProvinceCitySelect
                province={newPilgrim.province}
                city={newPilgrim.city}
                onProvinceChange={(province) =>
                  setNewPilgrim((prev) => ({ ...prev, province, city: "" }))
                }
                onCityChange={(city) =>
                  setNewPilgrim((prev) => ({ ...prev, city }))
                }
              />
              <p className="text-xs text-slate-400">
                اگر این شماره قبلاً ثبت شده باشد، همان کاربر برای رزرو استفاده
                می‌شود. رمز عبور زائر جدید: ۴ رقم آخر موبایل.
              </p>
            </div>
          )}
        </div>

        <PersianDateRangePicker
          startDate={dateStart}
          endDate={dateEnd}
          minDate={mawkibServiceStart}
          onChange={(start, end) => {
            setDateStart(start);
            setDateEnd(end);
          }}
          label="بازه تاریخ رزرو *"
        />
        {serviceStartError && (
          <p className="-mt-2 text-xs text-red-600">{serviceStartError}</p>
        )}
        {maxDaysError && (
          <p className="-mt-2 text-xs text-red-600">{maxDaysError}</p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">
              تعداد آقایان *
            </span>
            <input
              type="number"
              required
              min={0}
              value={maleGuestCount}
              onChange={(e) => setMaleGuestCount(e.target.value)}
              onFocus={(e) => e.target.select()}
              className={`${inputClass} ${maleCapacityError ? "border-red-400" : ""}`}
              disabled={!mawkibId}
            />
            {maleCapacityError && (
              <p className="mt-1 text-xs text-red-600">{maleCapacityError}</p>
            )}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">
              تعداد خانم‌ها *
            </span>
            <input
              type="number"
              required
              min={0}
              value={femaleGuestCount}
              onChange={(e) => setFemaleGuestCount(e.target.value)}
              onFocus={(e) => e.target.select()}
              className={`${inputClass} ${femaleCapacityError ? "border-red-400" : ""}`}
              disabled={!mawkibId}
            />
            {femaleCapacityError && (
              <p className="mt-1 text-xs text-red-600">{femaleCapacityError}</p>
            )}
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">همراهان</span>
          <textarea
            value={companions}
            onChange={(e) => setCompanions(e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="نام و مشخصات همراهان را وارد کنید..."
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">توضیحات</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </label>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={() => navigate("/reservations")}
            className={`${btnSecondary} w-full sm:w-auto`}
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={
              submitting ||
              hasCapacityIssue ||
              hasServiceStartIssue ||
              hasMaxDaysIssue ||
              !dateStart ||
              !dateEnd ||
              !mawkibId ||
              capacityLoading
            }
            className={`${btnPrimary} w-full disabled:opacity-50 sm:w-auto`}
          >
            {submitting ? "در حال ثبت..." : "ثبت رزرو"}
          </button>
        </div>

        {isAdmin && (
          <p className="text-xs text-slate-400">
            رزروهای ثبت‌شده توسط مدیر به‌صورت خودکار تایید می‌شوند.
          </p>
        )}
      </form>
    </div>
  );
}
