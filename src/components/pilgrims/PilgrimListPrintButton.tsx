import { useEffect, useId, useState, type ReactNode } from 'react';
import { NavIcon } from '../ui/NavIcons';
import { formatPersianNumber } from '../../lib/capacity';
import {
  computePilgrimListStats,
  mapPilgrimsToExportRows,
} from '../../lib/pilgrim-list-export';
import { toast } from '../../lib/toast';
import type { AdminUser } from '../../types';
import { userGenderLabel } from '../../lib/user-gender';
import vazirWoff2 from '../../assets/fonts/Vazir.woff2';
import vazirMediumWoff2 from '../../assets/fonts/Vazir-Medium.woff2';
import vazirBoldWoff2 from '../../assets/fonts/Vazir-Bold.woff2';

const PRINT_BODY_CLASS = 'printing-pilgrim-list';
const actionBtnClass =
  'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition sm:text-sm';

interface PilgrimListPrintButtonProps {
  loadPilgrims: () => Promise<AdminUser[]>;
  title?: string;
  disabled?: boolean;
}

function PrintIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 9V4.5A1.5 1.5 0 017.5 3h9A1.5 1.5 0 0118 4.5V9M6 15H4.5A1.5 1.5 0 003 13.5v-3A1.5 1.5 0 014.5 9H19.5A1.5 1.5 0 0121 10.5v3A1.5 1.5 0 0119.5 15H18M6 19.5V15h12v4.5A1.5 1.5 0 0016.5 21h-9A1.5 1.5 0 006 19.5z"
      />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 3v2m8-2v2M4.5 9h15M6 5.25h12A1.75 1.75 0 0119.75 7v11.5A1.75 1.75 0 0118 7.75H6A1.75 1.75 0 014.25 6V7A1.75 1.75 0 016 5.25z"
      />
    </svg>
  );
}

function BrandIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className="pilgrim-list-print__brand-icon">
      <rect x="4" y="14" width="24" height="14" rx="2" fill="#14b8a6" opacity="0.25" />
      <path
        d="M16 5L28 16H4L16 5Z"
        fill="#14b8a6"
        stroke="#0f766e"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <rect x="13" y="18" width="6" height="10" rx="1" fill="#0f766e" />
    </svg>
  );
}

function StatCard({
  tone,
  icon,
  label,
  value,
}: {
  tone: 'total' | 'male' | 'female';
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className={`pilgrim-list-print__stat pilgrim-list-print__stat--${tone}`}>
      <div className="pilgrim-list-print__stat-head">
        <span className="pilgrim-list-print__stat-icon">{icon}</span>
        <span className="pilgrim-list-print__stat-label">{label}</span>
      </div>
      <strong>{formatPersianNumber(value)}</strong>
      <span className="pilgrim-list-print__stat-line" aria-hidden />
    </div>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 19v-1.5a3.5 3.5 0 00-3.5-3.5h-1A3.5 3.5 0 008 17.5V19M12 12.5a3 3 0 100-6 3 3 0 000 6zM19 19v-1.5a3.5 3.5 0 00-2.2-3.25M17 8.75a2.75 2.75 0 110-5.5 2.75 2.75 0 010 5.5z"
      />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 12.5a3.25 3.25 0 100-6.5 3.25 3.25 0 000 6.5zM6.5 19v-1.25a5.5 5.5 0 0111 0V19"
      />
    </svg>
  );
}

function PilgrimListPrintContent({
  pilgrims,
  title,
}: {
  pilgrims: AdminUser[];
  title: string;
}) {
  const rows = mapPilgrimsToExportRows(pilgrims);
  const stats = computePilgrimListStats(rows);
  const generatedAt = new Date().toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="pilgrim-list-print">
      <header className="pilgrim-list-print__header">
        <div className="pilgrim-list-print__header-main">
          <div className="pilgrim-list-print__brand">
            <BrandIcon />
            <span>سامانه موکب</span>
          </div>
          <h1 className="pilgrim-list-print__title">{title}</h1>
          <p className="pilgrim-list-print__meta">
            <CalendarIcon className="pilgrim-list-print__meta-icon" />
            <span>تاریخ تهیه: {generatedAt}</span>
          </p>
        </div>
        <div className="pilgrim-list-print__badge">
          <PrintIcon className="pilgrim-list-print__badge-icon" />
          <span>{formatPersianNumber(stats.total)} زائر</span>
        </div>
      </header>

      <div className="pilgrim-list-print__divider" aria-hidden>
        <span className="pilgrim-list-print__divider-line" />
        <span className="pilgrim-list-print__divider-diamond" />
        <span className="pilgrim-list-print__divider-line" />
      </div>

      <div className="pilgrim-list-print__table-wrap">
        <table className="pilgrim-list-print__table">
          <thead>
            <tr>
              <th>ردیف</th>
              <th>نام</th>
              <th>نام خانوادگی</th>
              <th>تلفن همراه</th>
              <th>کد ملی</th>
              <th>جنسیت</th>
              <th>تاریخ تولد</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.index}>
                <td>{formatPersianNumber(row.index)}</td>
                <td>{row.firstName}</td>
                <td>{row.lastName}</td>
                <td dir="ltr">{row.mobileNumber}</td>
                <td dir="ltr">{row.nationalId}</td>
                <td>{userGenderLabel(row.gender)}</td>
                <td>{row.birthDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="pilgrim-list-print__footer">
        <StatCard
          tone="total"
          icon={<UsersIcon />}
          label="تعداد کل زائرین"
          value={stats.total}
        />
        <StatCard
          tone="male"
          icon={<PersonIcon />}
          label="آقایان"
          value={stats.maleCount}
        />
        <StatCard
          tone="female"
          icon={<UsersIcon />}
          label="بانوان"
          value={stats.femaleCount}
        />
      </footer>
    </div>
  );
}

export function PilgrimListPrintButton({
  loadPilgrims,
  title = 'لیست زائرین',
  disabled = false,
}: PilgrimListPrintButtonProps) {
  const printRootId = useId().replace(/:/g, '');
  const [printPilgrims, setPrintPilgrims] = useState<AdminUser[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!printPilgrims?.length) return;

    document.body.classList.add(PRINT_BODY_CLASS);
    const frame = window.requestAnimationFrame(() => {
      window.print();
      window.setTimeout(() => {
        document.body.classList.remove(PRINT_BODY_CLASS);
        setPrintPilgrims(null);
      }, 500);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.classList.remove(PRINT_BODY_CLASS);
    };
  }, [printPilgrims]);

  const handlePrint = async () => {
    setLoading(true);
    try {
      const pilgrims = await loadPilgrims();
      if (pilgrims.length === 0) {
        toast.error('زائری برای چاپ وجود ندارد');
        return;
      }
      setPrintPilgrims(pilgrims);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا در آماده‌سازی چاپ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        #${printRootId} {
          display: none;
        }

        @media print {
          @font-face {
            font-family: Vazir;
            src: url('${vazirWoff2}') format('woff2');
            font-weight: 400;
            font-style: normal;
          }

          @font-face {
            font-family: Vazir;
            src: url('${vazirMediumWoff2}') format('woff2');
            font-weight: 500;
            font-style: normal;
          }

          @font-face {
            font-family: Vazir;
            src: url('${vazirBoldWoff2}') format('woff2');
            font-weight: 700;
            font-style: normal;
          }

          body.${PRINT_BODY_CLASS} * {
            visibility: hidden !important;
          }

          body.${PRINT_BODY_CLASS} #${printRootId},
          body.${PRINT_BODY_CLASS} #${printRootId} * {
            visibility: visible !important;
          }

          body.${PRINT_BODY_CLASS} #${printRootId} {
            display: block !important;
            position: absolute;
            inset: 0;
            padding: 8mm 10mm;
            background: #fff;
          }

          @page {
            size: A4 portrait;
            margin: 8mm;
          }

          .pilgrim-list-print {
            font-family: Vazir, Tahoma, sans-serif;
            color: #1e293b;
            direction: rtl;
          }

          .pilgrim-list-print__header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 10mm;
            margin-bottom: 4mm;
          }

          .pilgrim-list-print__header-main {
            flex: 1;
            min-width: 0;
          }

          .pilgrim-list-print__brand {
            display: inline-flex;
            align-items: center;
            gap: 2mm;
            margin-bottom: 3mm;
            color: #475569;
            font-size: 9pt;
            font-weight: 600;
          }

          .pilgrim-list-print__brand-icon {
            width: 7mm;
            height: 7mm;
            flex-shrink: 0;
          }

          .pilgrim-list-print__title {
            margin: 0;
            font-size: 20pt;
            font-weight: 800;
            line-height: 1.25;
            color: #1a2744;
          }

          .pilgrim-list-print__meta {
            display: inline-flex;
            align-items: center;
            gap: 1.5mm;
            margin: 2.5mm 0 0;
            font-size: 9pt;
            color: #64748b;
          }

          .pilgrim-list-print__meta-icon {
            width: 4mm;
            height: 4mm;
            color: #94a3b8;
          }

          .pilgrim-list-print__badge {
            display: inline-flex;
            align-items: center;
            gap: 2mm;
            padding: 2.5mm 4mm;
            border-radius: 3mm;
            background: #f1f5f9;
            border: 0.2mm solid #e2e8f0;
            color: #475569;
            font-size: 10pt;
            font-weight: 700;
            white-space: nowrap;
          }

          .pilgrim-list-print__badge-icon {
            width: 4.5mm;
            height: 4.5mm;
            color: #64748b;
          }

          .pilgrim-list-print__divider {
            display: flex;
            align-items: center;
            gap: 2mm;
            margin-bottom: 5mm;
          }

          .pilgrim-list-print__divider-line {
            flex: 1;
            height: 0.35mm;
            background: #14b8a6;
          }

          .pilgrim-list-print__divider-diamond {
            width: 2.5mm;
            height: 2.5mm;
            background: #14b8a6;
            transform: rotate(45deg);
            flex-shrink: 0;
          }

          .pilgrim-list-print__table-wrap {
            overflow: hidden;
            border-radius: 3mm;
            border: 0.2mm solid #dbeafe;
          }

          .pilgrim-list-print__table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5pt;
          }

          .pilgrim-list-print__table th {
            padding: 3mm 2mm;
            background: #1a2744;
            color: #fff;
            font-weight: 700;
            text-align: center;
            border: 0;
          }

          .pilgrim-list-print__table td {
            padding: 2.8mm 2mm;
            border: 0;
            text-align: center;
            color: #334155;
          }

          .pilgrim-list-print__table tbody tr:nth-child(odd) td {
            background: #fff;
          }

          .pilgrim-list-print__table tbody tr:nth-child(even) td {
            background: #f1f5f9;
          }

          .pilgrim-list-print__footer {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 4mm;
            margin-top: 8mm;
          }

          .pilgrim-list-print__stat {
            padding: 4mm 3mm 3.5mm;
            border-radius: 3mm;
            background: #fff;
            border: 0.25mm solid #e2e8f0;
            text-align: center;
          }

          .pilgrim-list-print__stat-head {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2mm;
            margin-bottom: 2mm;
          }

          .pilgrim-list-print__stat-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 7mm;
            height: 7mm;
            border-radius: 999px;
          }

          .pilgrim-list-print__stat-icon svg {
            width: 4.2mm;
            height: 4.2mm;
          }

          .pilgrim-list-print__stat-label {
            font-size: 9pt;
            font-weight: 600;
            color: #64748b;
          }

          .pilgrim-list-print__stat strong {
            display: block;
            font-size: 18pt;
            font-weight: 800;
            line-height: 1.2;
            color: #0f172a;
          }

          .pilgrim-list-print__stat-line {
            display: block;
            width: 14mm;
            height: 0.8mm;
            margin: 2.5mm auto 0;
            border-radius: 999px;
          }

          .pilgrim-list-print__stat--total .pilgrim-list-print__stat-icon {
            background: #ede9fe;
            color: #7c3aed;
          }

          .pilgrim-list-print__stat--total .pilgrim-list-print__stat-line {
            background: #7c3aed;
          }

          .pilgrim-list-print__stat--male .pilgrim-list-print__stat-icon {
            background: #dbeafe;
            color: #2563eb;
          }

          .pilgrim-list-print__stat--male .pilgrim-list-print__stat-line {
            background: #2563eb;
          }

          .pilgrim-list-print__stat--female .pilgrim-list-print__stat-icon {
            background: #ccfbf1;
            color: #0d9488;
          }

          .pilgrim-list-print__stat--female .pilgrim-list-print__stat-line {
            background: #14b8a6;
          }
        }
      `}</style>

      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => void handlePrint()}
        className={`${actionBtnClass} border-[#c5d4e8] bg-[#f0f4fa] text-[#4a6fa5] hover:bg-[#e8eef6] disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <NavIcon name="print" className="h-4 w-4 shrink-0" />
        {loading ? 'در حال آماده‌سازی...' : 'چاپ زائرین'}
      </button>

      <div id={printRootId} aria-hidden>
        {printPilgrims && (
          <PilgrimListPrintContent pilgrims={printPilgrims} title={title} />
        )}
      </div>
    </>
  );
}
