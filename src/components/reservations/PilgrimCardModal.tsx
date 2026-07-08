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
  /** بالاتر از مودال‌های معمولی — برای نمایش روی مودال موفقیت رزرو */
  elevated?: boolean;
  /** متن اطلاع‌رسانی بالای زائر کارت */
  notice?: string;
}

export function PilgrimCardModal({
  open,
  onClose,
  reservation,
  elevated = false,
  notice,
}: PilgrimCardModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="زائر کارت"
      size="md"
      elevated={elevated}
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
        <div className="space-y-4">
          {notice ? (
            <p className="rounded-xl border border-[#c5d4e8] bg-gradient-to-b from-[#f0f4fa] to-white px-4 py-3 text-sm leading-relaxed text-slate-700">
              {notice}
            </p>
          ) : null}
          <div className="flex justify-center py-0">
            <PilgrimCardScreenView
              reservation={reservation}
              showPrintButton={false}
              compact
            />
          </div>
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-slate-500">
          اطلاعات زائر کارت در دسترس نیست.
        </p>
      )}
    </Modal>
  );
}
