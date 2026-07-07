import { useCallback, useEffect, useRef, useState } from 'react';
import type { Reservation } from '../../types';
import { downloadPilgrimCardImage } from '../../lib/pilgrim-card-download';
import { btnSecondary } from '../../lib/styles';
import { toast } from '../../lib/toast';
import { PilgrimCardCapture } from './PilgrimCardCapture';

interface PilgrimCardDownloadButtonProps {
  reservation: Reservation;
  className?: string;
  /** Trigger download once after the capture element is mounted. */
  autoDownload?: boolean;
}

export function PilgrimCardDownloadButton({
  reservation,
  className,
  autoDownload = false,
}: PilgrimCardDownloadButtonProps) {
  const cardShellRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const autoDownloadDoneRef = useRef(false);

  const handleDownload = useCallback(async () => {
    const element = cardShellRef.current;
    if (!element) return false;

    setDownloading(true);
    try {
      await downloadPilgrimCardImage(
        element,
        `zaeer-kart-${reservation.trackingCode}.png`,
      );
      toast.success('زائر کارت با موفقیت دانلود شد');
      return true;
    } catch {
      toast.error('دانلود زائر کارت انجام نشد. لطفاً دوباره تلاش کنید.');
      return false;
    } finally {
      setDownloading(false);
    }
  }, [reservation.trackingCode]);

  useEffect(() => {
    if (!autoDownload || autoDownloadDoneRef.current) return;

    let cancelled = false;

    const runAutoDownload = async () => {
      for (let attempt = 0; attempt < 30 && !cancelled; attempt += 1) {
        if (cardShellRef.current) break;
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });
      }

      if (cancelled || autoDownloadDoneRef.current || !cardShellRef.current) {
        return;
      }

      autoDownloadDoneRef.current = true;
      await handleDownload();
    };

    void runAutoDownload();

    return () => {
      cancelled = true;
    };
  }, [autoDownload, handleDownload]);

  return (
    <>
      <PilgrimCardCapture reservation={reservation} cardShellRef={cardShellRef} />
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
