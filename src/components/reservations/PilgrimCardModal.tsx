import { useEffect, useRef } from 'react';
import { Modal } from '../Modal';
import type { Reservation } from '../../types';
import { btnSecondary } from '../../lib/styles';
import { PilgrimCardDownloadButton } from './PilgrimCardDownloadButton';
import { PilgrimCardScreenView } from './PilgrimCardScreenView';

const modalDownloadBtn = `${btnSecondary} inline-flex !min-h-8 items-center justify-center gap-1.5 !px-2.5 !py-1.5 !text-[11px] sm:!text-xs`;

interface PilgrimCardModalProps {
  open: boolean;
  onClose: () => void;
  reservation: Reservation | null;
}

export function PilgrimCardModal({
  open,
  onClose,
  reservation,
}: PilgrimCardModalProps) {
  const cardWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !reservation) return;

    const measure = () => {
      const wrap = cardWrapRef.current;
      const shell = wrap?.querySelector('.pilgrim-card-shell') as HTMLElement | null;
      const modalBody = wrap?.closest('[class*="overflow-y-auto"]') as HTMLElement | null;
      const viewportH = window.innerHeight;
      const cardH = shell?.offsetHeight ?? 0;
      const modalBodyH = modalBody?.clientHeight ?? 0;
      const modalScrollH = modalBody?.scrollHeight ?? 0;
      const pageScrollH = document.documentElement.scrollHeight;
      const pageClientH = document.documentElement.clientHeight;

      // #region agent log
      fetch('http://127.0.0.1:7929/ingest/64824c4b-ac44-41b9-87b8-d1ea5f1d3aa4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '06086f' },
        body: JSON.stringify({
          sessionId: '06086f',
          location: 'PilgrimCardModal.tsx:measure',
          message: 'pilgrim card modal layout',
          data: {
            compact: true,
            cardH,
            cardW: shell?.offsetWidth ?? 0,
            modalBodyH,
            modalScrollH,
            modalOverflows: modalScrollH > modalBodyH,
            viewportH,
            pageOverflows: pageScrollH > pageClientH,
          },
          timestamp: Date.now(),
          runId: 'post-fix',
          hypothesisId: 'H1-H3',
        }),
      }).catch(() => {});
      // #endregion
    };

    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [open, reservation]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="زائر کارت"
      size="md"
      headerActions={
        reservation ? (
          <PilgrimCardDownloadButton
            reservation={reservation}
            className={modalDownloadBtn}
          />
        ) : null
      }
    >
      {reservation ? (
        <div ref={cardWrapRef} className="flex justify-center py-0">
          <PilgrimCardScreenView
            reservation={reservation}
            showPrintButton={false}
            compact
          />
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-slate-500">
          اطلاعات زائر کارت در دسترس نیست.
        </p>
      )}
    </Modal>
  );
}
