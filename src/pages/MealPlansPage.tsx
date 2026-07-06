import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { MealPlanEditor } from "../components/meal-plans/MealPlanEditor";
import { ReservationAttendanceSummary } from "../components/reservations/ReservationAttendancePanel";
import { PageHeader } from "../components/ui/PageHeader";
import { NavIcon } from "../components/ui/NavIcons";
import { mealPlansApi } from "../lib/meal-plans";
import {
  isMealPlanEligibleReservation,
  isReservationMealPlanLinkVisible,
} from "../lib/meal-plan-utils";
import { normalizeLookupQuery, lookupOwnerReservationSingle } from "../lib/mawkib-owner-dashboard";
import { useAuth } from '../contexts/AuthContext';
import { lookupAdminReservationSingle } from '../lib/admin-dashboard';
import { reservationsApi } from "../lib/reservations";
import { inputClass } from "../lib/styles";
import { toast, toastApiError } from "../lib/toast";
import type { MealPlan, Reservation } from "../types";
import {
  mealPlanAccentBtn,
  mealPlanIconClass,
  mealPlanSecondaryBtn,
} from "../components/meal-plans/meal-plans-ui";

export function MealPlansPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes("Admin") ?? false;
  const isMawkibOwner = user?.roles.includes("MawkibOwner") ?? false;

  const canManageReservationMealPlan = (selected: Reservation) =>
    isReservationMealPlanLinkVisible(selected, { isAdmin, isMawkibOwner });
  const [searchParams] = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const planSectionRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [showPlanSection, setShowPlanSection] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadPlans = async (reservationId: number) => {
    setPlansLoading(true);
    try {
      const data = await mealPlansApi.getByReservation(reservationId);
      setPlans(data);
    } catch (err) {
      toastApiError(err, "خطا در بارگذاری برنامه غذایی");
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  };

  const selectReservation = async (selected: Reservation) => {
    setReservation(selected);
    setShowPlanSection(true);
    await loadPlans(selected.id);
    requestAnimationFrame(() => {
      planSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleSearch = async () => {
    const trimmed = normalizeLookupQuery(query);
    if (!trimmed) {
      toast.error("لطفاً شماره موبایل، کد ملی یا شناسه رزرو را وارد کنید");
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const lookupFn = isAdmin
        ? lookupAdminReservationSingle
        : lookupOwnerReservationSingle;
      const found = await lookupFn(trimmed);

      if (!found || !isMealPlanEligibleReservation(found.status)) {
        setReservation(null);
        setPlans([]);
        setShowPlanSection(false);
        return;
      }

      if (!canManageReservationMealPlan(found)) {
        setReservation(null);
        setPlans([]);
        setShowPlanSection(false);
        toast.error("مدیریت برنامه غذایی برای این موکب فعال نیست");
        return;
      }

      await selectReservation(found);
    } catch (err) {
      setReservation(null);
      setPlans([]);
      setShowPlanSection(false);
      toastApiError(err, "خطا در جستجوی رزرو");
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void handleSearch();
  };

  const handleGenerate = async () => {
    if (!reservation) return;
    setGenerating(true);
    try {
      const updated = await mealPlansApi.generate(reservation.id);
      setPlans(updated);
      setGenerateOpen(false);
      setShowPlanSection(true);
      toast.success("برنامه غذایی برای بازه اقامت ایجاد شد");
      requestAnimationFrame(() => {
        planSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } catch (err) {
      toastApiError(err, "خطا در ایجاد برنامه غذایی");
    } finally {
      setGenerating(false);
    }
  };

  const openPlanSection = () => {
    setShowPlanSection(true);
    requestAnimationFrame(() => {
      planSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  useEffect(() => {
    const reservationIdParam = searchParams.get("reservationId");
    if (reservationIdParam) return;

    const input = searchInputRef.current;
    // #region agent log
    fetch("http://127.0.0.1:7929/ingest/64824c4b-ac44-41b9-87b8-d1ea5f1d3aa4", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "06086f",
      },
      body: JSON.stringify({
        sessionId: "06086f",
        hypothesisId: "H1",
        location: "MealPlansPage.tsx:focus-on-mount:before",
        message: "Meal page mount focus attempt",
        data: {
          hasInputRef: Boolean(input),
          activeTag: document.activeElement?.tagName ?? null,
          activeId: (document.activeElement as HTMLElement | null)?.id ?? null,
          reservationIdParam,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    input?.focus();

    // #region agent log
    fetch("http://127.0.0.1:7929/ingest/64824c4b-ac44-41b9-87b8-d1ea5f1d3aa4", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "06086f",
      },
      body: JSON.stringify({
        sessionId: "06086f",
        hypothesisId: "H1",
        location: "MealPlansPage.tsx:focus-on-mount:after",
        message: "Meal page mount focus result",
        data: {
          focusedSearchInput: document.activeElement === input,
          activeTag: document.activeElement?.tagName ?? null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [searchParams]);

  useEffect(() => {
    const reservationIdParam = searchParams.get("reservationId");
    const reservationId = reservationIdParam
      ? Number.parseInt(reservationIdParam, 10)
      : NaN;
    if (!Number.isFinite(reservationId) || reservationId <= 0) return;

    let cancelled = false;

    void (async () => {
      setLoading(true);
      setSearched(true);
      try {
        const loaded = await reservationsApi.getOne(reservationId);
        if (cancelled) return;

        if (!isMealPlanEligibleReservation(loaded.status)) {
          toast.error(
            "برنامه غذایی فقط برای رزروهای تایید شده یا تکمیل‌شده است",
          );
          setReservation(null);
          setPlans([]);
          setShowPlanSection(false);
          return;
        }

        if (!canManageReservationMealPlan(loaded)) {
          toast.error("مدیریت برنامه غذایی برای این موکب فعال نیست");
          setReservation(null);
          setPlans([]);
          setShowPlanSection(false);
          return;
        }

        await selectReservation(loaded);
      } catch (err) {
        if (!cancelled) {
          toastApiError(err, "خطا در بارگذاری رزرو");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-4xl space-y-4 font-sans [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
      <PageHeader
        title="سامانه غذا"
        subtitle="جستجوی زائر و مدیریت برنامه غذایی اقامت"
      />

      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-2 p-2.5 sm:p-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5]">
              <NavIcon name="meals" className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <h2 className="text-sm font-semibold text-slate-800">
              جستجوی زائر
            </h2>
          </div>

          <div className="flex flex-col gap-1.5 sm:flex-row">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                if (searched) {
                  setReservation(null);
                  setPlans([]);
                  setShowPlanSection(false);
                  setSearched(false);
                }
              }}
              className={`${inputClass} min-w-0 flex-1 !min-h-9 !py-2 text-right !text-sm`}
              placeholder="موبایل، کد ملی یا شماره رزرو"
              dir="ltr"
              inputMode="text"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading}
              className={`${mealPlanSecondaryBtn} !min-h-9 !px-3 sm:min-w-[5.5rem]`}
            >
              <NavIcon
                name="track"
                className={mealPlanIconClass}
                strokeWidth={1.75}
              />
              {loading ? "..." : "جستجو"}
            </button>
          </div>
        </form>

        {searched && !loading && !reservation && (
          <div className="flex items-center gap-2 border-t border-slate-100 px-2.5 py-2 text-[11px] text-slate-500 sm:px-3">
            <NavIcon
              name="track"
              className="h-3.5 w-3.5 shrink-0 text-slate-400"
            />
            <span>
              رزرو فعال (تایید شده یا تکمیل‌شده) با این مشخصات یافت نشد.
            </span>
          </div>
        )}
      </section>

      {reservation && (
        <section className="space-y-3">
          <ReservationAttendanceSummary
            reservation={reservation}
            presence={reservation.presenceState}
          />

          <div className="flex flex-wrap items-center gap-2">
            <div className="ms-auto flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setGenerateOpen(true)}
                className={mealPlanSecondaryBtn}
              >
                <NavIcon
                  name="meals"
                  className={mealPlanIconClass}
                  strokeWidth={1.75}
                />
                ایجاد برنامه غذایی
              </button>
              <button
                type="button"
                onClick={openPlanSection}
                className={mealPlanSecondaryBtn}
              >
                <NavIcon
                  name="book"
                  className={mealPlanIconClass}
                  strokeWidth={1.75}
                />
                مشاهده برنامه غذایی
              </button>
            </div>
          </div>
        </section>
      )}

      {reservation && showPlanSection && (
        <section ref={planSectionRef} className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-800">برنامه غذایی</h2>
          {plansLoading ? (
            <p className="text-xs text-slate-500">
              در حال بارگذاری برنامه غذایی...
            </p>
          ) : (
            <MealPlanEditor
              reservation={reservation}
              plans={plans}
              onPlansUpdated={setPlans}
            />
          )}
        </section>
      )}

      <ConfirmDialog
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onConfirm={() => void handleGenerate()}
        title="ایجاد برنامه غذایی"
        message="اگر برای این رزرو برنامه غذایی ثبت شده باشد، ابتدا همه اطلاعات حذف و سپس برای تمام روزهای بازه اقامت (صبحانه، ناهار و شام) مجدداً ایجاد می‌شود. ادامه می‌دهید؟"
        confirmLabel="ایجاد مجدد"
        loading={generating}
        cancelClassName={mealPlanSecondaryBtn}
        confirmClassName={mealPlanAccentBtn}
        cancelIcon="x"
        confirmIcon="meals"
      />
    </div>
  );
}
