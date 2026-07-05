import { Modal } from '../Modal';
import { MawkibPublicDetail } from './MawkibPublicDetail';
import type { Mawkib } from '../../types';

interface MawkibPublicDetailModalProps {
  open: boolean;
  onClose: () => void;
  mawkib: Mawkib | null;
  onViewCapacity?: () => void;
}

export function MawkibPublicDetailModal({
  open,
  onClose,
  mawkib,
  onViewCapacity,
}: MawkibPublicDetailModalProps) {
  if (!mawkib) return null;

  return (
    <Modal open={open} onClose={onClose} title={mawkib.name} size="xl">
      <div className="max-h-[min(70vh,40rem)] overflow-y-auto overscroll-contain">
        <MawkibPublicDetail mawkib={mawkib} onViewCapacity={onViewCapacity} />
      </div>
    </Modal>
  );
}
