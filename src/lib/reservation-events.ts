export type ReservationEventType =
  | 'CHECK_IN'
  | 'TEMP_OUT'
  | 'TEMP_IN'
  | 'EARLY_CHECKOUT';

export type ReservationPresenceState =
  | 'NOT_ARRIVED'
  | 'PRESENT'
  | 'TEMPORARILY_OUT'
  | 'LEFT';

export interface ReservationEvent {
  id: number;
  reservationId: number;
  eventType: ReservationEventType;
  createdAt: string;
  description?: string | null;
  createdBy: { id: number; fullName: string };
}

export interface ReservationEventSession {
  id: string;
  inEvent?: ReservationEvent;
  outEvent?: ReservationEvent;
  open: boolean;
}

export interface ReservationEventsResponse {
  events: ReservationEvent[];
  sessions: ReservationEventSession[];
  presence: ReservationPresenceState;
  mealPlanNotice?: string;
}

export const RESERVATION_EVENT_LABELS: Record<ReservationEventType, string> = {
  CHECK_IN: 'ورود اولیه',
  TEMP_OUT: 'خروج موقت',
  TEMP_IN: 'ورود موقت',
  EARLY_CHECKOUT: 'خروج نهایی',
};

export const PRESENCE_STATE_LABELS: Record<ReservationPresenceState, string> = {
  NOT_ARRIVED: 'هنوز وارد نشده',
  PRESENT: 'حاضر در موکب',
  TEMPORARILY_OUT: 'خروج موقت',
  LEFT: 'خارج شده',
};

const MOVEMENT_EVENT_TYPES: ReservationEventType[] = [
  'CHECK_IN',
  'TEMP_IN',
  'TEMP_OUT',
  'EARLY_CHECKOUT',
];

function isInMovementEvent(eventType: ReservationEventType): boolean {
  return eventType === 'CHECK_IN' || eventType === 'TEMP_IN';
}

function compareMovementEvents(
  a: Pick<ReservationEvent, 'eventType' | 'createdAt'>,
  b: Pick<ReservationEvent, 'eventType' | 'createdAt'>,
): number {
  const aDate = new Date(a.createdAt);
  const bDate = new Date(b.createdAt);
  const aKey =
    aDate.getFullYear() * 1_000_000_000_0 +
    (aDate.getMonth() + 1) * 100_000_000 +
    aDate.getDate() * 1_000_000 +
    aDate.getHours() * 10_000 +
    aDate.getMinutes() * 100 +
    aDate.getSeconds();
  const bKey =
    bDate.getFullYear() * 1_000_000_000_0 +
    (bDate.getMonth() + 1) * 100_000_000 +
    bDate.getDate() * 1_000_000 +
    bDate.getHours() * 10_000 +
    bDate.getMinutes() * 100 +
    bDate.getSeconds();
  if (aKey !== bKey) return aKey - bKey;

  // Tiebreaker for events at the same second: IN before OUT
  const rank = (event: Pick<ReservationEvent, 'eventType'>) =>
    isInMovementEvent(event.eventType) ? 0 : 1;
  const rankCmp = rank(a) - rank(b);
  if (rankCmp !== 0) return rankCmp;

  return aDate.getTime() - bDate.getTime();
}

function buildEffectiveAttendanceEvents(
  events: Pick<ReservationEvent, 'eventType' | 'createdAt'>[],
  actualCheckInAt?: string | null,
): Pick<ReservationEvent, 'eventType' | 'createdAt'>[] {
  const effective = events.filter((event) =>
    MOVEMENT_EVENT_TYPES.includes(event.eventType),
  );
  const hasCheckInEvent = effective.some((event) => event.eventType === 'CHECK_IN');

  if (actualCheckInAt && !hasCheckInEvent) {
    effective.push({
      eventType: 'CHECK_IN',
      createdAt: actualCheckInAt,
    });
  }

  return effective.sort(compareMovementEvents);
}

/** Derive presence from timeline events + reservation (matches backend logic). */
export function resolvePresenceFromEvents(
  events: ReservationEvent[],
  reservation: {
    actualCheckInAt?: string | null;
    actualCheckOutAt?: string | null;
    status: string;
  },
): ReservationPresenceState {
  if (
    reservation.actualCheckOutAt ||
    reservation.status === 'Completed' ||
    events.some((event) => event.eventType === 'EARLY_CHECKOUT')
  ) {
    return 'LEFT';
  }

  const sorted = buildEffectiveAttendanceEvents(
    events,
    reservation.actualCheckInAt,
  );

  const hasArrived =
    !!reservation.actualCheckInAt ||
    sorted.some((event) => event.eventType === 'CHECK_IN');

  if (!hasArrived) return 'NOT_ARRIVED';

  let state: ReservationPresenceState = 'NOT_ARRIVED';

  for (const event of sorted) {
    switch (event.eventType) {
      case 'CHECK_IN':
      case 'TEMP_IN':
        state = 'PRESENT';
        break;
      case 'TEMP_OUT':
        state = 'TEMPORARILY_OUT';
        break;
      case 'EARLY_CHECKOUT':
        return 'LEFT';
      default:
        break;
    }
  }

  return state === 'NOT_ARRIVED' ? 'PRESENT' : state;
}

/** Group events by local calendar day (newest day first). */
export function groupEventsByDate(
  events: ReservationEvent[],
): { dateKey: string; dateLabel: string; events: ReservationEvent[] }[] {
  const map = new Map<string, ReservationEvent[]>();

  for (const event of events) {
    const d = new Date(event.createdAt);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const bucket = map.get(dateKey) ?? [];
    bucket.push(event);
    map.set(dateKey, bucket);
  }

  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, dayEvents]) => ({
      dateKey,
      dateLabel: new Date(dayEvents[0].createdAt).toLocaleDateString('fa-IR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      events: [...dayEvents].sort(compareMovementEvents),
    }));
}
