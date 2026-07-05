import { useRef, useState, type CSSProperties, type RefObject } from 'react';
import type { Reservation } from '../../types';
import { getPilgrimCardWeekdayAccentForStayStart } from '../../lib/pilgrim-card-weekday';
import { downloadPilgrimCardImage } from '../../lib/pilgrim-card-download';
import { btnSecondary } from '../../lib/styles';
import { toast } from '../../lib/toast';
import { ReservationUserCardPrintContent } from './ReservationUserCardPrintButton';
import { pilgrimCardScreenCss } from './pilgrim-card-styles';

const HIDDEN_ROOT_CLASS = 'pilgrim-card-download-root';

interface PilgrimCardDownloadButtonProps {
  reservation: Reservation;
  className?: string;
}

function PilgrimCardDownloadCapture({
  reservation,
  cardShellRef,
}: {
  reservation: Reservation;
  cardShellRef: RefObject<HTMLDivElement | null>;
}) {
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
      <style>{pilgrimCardScreenCss(HIDDEN_ROOT_CLASS)}</style>
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 -left-[10000px] z-[-1]"
      >
        <div className={HIDDEN_ROOT_CLASS}>
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
            <ReservationUserCardPrintContent reservation={reservation} />
          </div>
        </div>
      </div>
    </>
  );
}

export function PilgrimCardDownloadButton({
  reservation,
  className,
}: PilgrimCardDownloadButtonProps) {
  const cardShellRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    const element = cardShellRef.current;
    if (!element) return;

    setDownloading(true);
    try {
      await downloadPilgrimCardImage(
        element,
        `zaeer-kart-${reservation.trackingCode}.png`,
      );
      toast.success('زائر کارت با موفقیت دانلود شد');
    } catch {
      toast.error('دانلود زائر کارت انجام نشد. لطفاً دوباره تلاش کنید.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <PilgrimCardDownloadCapture
        reservation={reservation}
        cardShellRef={cardShellRef}
      />
      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={downloading}
        className={
          className ??
          `${btnSecondary} inline-flex w-full items-center justify-center gap-1.5 sm:w-auto`
        }
      >
        <svg
          className="h-4 w-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.6}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 11.25L12 15.75m0 0l4.5-4.5M12 15.75V3"
          />
        </svg>
        {downloading ? 'در حال آماده‌سازی...' : 'دانلود زائر کارت'}
      </button>
    </>
  );
}
