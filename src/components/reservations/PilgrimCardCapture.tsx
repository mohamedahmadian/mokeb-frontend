import type { CSSProperties, RefObject } from 'react';
import type { Reservation } from '../../types';
import { getPilgrimCardWeekdayAccentForStayStart } from '../../lib/pilgrim-card-weekday';
import { ReservationUserCardPrintContent } from './ReservationUserCardPrintButton';
import { pilgrimCardScreenCss } from './pilgrim-card-styles';

export const PILGRIM_CARD_CAPTURE_ROOT_CLASS = 'pilgrim-card-capture-root';

interface PilgrimCardCaptureProps {
  reservation: Reservation;
  cardShellRef: RefObject<HTMLDivElement | null>;
  footerNote?: string;
  interactive?: boolean;
  rootClass?: string;
}

export function PilgrimCardCapture({
  reservation,
  cardShellRef,
  footerNote,
  interactive = false,
  rootClass = PILGRIM_CARD_CAPTURE_ROOT_CLASS,
}: PilgrimCardCaptureProps) {
  const weekdayAccent = getPilgrimCardWeekdayAccentForStayStart(
    reservation.reservationDate,
  );
  const shellStyle = {
    '--pilgrim-weekday-color': weekdayAccent.color,
    '--pilgrim-weekday-border': weekdayAccent.borderColor,
    '--pilgrim-weekday-accent': weekdayAccent.accentColor,
    '--pilgrim-weekday-text': weekdayAccent.textOnColor,
    fontFamily: "'Vazir', Tahoma, sans-serif",
  } as CSSProperties;

  return (
    <>
      <style>{pilgrimCardScreenCss(rootClass)}</style>
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 -left-[10000px] z-[-1]"
      >
        <div className={rootClass}>
          <div
            ref={cardShellRef}
            className="pilgrim-card-shell"
            data-weekday={weekdayAccent.id}
            style={shellStyle}
          >
            <span
              className="pilgrim-card__weekday-dot"
              aria-hidden
              title={weekdayAccent.label}
            />
            <div
              className="pilgrim-card__weekday-banner"
              aria-label={`روز شروع اقامت: ${weekdayAccent.label}`}
            >
              {weekdayAccent.label}
            </div>
            <ReservationUserCardPrintContent
              reservation={reservation}
              footerNote={footerNote}
              interactive={interactive}
            />
          </div>
        </div>
      </div>
    </>
  );
}
