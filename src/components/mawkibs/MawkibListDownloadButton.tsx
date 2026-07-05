import { useState } from 'react';
import { Modal } from '../Modal';
import { NavIcon } from '../ui/NavIcons';
import { btnPrimary, btnSecondary } from '../../lib/styles';
import { toast } from '../../lib/toast';
import {
  buildMawkibExcelExport,
  buildMawkibTextExport,
  computeMawkibListStats,
  downloadMawkibExport,
  mapMawkibsToExportRows,
  mawkibExportFilename,
  type MawkibExportOptions,
} from '../../lib/mawkib-list-export';
import type { Mawkib } from '../../types';

const actionBtnClass =
  'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition sm:text-sm';

interface MawkibListDownloadButtonProps {
  loadMawkibs: () => Promise<Mawkib[]>;
  exportOptions?: MawkibExportOptions;
  disabled?: boolean;
}

export function MawkibListDownloadButton({
  loadMawkibs,
  exportOptions = {},
  disabled = false,
}: MawkibListDownloadButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDownload = async (format: 'text' | 'excel') => {
    setLoading(true);
    try {
      const mawkibs = await loadMawkibs();
      if (mawkibs.length === 0) {
        toast.error('موکبی برای دانلود وجود ندارد');
        return;
      }

      const rows = mapMawkibsToExportRows(mawkibs, exportOptions);
      const stats = computeMawkibListStats(mawkibs);

      if (format === 'text') {
        downloadMawkibExport(
          buildMawkibTextExport(rows, stats, exportOptions),
          mawkibExportFilename('txt'),
          'text/plain;charset=utf-8',
        );
      } else {
        downloadMawkibExport(
          `\uFEFF${buildMawkibExcelExport(rows, stats, exportOptions)}`,
          mawkibExportFilename('xls'),
          'application/vnd.ms-excel;charset=utf-8',
        );
      }

      setOpen(false);
      toast.success('فایل با موفقیت دانلود شد');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا در دانلود موکب‌ها');
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
        {loading ? 'در حال آماده‌سازی...' : 'دانلود موکب‌ها'}
      </button>

      <Modal open={open} onClose={() => !loading && setOpen(false)} title="دانلود موکب‌ها">
        <p className="mb-4 text-sm text-slate-600">
          فرمت خروجی را انتخاب کنید. موکب‌ها مطابق فیلترهای اعمال‌شده (یا همه موکب‌ها در
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
