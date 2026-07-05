import { useState } from 'react';
import { Modal } from '../Modal';
import { NavIcon } from '../ui/NavIcons';
import { btnPrimary, btnSecondary } from '../../lib/styles';
import { toast } from '../../lib/toast';
import {
  buildPilgrimExcelExport,
  buildPilgrimTextExport,
  computePilgrimListStats,
  downloadPilgrimExport,
  mapPilgrimsToExportRows,
  pilgrimExportFilename,
} from '../../lib/pilgrim-list-export';
import type { AdminUser } from '../../types';

const actionBtnClass =
  'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition sm:text-sm';

interface PilgrimListDownloadButtonProps {
  loadPilgrims: () => Promise<AdminUser[]>;
  disabled?: boolean;
}

export function PilgrimListDownloadButton({
  loadPilgrims,
  disabled = false,
}: PilgrimListDownloadButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDownload = async (format: 'text' | 'excel') => {
    setLoading(true);
    try {
      const pilgrims = await loadPilgrims();
      if (pilgrims.length === 0) {
        toast.error('زائری برای دانلود وجود ندارد');
        return;
      }

      const rows = mapPilgrimsToExportRows(pilgrims);
      const stats = computePilgrimListStats(rows);

      if (format === 'text') {
        const content = buildPilgrimTextExport(rows, stats);
        downloadPilgrimExport(
          content,
          pilgrimExportFilename('txt'),
          'text/plain;charset=utf-8',
        );
      } else {
        const content = `\uFEFF${buildPilgrimExcelExport(rows, stats)}`;
        downloadPilgrimExport(
          content,
          pilgrimExportFilename('xls'),
          'application/vnd.ms-excel;charset=utf-8',
        );
      }

      setOpen(false);
      toast.success('فایل با موفقیت دانلود شد');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا در دانلود زائرین');
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
        {loading ? 'در حال آماده‌سازی...' : 'دانلود زائرین'}
      </button>

      <Modal open={open} onClose={() => !loading && setOpen(false)} title="دانلود زائرین">
        <p className="mb-4 text-sm text-slate-600">
          فرمت خروجی را انتخاب کنید. زائرین مطابق فیلترهای اعمال‌شده (یا همه زائرین در
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
