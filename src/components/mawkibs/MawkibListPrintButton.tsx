import { useEffect, useId, useState } from 'react';
import { NavIcon } from '../ui/NavIcons';
import { formatPersianNumber } from '../../lib/capacity';
import {
  computeMawkibListStats,
  exportHeader,
  exportRowValues,
  mapMawkibsToExportRows,
  type MawkibExportOptions,
} from '../../lib/mawkib-list-export';
import { toast } from '../../lib/toast';
import type { Mawkib } from '../../types';
import vazirWoff2 from '../../assets/fonts/Vazir.woff2';
import vazirMediumWoff2 from '../../assets/fonts/Vazir-Medium.woff2';
import vazirBoldWoff2 from '../../assets/fonts/Vazir-Bold.woff2';

const PRINT_BODY_CLASS = 'printing-mawkib-list';
const actionBtnClass =
  'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition sm:text-sm';

interface MawkibListPrintButtonProps {
  loadMawkibs: () => Promise<Mawkib[]>;
  exportOptions?: MawkibExportOptions;
  title?: string;
  disabled?: boolean;
}

function MawkibListPrintContent({
  mawkibs,
  title,
  exportOptions,
}: {
  mawkibs: Mawkib[];
  title: string;
  exportOptions: MawkibExportOptions;
}) {
  const rows = mapMawkibsToExportRows(mawkibs, exportOptions);
  const stats = computeMawkibListStats(mawkibs);
  const generatedAt = new Date().toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const headers = exportHeader(exportOptions);

  return (
    <div className="mawkib-list-print">
      <header className="mawkib-list-print__header">
        <div className="mawkib-list-print__header-main">
          <p className="mawkib-list-print__eyebrow">سامانه موکب</p>
          <h1 className="mawkib-list-print__title">{title}</h1>
          <p className="mawkib-list-print__meta">تاریخ تهیه: {generatedAt}</p>
        </div>
        <div className="mawkib-list-print__badge">
          {formatPersianNumber(stats.total)} موکب
        </div>
      </header>

      <div className="mawkib-list-print__divider" aria-hidden>
        <span className="mawkib-list-print__divider-line" />
        <span className="mawkib-list-print__divider-diamond" />
        <span className="mawkib-list-print__divider-line" />
      </div>

      <div className="mawkib-list-print__table-wrap">
        <table className="mawkib-list-print__table">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const values = exportRowValues(row, exportOptions);
              return (
                <tr key={row.index}>
                  {values.map((value, cellIndex) => (
                    <td
                      key={`${row.index}-${cellIndex}`}
                      dir={
                        headers[cellIndex]?.includes('موبایل') ||
                        headers[cellIndex]?.includes('تلفن') ||
                        headers[cellIndex]?.includes('جغرافی') ||
                        headers[cellIndex]?.includes('وب')
                          ? 'ltr'
                          : undefined
                      }
                    >
                      {cellIndex === 0
                        ? formatPersianNumber(row.index)
                        : value}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="mawkib-list-print__footer">
        <div className="mawkib-list-print__stat mawkib-list-print__stat--total">
          <span className="mawkib-list-print__stat-label">تعداد کل موکب‌ها</span>
          <strong>{formatPersianNumber(stats.total)}</strong>
          <span className="mawkib-list-print__stat-line" aria-hidden />
        </div>
        <div className="mawkib-list-print__stat mawkib-list-print__stat--approved">
          <span className="mawkib-list-print__stat-label">تأیید شده</span>
          <strong>{formatPersianNumber(stats.approvedCount)}</strong>
          <span className="mawkib-list-print__stat-line" aria-hidden />
        </div>
        <div className="mawkib-list-print__stat mawkib-list-print__stat--pending">
          <span className="mawkib-list-print__stat-label">در انتظار</span>
          <strong>{formatPersianNumber(stats.pendingCount)}</strong>
          <span className="mawkib-list-print__stat-line" aria-hidden />
        </div>
      </footer>
    </div>
  );
}

export function MawkibListPrintButton({
  loadMawkibs,
  exportOptions = {},
  title = 'لیست موکب‌ها',
  disabled = false,
}: MawkibListPrintButtonProps) {
  const printRootId = useId().replace(/:/g, '');
  const [printMawkibs, setPrintMawkibs] = useState<Mawkib[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!printMawkibs?.length) return;

    document.body.classList.add(PRINT_BODY_CLASS);
    const frame = window.requestAnimationFrame(() => {
      window.print();
      window.setTimeout(() => {
        document.body.classList.remove(PRINT_BODY_CLASS);
        setPrintMawkibs(null);
      }, 500);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.classList.remove(PRINT_BODY_CLASS);
    };
  }, [printMawkibs]);

  const handlePrint = async () => {
    setLoading(true);
    try {
      const mawkibs = await loadMawkibs();
      if (mawkibs.length === 0) {
        toast.error('موکبی برای چاپ وجود ندارد');
        return;
      }
      setPrintMawkibs(mawkibs);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا در آماده‌سازی چاپ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        #${printRootId} { display: none; }
        @media print {
          @font-face { font-family: Vazir; src: url('${vazirWoff2}') format('woff2'); font-weight: 400; }
          @font-face { font-family: Vazir; src: url('${vazirMediumWoff2}') format('woff2'); font-weight: 500; }
          @font-face { font-family: Vazir; src: url('${vazirBoldWoff2}') format('woff2'); font-weight: 700; }
          body.${PRINT_BODY_CLASS} * { visibility: hidden !important; }
          body.${PRINT_BODY_CLASS} #${printRootId},
          body.${PRINT_BODY_CLASS} #${printRootId} * { visibility: visible !important; }
          body.${PRINT_BODY_CLASS} #${printRootId} {
            display: block !important;
            position: absolute;
            inset: 0;
            padding: 8mm 10mm;
            background: #fff;
          }
          @page { size: A4 landscape; margin: 6mm; }
          .mawkib-list-print {
            font-family: Vazir, Tahoma, sans-serif;
            color: #1e293b;
            direction: rtl;
          }
          .mawkib-list-print__header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 10mm;
            margin-bottom: 4mm;
          }
          .mawkib-list-print__eyebrow {
            margin: 0 0 2mm;
            font-size: 9pt;
            color: #64748b;
            font-weight: 600;
          }
          .mawkib-list-print__title {
            margin: 0;
            font-size: 20pt;
            font-weight: 800;
            color: #1a2744;
          }
          .mawkib-list-print__meta {
            margin: 2.5mm 0 0;
            font-size: 9pt;
            color: #64748b;
          }
          .mawkib-list-print__badge {
            padding: 2.5mm 4mm;
            border-radius: 3mm;
            background: #f1f5f9;
            border: 0.2mm solid #e2e8f0;
            font-size: 10pt;
            font-weight: 700;
            white-space: nowrap;
          }
          .mawkib-list-print__divider {
            display: flex;
            align-items: center;
            gap: 2mm;
            margin-bottom: 5mm;
          }
          .mawkib-list-print__divider-line {
            flex: 1;
            height: 0.35mm;
            background: #14b8a6;
          }
          .mawkib-list-print__divider-diamond {
            width: 2.5mm;
            height: 2.5mm;
            background: #14b8a6;
            transform: rotate(45deg);
          }
          .mawkib-list-print__table-wrap {
            overflow: hidden;
            border-radius: 3mm;
            border: 0.2mm solid #dbeafe;
          }
          .mawkib-list-print__table {
            width: 100%;
            border-collapse: collapse;
            font-size: 6.5pt;
          }
          .mawkib-list-print__table th {
            padding: 1.8mm 1mm;
            background: #1a2744;
            color: #fff;
            font-weight: 700;
            text-align: center;
            white-space: nowrap;
          }
          .mawkib-list-print__table td {
            padding: 1.6mm 1mm;
            text-align: center;
            color: #334155;
            max-width: 28mm;
            word-break: break-word;
          }
          .mawkib-list-print__table tbody tr:nth-child(even) td {
            background: #f1f5f9;
          }
          .mawkib-list-print__footer {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 4mm;
            margin-top: 8mm;
          }
          .mawkib-list-print__stat {
            padding: 4mm 3mm 3.5mm;
            border-radius: 3mm;
            border: 0.25mm solid #e2e8f0;
            text-align: center;
          }
          .mawkib-list-print__stat-label {
            display: block;
            margin-bottom: 2mm;
            font-size: 9pt;
            font-weight: 600;
            color: #64748b;
          }
          .mawkib-list-print__stat strong {
            display: block;
            font-size: 18pt;
            font-weight: 800;
            color: #0f172a;
          }
          .mawkib-list-print__stat-line {
            display: block;
            width: 14mm;
            height: 0.8mm;
            margin: 2.5mm auto 0;
            border-radius: 999px;
          }
          .mawkib-list-print__stat--total .mawkib-list-print__stat-line { background: #7c3aed; }
          .mawkib-list-print__stat--approved .mawkib-list-print__stat-line { background: #2563eb; }
          .mawkib-list-print__stat--pending .mawkib-list-print__stat-line { background: #14b8a6; }
        }
      `}</style>

      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => void handlePrint()}
        className={`${actionBtnClass} border-[#c5d4e8] bg-[#f0f4fa] text-[#4a6fa5] hover:bg-[#e8eef6] disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <NavIcon name="print" className="h-4 w-4 shrink-0" />
        {loading ? 'در حال آماده‌سازی...' : 'چاپ موکب‌ها'}
      </button>

      <div id={printRootId} aria-hidden>
        {printMawkibs && (
          <MawkibListPrintContent
            mawkibs={printMawkibs}
            title={title}
            exportOptions={exportOptions}
          />
        )}
      </div>
    </>
  );
}
