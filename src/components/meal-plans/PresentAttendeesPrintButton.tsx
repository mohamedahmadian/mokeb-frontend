import { useEffect, useId, useState } from 'react';
import { NavIcon } from '../ui/NavIcons';
import { formatPersianNumber } from '../../lib/capacity';
import { MEAL_TYPE_LABELS } from '../../lib/meal-plan-utils';
import { formatPersianDate } from '../ui/PersianDateInput';
import type { PresentAttendeesReport } from '../../lib/present-attendees-report';
import { mealPlanIconClass, mealPlanAccentBtn, mealPlanSecondaryBtn } from './meal-plans-ui';
import { GuestCountInput, parseGuestCountInput } from './GuestCountInput';
import { toast } from '../../lib/toast';
import vazirWoff2 from '../../assets/fonts/Vazir.woff2';
import vazirMediumWoff2 from '../../assets/fonts/Vazir-Medium.woff2';
import vazirBoldWoff2 from '../../assets/fonts/Vazir-Bold.woff2';

const PRINT_BODY_CLASS = 'printing-present-attendees';

interface PresentAttendeesPrintButtonProps {
  report: PresentAttendeesReport | null;
  disabled?: boolean;
}

function PresenceCheckIcon({ checked }: { checked: boolean }) {
  return (
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded border ${
        checked
          ? 'border-emerald-600 bg-emerald-600 text-white'
          : 'border-slate-300 bg-white'
      }`}
      aria-hidden
    >
      {checked ? (
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 6.2 4.8 8.5 9.5 3.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}

function PrintContent({ report }: { report: PresentAttendeesReport }) {
  const generatedAt = new Date().toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="present-attendees-print">
      <header className="present-attendees-print__header">
        <div>
          <p className="present-attendees-print__eyebrow">سامانه موکب — گزارش وعده‌های غذایی</p>
          <h1 className="present-attendees-print__title">{report.mawkibName}</h1>
          <p className="present-attendees-print__meta">
            تاریخ {formatPersianDate(report.date)} — وعده {MEAL_TYPE_LABELS[report.mealType]}
          </p>
          <p className="present-attendees-print__meta">تاریخ تهیه: {generatedAt}</p>
        </div>
      </header>

      <div className="present-attendees-print__stats">
        <div className="present-attendees-print__stat">
          <span>کل زوار</span>
          <strong>{formatPersianNumber(report.stats.total)}</strong>
        </div>
        <div className="present-attendees-print__stat present-attendees-print__stat--present">
          <span>حاضرین</span>
          <strong>{formatPersianNumber(report.stats.present)}</strong>
        </div>
        <div className="present-attendees-print__stat present-attendees-print__stat--absent">
          <span>غائبین</span>
          <strong>{formatPersianNumber(report.stats.absent)}</strong>
        </div>
      </div>

      <table className="present-attendees-print__table">
        <thead>
          <tr>
            <th>ردیف</th>
            <th>نام و نام خانوادگی</th>
            <th>کد رزرو</th>
            <th>تلفن همراه</th>
            <th>کد ملی</th>
            <th>حضور</th>
            <th>تحویل</th>
          </tr>
        </thead>
        <tbody>
          {report.rows.map((row, index) => (
            <tr key={row.reservationId}>
              <td>{formatPersianNumber(index + 1)}</td>
              <td>{row.fullName}</td>
              <td dir="ltr">{row.trackingCode || '—'}</td>
              <td dir="ltr">{row.mobile || '—'}</td>
              <td dir="ltr">{row.nationalId || '—'}</td>
              <td>{row.presence}</td>
              <td className="present-attendees-print__presence">
                <PresenceCheckIcon checked={row.isServed} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PresentAttendeesPrintButton({
  report,
  disabled = false,
}: PresentAttendeesPrintButtonProps) {
  const printRootId = useId().replace(/:/g, '');
  const [printReport, setPrintReport] = useState<PresentAttendeesReport | null>(null);

  useEffect(() => {
    if (!printReport) return;

    document.body.classList.add(PRINT_BODY_CLASS);
    const frame = window.requestAnimationFrame(() => {
      window.print();
      window.setTimeout(() => {
        document.body.classList.remove(PRINT_BODY_CLASS);
        setPrintReport(null);
      }, 500);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.classList.remove(PRINT_BODY_CLASS);
    };
  }, [printReport]);

  const handlePrint = () => {
    if (!report || report.rows.length === 0) {
      toast.error('داده‌ای برای چاپ وجود ندارد');
      return;
    }
    setPrintReport(report);
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
          @page { size: A4 portrait; margin: 10mm; }
          .present-attendees-print {
            font-family: Vazir, Tahoma, sans-serif;
            color: #1e293b;
            direction: rtl;
          }
          .present-attendees-print__header { margin-bottom: 6mm; }
          .present-attendees-print__eyebrow {
            margin: 0 0 2mm;
            font-size: 9pt;
            color: #64748b;
            font-weight: 600;
          }
          .present-attendees-print__title {
            margin: 0;
            font-size: 18pt;
            font-weight: 800;
            color: #1a2744;
          }
          .present-attendees-print__meta {
            margin: 1.5mm 0 0;
            font-size: 9pt;
            color: #64748b;
          }
          .present-attendees-print__stats {
            display: flex;
            gap: 4mm;
            margin-bottom: 5mm;
          }
          .present-attendees-print__stat {
            flex: 1;
            padding: 3mm;
            border: 0.2mm solid #e2e8f0;
            border-radius: 2mm;
            text-align: center;
          }
          .present-attendees-print__stat span {
            display: block;
            font-size: 8pt;
            color: #64748b;
          }
          .present-attendees-print__stat strong {
            font-size: 14pt;
          }
          .present-attendees-print__table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
          }
          .present-attendees-print__table th,
          .present-attendees-print__table td {
            border: 0.2mm solid #e2e8f0;
            padding: 2mm 2.5mm;
            text-align: right;
          }
          .present-attendees-print__table th {
            background: #f8fafc;
            font-weight: 700;
          }
          .present-attendees-print__presence { text-align: center; }
        }
      `}</style>

      <button
        type="button"
        disabled={disabled || !report?.rows.length}
        onClick={handlePrint}
        className={mealPlanSecondaryBtn}
      >
        <NavIcon name="print" className={mealPlanIconClass} strokeWidth={1.75} />
        چاپ
      </button>

      <div id={printRootId} aria-hidden>
        {printReport ? <PrintContent report={printReport} /> : null}
      </div>
    </>
  );
}

export function ServedStatusBox({ isServed }: { isServed: boolean }) {
  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded border ${
        isServed
          ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
          : 'border-slate-300 bg-white'
      }`}
      title={isServed ? 'تحویل داده شده' : 'تحویل نشده'}
      aria-label={isServed ? 'تحویل داده شده' : 'تحویل نشده'}
    >
      {isServed ? (
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6.5 4.5 9 10 3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}

interface MealDeliveryCellProps {
  mealPlanId: number | null;
  guestCount: number;
  isServed: boolean;
  serving?: boolean;
  guestCountValue: string;
  onGuestCountChange: (value: string) => void;
  onServe?: (guestCount: number) => void;
}

export function MealDeliveryCell({
  mealPlanId,
  guestCount,
  isServed,
  serving = false,
  guestCountValue,
  onGuestCountChange,
  onServe,
}: MealDeliveryCellProps) {
  if (isServed) {
    return (
      <div className="flex items-center justify-center gap-2">
        <GuestCountInput value={guestCount} disabled served />
        <ServedStatusBox isServed />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <GuestCountInput
        value={guestCount}
        textValue={guestCountValue}
        disabled={serving}
        onChange={onGuestCountChange}
      />
      <button
        type="button"
        disabled={!mealPlanId || serving}
        onClick={() => {
          const parsed = parseGuestCountInput(guestCountValue);
          if (parsed == null) {
            toast.error('تعداد نفرات باید حداقل ۱ باشد');
            return;
          }
          onServe?.(parsed);
        }}
        className={`${mealPlanAccentBtn} !min-h-8 !px-2.5`}
      >
        {serving ? '...' : 'تحویل'}
      </button>
    </div>
  );
}
