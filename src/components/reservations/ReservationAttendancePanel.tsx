import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { NavIcon, type NavIconName } from '../ui/NavIcons';
import { formatPersianDateRange } from '../ui/PersianDateRangePicker';
import { GuestCountBadges } from './GuestCountBadges';
import { MealPlanDayPanel } from '../meal-plans/MealPlanDayPanel';
import { RESERVATION_STATUS_LABELS } from '../../lib/constants';
import {
  buildRecordedAtFromDateAndTime,
  currentTimeInputValue,
  formatTimeFromIso,
  todayLocalGregorianDateString,
} from '../../lib/format-time';
import { mealPlansApi } from '../../lib/meal-plans';
import { shouldShowReservationMealPlan } from '../../lib/meal-plan-utils';
import {
  groupEventsByDate,
  RESERVATION_EVENT_LABELS,
  type ReservationEvent,
  type ReservationEventType,
  type ReservationEventsResponse,
  type ReservationPresenceState,
} from '../../lib/reservation-events';
import {
  getPresenceCardClass,
  PresenceBadge,
  tempInActionBtn,
  tempOutActionBtn,
} from './reservation-presence-ui';
import { reservationEventsApi } from '../../lib/reservation-events-api';
import { reservationsApi } from '../../lib/reservations';
import { btnAction, btnPrimary, inputClass } from '../../lib/styles';
import { toast, toastApiError } from '../../lib/toast';
import type { MealPlan, Reservation } from '../../types';

const panelFont = 'font-sans';

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800 ring-amber-200',
  Confirmed: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  Cancelled: 'bg-red-100 text-red-700 ring-red-200',
  Completed: 'bg-slate-100 text-slate-700 ring-slate-200',
};

const dashboardActionBtn = `${btnAction} inline-flex shrink-0 items-center justify-center gap-1.5 border !min-h-8 !px-2.5 !py-1.5 !text-[11px]`;
const dashboardSecondaryBtn = `${dashboardActionBtn} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;
const dashboardPrimaryBtn = `${btnPrimary} inline-flex shrink-0 items-center justify-center gap-1.5 !min-h-8 !px-2.5 !py-1.5 !text-[11px]`;

function eventIcon(type: ReservationEventType): NavIconName {
  switch (type) {
    case 'CHECK_IN':
    case 'TEMP_IN':
      return 'login';
    case 'TEMP_OUT':
    case 'EARLY_CHECKOUT':
      return 'logout';
  }
}

function InfoCell({
  icon,
  label,
  value,
  dir,
  accent = false,
}: {
  icon: NavIconName;
  label: string;
  value: ReactNode;
  dir?: 'ltr' | 'rtl';
  accent?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2 py-1.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#e8eef6] text-[#4a6fa5]">
        <NavIcon name={icon} className="h-3.5 w-3.5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-slate-500">{label}</p>
        <div
          className={`truncate text-xs font-semibold ${accent ? 'text-emerald-700' : 'text-slate-800'}`}
          dir={dir}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export function ReservationAttendanceSummary({
  reservation,
  presence,
}: {
  reservation: Reservation;
  presence?: ReservationPresenceState;
}) {
  const endDate = reservation.reservationEndDate ?? reservation.reservationDate;
  const stayRange = formatPersianDateRange(
    reservation.reservationDate.slice(0, 10),
    endDate.slice(0, 10),
  );
  const hasCheckIn = !!reservation.actualCheckInAt;
  const hasCheckOut = !!reservation.actualCheckOutAt;

  return (
    <div className={`${getPresenceCardClass(presence)} ${panelFont}`}>
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-3 py-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
          <NavIcon name="pilgrims" className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">
            {reservation.pilgrim.fullName}
          </p>
          <p className="truncate text-[11px] text-slate-500">{reservation.mawkib.name}</p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${statusColors[reservation.status] ?? ''}`}
        >
          {RESERVATION_STATUS_LABELS[reservation.status]}
        </span>
        {presence && <PresenceBadge presence={presence} />}
      </div>

      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-4">
        <InfoCell icon="track" label="کد رزرو" value={reservation.trackingCode} dir="ltr" />
        <InfoCell icon="login" label="موبایل" value={reservation.pilgrimMobile} dir="ltr" />
        <InfoCell
          icon="users"
          label="کد ملی"
          value={reservation.pilgrim.nationalId || '—'}
          dir="ltr"
        />
        <InfoCell icon="reserve" label="تاریخ اقامت" value={stayRange} />
        <InfoCell
          icon="pilgrims"
          label="تعداد"
          value={
            <GuestCountBadges
              male={reservation.maleGuestCount}
              female={reservation.femaleGuestCount}
            />
          }
        />
        <InfoCell
          icon="check"
          label={hasCheckIn ? 'ورود واقعی' : 'ساعت ورود'}
          value={
            hasCheckIn
              ? formatTimeFromIso(reservation.actualCheckInAt) || '—'
              : 'ثبت نشده'
          }
          dir="ltr"
          accent={hasCheckIn}
        />
        <InfoCell
          icon="logout"
          label={hasCheckOut ? 'خروج واقعی' : 'ساعت خروج'}
          value={
            hasCheckOut
              ? formatTimeFromIso(reservation.actualCheckOutAt) || '—'
              : 'ثبت نشده'
          }
          dir="ltr"
          accent={hasCheckOut}
        />
      </div>
    </div>
  );
}

export function ReservationEventTimeline({
  data,
  loading,
}: {
  data?: ReservationEventsResponse;
  loading?: boolean;
}) {
  if (loading) {
    return <p className={`text-xs text-slate-500 ${panelFont}`}>در حال بارگذاری تاریخچه...</p>;
  }

  if (!data?.events?.length) {
    return (
      <div className={`rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-xs text-slate-500 ${panelFont}`}>
        هنوز رویداد ورود/خروجی ثبت نشده است.
      </div>
    );
  }

  const dayGroups = groupEventsByDate(data.events);

  return (
    <div className={`space-y-2.5 ${panelFont}`} dir="rtl">
      {dayGroups.map((day) => (
        <div
          key={day.dateKey}
          className="rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm sm:px-3.5 sm:py-3"
        >
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5]">
              <NavIcon name="reserve" className="h-3.5 w-3.5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight text-slate-800">{day.dateLabel}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                {day.events.length.toLocaleString('fa-IR')} رویداد
              </p>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1.5">
            {day.events.map((event, index) => (
              <Fragment key={event.id}>
                <EventTimeBadge event={event} />
                {index < day.events.length - 1 && (
                  <EventFlowIcon
                    fromType={event.eventType}
                    toType={day.events[index + 1].eventType}
                  />
                )}
              </Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function isOutEvent(eventType: ReservationEventType): boolean {
  return eventType === 'TEMP_OUT' || eventType === 'EARLY_CHECKOUT';
}

function isInEvent(eventType: ReservationEventType): boolean {
  return eventType === 'CHECK_IN' || eventType === 'TEMP_IN';
}

function EventFlowIcon({
  fromType,
  toType,
}: {
  fromType: ReservationEventType;
  toType: ReservationEventType;
}) {
  const fromIn = isInEvent(fromType);
  const toIn = isInEvent(toType);

  let iconName: NavIconName;
  let iconColor: string;
  let title: string;

  if (fromIn && toIn) {
    iconName = 'login';
    iconColor = 'text-emerald-400';
    title = 'ورود به ورود';
  } else if (!fromIn && !toIn) {
    iconName = 'logout';
    iconColor = 'text-rose-400';
    title = 'خروج به خروج';
  } else if (fromIn && !toIn) {
    iconName = 'logout';
    iconColor = 'text-amber-400';
    title = 'ورود به خروج';
  } else {
    iconName = 'login';
    iconColor = 'text-amber-400';
    title = 'خروج به ورود';
  }

  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${iconColor}`}
      title={title}
      aria-hidden="true"
    >
      <NavIcon name={iconName} className="h-3 w-3" strokeWidth={2} />
    </span>
  );
}

function EventTimeBadge({ event }: { event: ReservationEvent }) {
  const isOut = isOutEvent(event.eventType);
  const time = formatTimeFromIso(event.createdAt) || '—';
  const label = RESERVATION_EVENT_LABELS[event.eventType];

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] shadow-[0_1px_3px_rgba(15,23,42,0.06)] ring-1 ${
        isOut
          ? 'bg-gradient-to-b from-rose-50 to-rose-100/90 text-rose-800 ring-rose-200/80'
          : 'bg-gradient-to-b from-emerald-50 to-emerald-100/90 text-emerald-800 ring-emerald-200/80'
      }`}
      title={
        event.description ? `${label} — ${event.description}` : label
      }
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          isOut ? 'bg-rose-500/15 text-rose-600' : 'bg-emerald-500/15 text-emerald-600'
        }`}
      >
        <NavIcon
          name={eventIcon(event.eventType)}
          className="h-3 w-3"
          strokeWidth={2}
        />
      </span>
      <span className="tabular-nums font-bold tracking-tight" dir="ltr">
        {time}
      </span>
    </div>
  );
}

interface ReservationEventRecorderProps {
  reservation: Reservation;
  presence: ReservationPresenceState;
  onSuccess: () => void;
}

export function ReservationEventRecorder({
  reservation,
  presence,
  onSuccess,
}: ReservationEventRecorderProps) {
  const queryClient = useQueryClient();
  const [timeValue, setTimeValue] = useState(() => currentTimeInputValue());
  const reservationId = reservation.id;

  const recordMutation = useMutation({
    mutationFn: (eventType: ReservationEventType) => {
      const recordedAt = buildRecordedAtFromDateAndTime(
        todayLocalGregorianDateString(),
        timeValue,
      );
      return reservationEventsApi.record(reservationId, { eventType, recordedAt });
    },
    onSuccess: async (result) => {
      const events = Array.isArray(result.events) ? result.events : [];
      const nextPresence =
        (result.reservation as Reservation | undefined)?.presenceState ??
        result.presence ??
        reservation.presenceState ??
        'NOT_ARRIVED';

      if (events.length > 0) {
        queryClient.setQueryData(['reservation-events', reservationId], {
          events,
          sessions: result.sessions ?? [],
          presence: nextPresence,
        });
      } else {
        await queryClient.invalidateQueries({ queryKey: ['reservation-events', reservationId] });
      }
      setTimeValue(currentTimeInputValue());
      await onSuccess();
      toast.success('رویداد با موفقیت ثبت شد');
      if (result.mealPlanNotice) {
        toast.warning(result.mealPlanNotice);
      }
    },
    onError: (err) => toastApiError(err, 'خطا در ثبت رویداد'),
  });

  const canCheckIn = presence === 'NOT_ARRIVED';
  const canTempOut = presence === 'PRESENT';
  const canTempIn = presence === 'TEMPORARILY_OUT';
  const canFinalOut = presence === 'PRESENT' || presence === 'TEMPORARILY_OUT';
  const pending = recordMutation.isPending;

  const syncToNow = () => setTimeValue(currentTimeInputValue());

  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm ${panelFont}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="shrink-0 text-xs font-semibold text-slate-700">ثبت رویداد</span>

        <div className="flex shrink-0 items-center gap-1">
          <input
            type="time"
            value={timeValue}
            onChange={(e) => setTimeValue(e.target.value)}
            className={`${inputClass} !min-h-8 !w-[6.5rem] !py-1.5 !text-sm tabular-nums`}
            dir="ltr"
            title="ساعت ثبت"
          />
          <button
            type="button"
            onClick={syncToNow}
            disabled={pending}
            title="ساعت فعلی"
            className={`${dashboardActionBtn} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}
          >
            <NavIcon name="check" className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="hidden h-6 w-px shrink-0 bg-slate-200 sm:block" />

        <div className="flex flex-wrap items-center gap-1.5">
          {canCheckIn && (
            <button
              type="button"
              disabled={pending}
              onClick={() => recordMutation.mutate('CHECK_IN')}
              className={`${dashboardPrimaryBtn} !bg-emerald-600 hover:!bg-emerald-700`}
            >
              <NavIcon name="login" className="h-3.5 w-3.5" strokeWidth={1.75} />
              ثبت ورود
            </button>
          )}
          {canTempOut && (
            <button
              type="button"
              disabled={pending}
              onClick={() => recordMutation.mutate('TEMP_OUT')}
              className={tempOutActionBtn}
              title="خروج موقت"
            >
              <NavIcon name="logout" className="h-3.5 w-3.5" strokeWidth={1.75} />
              خروج موقت
            </button>
          )}
          {canTempIn && (
            <button
              type="button"
              disabled={pending}
              onClick={() => recordMutation.mutate('TEMP_IN')}
              className={tempInActionBtn}
              title="ورود موقت"
            >
              <NavIcon name="login" className="h-3.5 w-3.5" strokeWidth={1.75} />
              ورود موقت
            </button>
          )}
          {canFinalOut && (
            <button
              type="button"
              disabled={pending}
              onClick={() => recordMutation.mutate('EARLY_CHECKOUT')}
              className={dashboardSecondaryBtn}
              title="خروج نهایی"
            >
              <NavIcon name="logout" className="h-3.5 w-3.5" strokeWidth={1.75} />
              خروج نهایی
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReservationAttendancePanel({
  reservation,
  onReservationUpdate,
}: {
  reservation: Reservation;
  onReservationUpdate?: (r: Reservation) => void;
}) {
  const queryClient = useQueryClient();
  const today = todayLocalGregorianDateString();
  const showMealPlan = shouldShowReservationMealPlan(reservation, today);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [mealPlansLoading, setMealPlansLoading] = useState(false);

  const { data: eventsData, isLoading, refetch } = useQuery({
    queryKey: ['reservation-events', reservation.id],
    queryFn: () => reservationEventsApi.list(reservation.id),
  });

  useEffect(() => {
    if (!showMealPlan) {
      setMealPlans([]);
      return;
    }

    let cancelled = false;
    setMealPlansLoading(true);

    void mealPlansApi
      .getByReservation(reservation.id)
      .then((plans) => {
        if (!cancelled) setMealPlans(plans);
      })
      .catch((err) => {
        if (!cancelled) {
          setMealPlans([]);
          toastApiError(err, 'خطا در بارگذاری برنامه غذایی');
        }
      })
      .finally(() => {
        if (!cancelled) setMealPlansLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reservation.id, showMealPlan]);

  const handleSuccess = async () => {
    await refetch();
    const fresh = await reservationsApi.getOne(reservation.id);
    onReservationUpdate?.(fresh);
    queryClient.invalidateQueries({ queryKey: ['reservation', reservation.id] });
    queryClient.invalidateQueries({ queryKey: ['reservations-admin'] });
    queryClient.invalidateQueries({ queryKey: ['reservations-my'] });
  };

  const presence =
    reservation.presenceState ??
    eventsData?.presence ??
    'NOT_ARRIVED';

  return (
    <div className={`space-y-3 ${panelFont}`}>
      <ReservationAttendanceSummary
        reservation={reservation}
        presence={presence}
      />

      {showMealPlan && (
        <section className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-800">برنامه غذایی امروز</h3>
          {mealPlansLoading ? (
            <p className="text-xs text-slate-500">در حال بارگذاری برنامه غذایی...</p>
          ) : (
            <MealPlanDayPanel
              reservation={reservation}
              plans={mealPlans}
              date={today}
              onPlansUpdated={setMealPlans}
            />
          )}
        </section>
      )}

      <ReservationEventRecorder
        reservation={reservation}
        presence={presence}
        onSuccess={handleSuccess}
      />
      <div>
        <h3 className="mb-2 text-xs font-semibold text-slate-800">تاریخچه ورود و خروج</h3>
        <ReservationEventTimeline data={eventsData} loading={isLoading} />
      </div>
    </div>
  );
}
