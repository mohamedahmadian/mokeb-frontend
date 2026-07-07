import { type CSSProperties } from 'react';
import type { Reservation } from '../../types';
import { getPilgrimCardWeekdayAccentForStayStart } from '../../lib/pilgrim-card-weekday';
import { guestTheme } from '../../lib/guest-theme';
import { PilgrimCardDownloadButton } from './PilgrimCardDownloadButton';
import {
  ReservationUserCardPrintButton,
  ReservationUserCardPrintContent,
} from './ReservationUserCardPrintButton';
import { pilgrimCardScreenCss } from './pilgrim-card-styles';

const SCREEN_ROOT_CLASS = 'pilgrim-card-screen-root';
const COMPACT_ROOT_CLASS = 'pilgrim-card-screen-root-compact';

interface PilgrimCardScreenViewProps {
  reservation: Reservation;
  showPrintButton?: boolean;
  showDownloadButton?: boolean;
  autoDownload?: boolean;
  compact?: boolean;
  printButtonClassName?: string;
  downloadButtonClassName?: string;
  hintMessage?: string;
}

export function PilgrimCardScreenView({
  reservation,
  showPrintButton = true,
  showDownloadButton = false,
  autoDownload = false,
  compact = false,
  printButtonClassName,
  downloadButtonClassName,
  hintMessage,
}: PilgrimCardScreenViewProps) {
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

  const actionButtonClass =
    printButtonClassName ??
    downloadButtonClassName ??
    `${guestTheme.btnSecondary} w-full sm:w-auto`;

  const rootClass = compact ? COMPACT_ROOT_CLASS : SCREEN_ROOT_CLASS;

  return (
    <div className={compact ? 'space-y-2' : 'space-y-4'}>
      {hintMessage && (
        <p className="text-center text-sm leading-relaxed text-slate-600">
          {hintMessage}
        </p>
      )}

      <style>{pilgrimCardScreenCss(rootClass, compact)}</style>
      <div className={rootClass}>
        <div
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
          <ReservationUserCardPrintContent reservation={reservation} interactive />
        </div>
      </div>

      {(showPrintButton || showDownloadButton) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
          {showPrintButton && (
            <ReservationUserCardPrintButton
              reservation={reservation}
              className={actionButtonClass}
            />
          )}
          {showDownloadButton && (
            <PilgrimCardDownloadButton
              reservation={reservation}
              autoDownload={autoDownload}
              className={`w-full sm:w-auto ${downloadButtonClassName ?? ''}`}
            />
          )}
        </div>
      )}
    </div>
  );
}
