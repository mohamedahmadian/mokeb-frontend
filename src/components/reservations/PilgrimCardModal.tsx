import { Modal } from '../Modal';
import type { Reservation } from '../../types';
import { PilgrimCardScreenView } from './PilgrimCardScreenView';

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
    <Modal open={open} onClose={onClose} title="زائر کارت" size="lg">
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
