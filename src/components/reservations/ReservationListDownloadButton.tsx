import { useState } from 'react';
import { Modal } from '../Modal';
import { NavIcon } from '../ui/NavIcons';
import { btnPrimary, btnSecondary } from '../../lib/styles';
import { toast } from '../../lib/toast';
import {
  buildReservationExcelExport,
  buildReservationTextExport,
  computeReservationListStats,
  downloadReservationExport,
  mapReservationsToExportRows,
  reservationExportFilename,
  type ReservationExportOptions,
} from '../../lib/reservation-list-export';
import type { Reservation } from '../../types';

const actionBtnClass =
  'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition sm:text-sm';

interface ReservationListDownloadButtonProps {
  loadReservations: () => Promise<Reservation[]>;
  exportOptions?: ReservationExportOptions;
  disabled?: boolean;
}

export function ReservationListDownloadButton({
  loadReservations,
  exportOptions = {},
  disabled = false,
}: ReservationListDownloadButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDownload = async (format: 'text' | 'excel') => {
    setLoading(true);
    try {
      const reservations = await loadReservations();
      if (reservations.length === 0) {
        toast.error('رزروی برای دانلود وجود ندارد');
        return;
      }

      const rows = mapReservationsToExportRows(reservations, exportOptions);
      const stats = computeReservationListStats(reservations);

      if (format === 'text') {
        downloadReservationExport(
          buildReservationTextExport(rows, stats, exportOptions),
          reservationExportFilename('txt'),
          'text/plain;charset=utf-8',
        );
      } else {
        downloadReservationExport(
          `\uFEFF${buildReservationExcelExport(rows, stats, exportOptions)}`,
          reservationExportFilename('xls'),
          'application/vnd.ms-excel;charset=utf-8',
        );
      }

      setOpen(false);
      toast.success('فایل با موفقیت دانلود شد');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا در دانلود رزروها');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen(true)}
        className={`${actionBtnClass} border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <NavIcon name="download" className="h-4 w-4 shrink-0" />
        {loading ? 'در حال آماده‌سازی...' : 'دانلود لیست رزروها'}
      </button>

      <Modal
        open={open}
        onClose={() => !loading && setOpen(false)}
        title="دانلود لیست رزروها"
      >
        <p className="mb-4 text-sm text-slate-600">
          فرمت خروجی را انتخاب کنید. رزروها مطابق فیلترهای اعمال‌شده (یا همه رزروها در
          صورت نبود فیلتر) دانلود می‌شوند.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={loading}
            className={`${btnSecondary} w-full sm:w-auto`}
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={() => void handleDownload('text')}
            disabled={loading}
            className={`${btnSecondary} w-full sm:w-auto`}
          >
            فایل متنی (.txt)
          </button>
          <button
            type="button"
            onClick={() => void handleDownload('excel')}
            disabled={loading}
            className={`${btnPrimary} w-full sm:w-auto`}
          >
            {loading ? 'در حال آماده‌سازی...' : 'فایل اکسل (.xls)'}
          </button>
        </div>
      </Modal>
    </>
  );
}
