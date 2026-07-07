import { useEffect, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { PilgrimCardCapture } from '../components/reservations/PilgrimCardCapture';
import type { Reservation } from '../types';
import { downloadPilgrimCardImage } from './pilgrim-card-download';

function AutoDownloadCapture({
  reservation,
  onCaptured,
}: {
  reservation: Reservation;
  onCaptured: (element: HTMLDivElement) => void;
}) {
  const cardShellRef = useRef<HTMLDivElement>(null);
  const capturedRef = useRef(false);

  useEffect(() => {
    if (capturedRef.current) return;

    let cancelled = false;

    const run = async () => {
      for (let attempt = 0; attempt < 40 && !cancelled; attempt += 1) {
        if (cardShellRef.current) break;
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });
      }

      if (cancelled || capturedRef.current || !cardShellRef.current) return;

      capturedRef.current = true;
      onCaptured(cardShellRef.current);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [onCaptured]);

  return (
    <PilgrimCardCapture reservation={reservation} cardShellRef={cardShellRef} />
  );
}

/**
 * Render an off-screen card, capture it, and download — intended to run
 * inside the submit click handler chain so the browser treats it as user-initiated.
 */
export async function downloadPilgrimCardForReservation(
  reservation: Reservation,
): Promise<void> {
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText =
    'position:fixed;left:-10000px;top:0;z-index:-1;pointer-events:none;';
  document.body.appendChild(host);

  let root: Root | null = createRoot(host);

  try {
    await new Promise<void>((resolve, reject) => {
      const handleCaptured = async (element: HTMLDivElement) => {
        try {
          await downloadPilgrimCardImage(
            element,
            `zaeer-kart-${reservation.trackingCode}.png`,
          );
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      root!.render(
        <AutoDownloadCapture
          reservation={reservation}
          onCaptured={handleCaptured}
        />,
      );
    });
  } finally {
    root?.unmount();
    root = null;
    host.remove();
  }
}
