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
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="زائر کارت"
      size="lg"
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
        <div className="flex justify-center pb-1">
          <PilgrimCardScreenView reservation={reservation} showPrintButton={false} />
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-slate-500">
          اطلاعات زائر کارت در دسترس نیست.
        </p>
      )}
    </Modal>
  );
}
