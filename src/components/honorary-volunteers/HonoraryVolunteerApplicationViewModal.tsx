import { Modal } from '../Modal';
import { HonoraryVolunteerApplicationDetails } from './HonoraryVolunteerApplicationDetails';
import { HonoraryVolunteerTrackingHeader } from './HonoraryVolunteerTrackingHeader';
import { btnDanger, btnPrimary, btnSecondary } from '../../lib/styles';
import type { HonoraryVolunteerApplication } from '../../types';

interface HonoraryVolunteerApplicationViewModalProps {
  open: boolean;
  application: HonoraryVolunteerApplication | null;
  onClose: () => void;
  onEdit?: (application: HonoraryVolunteerApplication) => void;
  onCancel?: (id: number) => void;
  cancelling?: boolean;
}

export function HonoraryVolunteerApplicationViewModal({
  open,
  application,
  onClose,
  onEdit,
  onCancel,
  cancelling = false,
}: HonoraryVolunteerApplicationViewModalProps) {
  if (!application) return null;

  const isPending = application.status === 'Pending';

  return (
    <Modal open={open} onClose={onClose} title="جزئیات درخواست خادم‌یاری" size="lg">
      <HonoraryVolunteerApplicationDetails
        application={application}
        showPersonalInfo
        showTrackingHeader={
          <HonoraryVolunteerTrackingHeader trackingCode={application.trackingCode} compact />
        }
      />

      <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className={`${btnSecondary} w-full sm:w-auto`}>
          بستن
        </button>
        {isPending && onEdit && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(application);
            }}
            className={`${btnPrimary} w-full sm:w-auto`}
          >
            ویرایش درخواست
          </button>
        )}
        {isPending && onCancel && (
          <button
            type="button"
            disabled={cancelling}
            onClick={() => onCancel(application.id)}
            className={`${btnDanger} w-full sm:w-auto`}
          >
            {cancelling ? 'در حال لغو...' : 'لغو درخواست'}
          </button>
        )}
      </div>
    </Modal>
  );
}
