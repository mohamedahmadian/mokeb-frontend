import { useEffect, useId, useState } from 'react';
import { GuestCountBadges } from './GuestCountBadges';
import { NavIcon } from '../ui/NavIcons';
import { formatPersianNumber } from '../../lib/capacity';
import {
  computeReservationListStats,
  mapReservationsToExportRows,
  reservationExportHeader,
  reservationExportRowValues,
  type ReservationExportOptions,
} from '../../lib/reservation-list-export';
import { toast } from '../../lib/toast';
import type { Reservation } from '../../types';
import vazirWoff2 from '../../assets/fonts/Vazir.woff2';
import vazirMediumWoff2 from '../../assets/fonts/Vazir-Medium.woff2';
import vazirBoldWoff2 from '../../assets/fonts/Vazir-Bold.woff2';

const PRINT_BODY_CLASS = 'printing-reservation-list';
const actionBtnClass =
  'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition sm:text-sm';

interface ReservationListPrintButtonProps {
  loadReservations: () => Promise<Reservation[]>;
  exportOptions?: ReservationExportOptions;
  title?: string;
  disabled?: boolean;
}

function ReservationListPrintContent({
  reservations,
  title,
  exportOptions,
}: {
  reservations: Reservation[];
  title: string;
  exportOptions: ReservationExportOptions;
}) {
  const rows = mapReservationsToExportRows(reservations, exportOptions);
  const stats = computeReservationListStats(reservations);
  const generatedAt = new Date().toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const headers = reservationExportHeader(exportOptions);
  const countColumnIndex = headers.indexOf('تعداد');

  return (
    <div className="reservation-list-print">
      <header className="reservation-list-print__header">
        <div className="reservation-list-print__header-main">
          <p className="reservation-list-print__eyebrow">سامانه موکب</p>
          <h1 className="reservation-list-print__title">{title}</h1>
          <p className="reservation-list-print__meta">تاریخ تهیه: {generatedAt}</p>
        </div>
        <div className="reservation-list-print__badge">
          {formatPersianNumber(stats.total)} رزرو
        </div>
      </header>

      <div className="reservation-list-print__divider" aria-hidden>
        <span className="reservation-list-print__divider-line" />
        <span className="reservation-list-print__divider-diamond" />
        <span className="reservation-list-print__divider-line" />
      </div>

      <div className="reservation-list-print__table-wrap">
        <table className="reservation-list-print__table">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const values = reservationExportRowValues(row, exportOptions);
              const reservation = reservations[rowIndex];
              return (
                <tr key={row.index}>
                  {values.map((value, cellIndex) => (
                    <td
                      key={`${row.index}-${cellIndex}`}
                      dir={
                        cellIndex === 1 || headers[cellIndex] === 'موبایل'
                          ? 'ltr'
                          : undefined
                      }
                      className={
                        cellIndex === countColumnIndex
                          ? 'reservation-list-print__count-cell'
                          : undefined
                      }
                    >
                      {cellIndex === 0 ? (
                        formatPersianNumber(row.index)
                      ) : cellIndex === countColumnIndex ? (
                        <GuestCountBadges
                          male={reservation.maleGuestCount}
                          female={reservation.femaleGuestCount}
                          showTooltip={false}
                          className="mx-auto justify-center"
                        />
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="reservation-list-print__footer">
        <div className="reservation-list-print__stat reservation-list-print__stat--total">
          <span className="reservation-list-print__stat-label">تعداد کل رزروها</span>
          <strong>{formatPersianNumber(stats.total)}</strong>
          <span className="reservation-list-print__stat-line" aria-hidden />
        </div>
        <div className="reservation-list-print__stat reservation-list-print__stat--confirmed">
          <span className="reservation-list-print__stat-label">تأیید شده</span>
          <strong>{formatPersianNumber(stats.confirmedCount)}</strong>
          <span className="reservation-list-print__stat-line" aria-hidden />
        </div>
        <div className="reservation-list-print__stat reservation-list-print__stat--pending">
          <span className="reservation-list-print__stat-label">در انتظار</span>
          <strong>{formatPersianNumber(stats.pendingCount)}</strong>
          <span className="reservation-list-print__stat-line" aria-hidden />
        </div>
      </footer>
    </div>
  );
}

export function ReservationListPrintButton({
  loadReservations,
  exportOptions = {},
  title = 'لیست رزروها',
  disabled = false,
}: ReservationListPrintButtonProps) {
  const printRootId = useId().replace(/:/g, '');
  const [printReservations, setPrintReservations] = useState<Reservation[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!printReservations?.length) return;

    document.body.classList.add(PRINT_BODY_CLASS);
    const frame = window.requestAnimationFrame(() => {
      window.print();
      window.setTimeout(() => {
        document.body.classList.remove(PRINT_BODY_CLASS);
        setPrintReservations(null);
      }, 500);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.classList.remove(PRINT_BODY_CLASS);
    };
  }, [printReservations]);

  const handlePrint = async () => {
    setLoading(true);
    try {
      const reservations = await loadReservations();
      if (reservations.length === 0) {
        toast.error('رزروی برای چاپ وجود ندارد');
        return;
      }
      setPrintReservations(reservations);
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
          @page { size: A4 landscape; margin: 8mm; }
          .reservation-list-print {
            font-family: Vazir, Tahoma, sans-serif;
            color: #1e293b;
            direction: rtl;
          }
          .reservation-list-print__header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 10mm;
            margin-bottom: 4mm;
          }
          .reservation-list-print__eyebrow {
            margin: 0 0 2mm;
            font-size: 9pt;
            color: #64748b;
            font-weight: 600;
          }
          .reservation-list-print__title {
            margin: 0;
            font-size: 20pt;
            font-weight: 800;
            color: #1a2744;
          }
          .reservation-list-print__meta {
            margin: 2.5mm 0 0;
            font-size: 9pt;
            color: #64748b;
          }
          .reservation-list-print__badge {
            padding: 2.5mm 4mm;
            border-radius: 3mm;
            background: #f1f5f9;
            border: 0.2mm solid #e2e8f0;
            font-size: 10pt;
            font-weight: 700;
            white-space: nowrap;
          }
          .reservation-list-print__divider {
            display: flex;
            align-items: center;
            gap: 2mm;
            margin-bottom: 5mm;
          }
          .reservation-list-print__divider-line {
            flex: 1;
            height: 0.35mm;
            background: #14b8a6;
          }
          .reservation-list-print__divider-diamond {
            width: 2.5mm;
            height: 2.5mm;
            background: #14b8a6;
            transform: rotate(45deg);
          }
          .reservation-list-print__table-wrap {
            overflow: hidden;
            border-radius: 3mm;
            border: 0.2mm solid #dbeafe;
          }
          .reservation-list-print__table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
          }
          .reservation-list-print__table th {
            padding: 2.5mm 1.5mm;
            background: #1a2744;
            color: #fff;
            font-weight: 700;
            text-align: center;
          }
          .reservation-list-print__table td {
            padding: 2.2mm 1.5mm;
            text-align: center;
            color: #334155;
          }
          .reservation-list-print__count-cell {
            vertical-align: middle;
          }
          .reservation-list-print__count-cell * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .reservation-list-print__table tbody tr:nth-child(even) td {
            background: #f1f5f9;
          }
          .reservation-list-print__footer {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 4mm;
            margin-top: 8mm;
          }
          .reservation-list-print__stat {
            padding: 4mm 3mm 3.5mm;
            border-radius: 3mm;
            border: 0.25mm solid #e2e8f0;
            text-align: center;
          }
          .reservation-list-print__stat-label {
            display: block;
            margin-bottom: 2mm;
            font-size: 9pt;
            font-weight: 600;
            color: #64748b;
          }
          .reservation-list-print__stat strong {
            display: block;
            font-size: 18pt;
            font-weight: 800;
            color: #0f172a;
          }
          .reservation-list-print__stat-line {
            display: block;
            width: 14mm;
            height: 0.8mm;
            margin: 2.5mm auto 0;
            border-radius: 999px;
          }
          .reservation-list-print__stat--total .reservation-list-print__stat-line { background: #7c3aed; }
          .reservation-list-print__stat--confirmed .reservation-list-print__stat-line { background: #2563eb; }
          .reservation-list-print__stat--pending .reservation-list-print__stat-line { background: #14b8a6; }
        }
      `}</style>

      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => void handlePrint()}
        className={`${actionBtnClass} border-[#c5d4e8] bg-[#f0f4fa] text-[#4a6fa5] hover:bg-[#e8eef6] disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <NavIcon name="print" className="h-4 w-4 shrink-0" />
        {loading ? 'در حال آماده‌سازی...' : 'چاپ رزروها'}
      </button>

      <div id={printRootId} aria-hidden>
        {printReservations && (
          <ReservationListPrintContent
            reservations={printReservations}
            title={title}
            exportOptions={exportOptions}
          />
        )}
      </div>
    </>
  );
}
