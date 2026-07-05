import { useId, type ReactNode } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { formatPersianNumber } from '../../lib/capacity';
import { buildGuestMawkibUrl } from '../../lib/guest-mawkib';
import type { MawkibCardData } from '../../lib/mawkib-card';
import { btnSecondary } from '../../lib/styles';
import {
  PrintCardHeroImage,
  PRINT_CARD_HERO_IMAGE_CSS,
} from './PrintCardHeroImage';

const CARD_TEAL = '#1a3f3f';
const CARD_TEAL_LIGHT = '#e8f3f3';
const PRINT_BODY_CLASS = 'printing-mawkib-card';

function capacityDisplay(male?: number, female?: number) {
  const m = male ?? 0;
  const f = female ?? 0;
  const total = m + f;
  if (total === 0) {
    return <span>—</span>;
  }
  return (
    <span className="mawkib-card__capacity-value">
      {m > 0 && (
        <span className="mawkib-card__capacity-part">
          <IconMale />
          {formatPersianNumber(m)}
        </span>
      )}
      {f > 0 && (
        <span className="mawkib-card__capacity-part">
          <IconFemale />
          {formatPersianNumber(f)}
        </span>
      )}
      <span className="mawkib-card__capacity-total">({formatPersianNumber(total)})</span>
    </span>
  );
}

function CircleIcon({ children }: { children: ReactNode }) {
  return <span className="mawkib-card__circle-icon">{children}</span>;
}

function StatColumn({
  icon,
  label,
  value,
  valueDir,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  valueDir?: 'ltr' | 'rtl';
}) {
  return (
    <div className="mawkib-card__stat">
      <CircleIcon>{icon}</CircleIcon>
      <p className="mawkib-card__stat-label">{label}</p>
      <p className="mawkib-card__stat-value" dir={valueDir}>
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  valueDir,
  subValue,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueDir?: 'ltr' | 'rtl';
  subValue?: string;
}) {
  return (
    <div className="mawkib-card__detail-row">
      <div className="mawkib-card__detail-key">
        <CircleIcon>{icon}</CircleIcon>
        <span>{label}</span>
      </div>
      <div className="mawkib-card__detail-value-wrap">
        <span className="mawkib-card__detail-value" dir={valueDir}>
          {value}
        </span>
        {subValue && <span className="mawkib-card__detail-subvalue">{subValue}</span>}
      </div>
    </div>
  );
}

const iconProps = {
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  strokeWidth: 1.6,
} as const;

function IconHome() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg {...iconProps} className="h-3.5 w-3.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </svg>
  );
}

function IconUser() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
      />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 2.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </svg>
  );
}

function IconMale() {
  return (
    <svg {...iconProps} className="h-3.5 w-3.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

function IconFemale() {
  return (
    <svg {...iconProps} className="h-3.5 w-3.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </svg>
  );
}

function IconDocument() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}

function ServiceDatesRow({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) {
  if (!startDate && !endDate) return null;

  return (
    <div className="mawkib-card__detail-row mawkib-card__detail-row--service-dates">
      <div className="mawkib-card__detail-key">
        <CircleIcon>
          <IconCalendar />
        </CircleIcon>
        <span>تاریخ خدمت‌دهی</span>
      </div>
      <div className="mawkib-card__service-dates">
        <div className="mawkib-card__service-date-col">
          <span className="mawkib-card__service-date-label">شروع</span>
          <span className="mawkib-card__service-date-value">{startDate ?? '—'}</span>
        </div>
        <div className="mawkib-card__service-date-col">
          <span className="mawkib-card__service-date-label">پایان</span>
          <span className="mawkib-card__service-date-value">{endDate ?? '—'}</span>
        </div>
      </div>
    </div>
  );
}

function IconSparkles() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.467.732-3.553"
      />
    </svg>
  );
}

function hasDisplayValue(value?: string) {
  const trimmed = value?.trim();
  return Boolean(trimmed && trimmed !== '—');
}

function CountryCityPhoneRow({ data }: { data: MawkibCardData }) {
  const columns = [
    hasDisplayValue(data.countryLabel) && {
      key: 'country',
      label: 'کشور',
      value: data.countryLabel!,
    },
    hasDisplayValue(data.cityLabel) && {
      key: 'city',
      label: 'شهر',
      value: data.cityLabel!,
    },
    hasDisplayValue(data.ownerMobile) && {
      key: 'ownerMobile',
      label: 'تلفن مسئول',
      value: data.ownerMobile,
      valueDir: 'ltr' as const,
    },
  ].filter((column): column is Exclude<typeof column, false> => Boolean(column));

  if (columns.length === 0) return null;

  return (
    <div
      className="mawkib-card__meta-cols"
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
    >
      {columns.map((column) => (
        <div key={column.key} className="mawkib-card__meta-col">
          <span className="mawkib-card__meta-label">{column.label}</span>
          <span className="mawkib-card__meta-value" dir={column.valueDir}>
            {column.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function AmenitiesRow({ amenities }: { amenities: string[] }) {
  if (amenities.length === 0) return null;

  return (
    <div className="mawkib-card__detail-row mawkib-card__detail-row--stacked">
      <div className="mawkib-card__detail-key">
        <CircleIcon>
          <IconSparkles />
        </CircleIcon>
        <span>امکانات</span>
      </div>
      <div className="mawkib-card__amenities">
        {amenities.map((label) => (
          <span key={label} className="mawkib-card__amenity-tag">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MawkibCardPrintContent({ data }: { data: MawkibCardData }) {
  const mawkibMapUrl = buildGuestMawkibUrl(data.id, { focusMap: true });

  return (
    <div className="mawkib-card">
      <header className="mawkib-card__header">
        <div className="mawkib-card__header-hero">
          <PrintCardHeroImage
            imageUrl={data.imageUrl}
            className="mawkib-card__hero-image"
          />
          <div className="mawkib-card__hero-overlay">
            <h1 className="mawkib-card__hero-title">{data.name}</h1>
            <p className="mawkib-card__hero-badge">
              <IconHome />
              <span>موکب کارت</span>
            </p>
          </div>
        </div>
      </header>

      <div className="mawkib-card__stats">
        <StatColumn
          icon={<IconPhone />}
          label="تلفن موکب"
          value={data.phoneNumber}
          valueDir="ltr"
        />
        <StatColumn icon={<IconUser />} label="نام مسئول" value={data.ownerFullName} />
        <StatColumn
          icon={<IconUsers />}
          label="ظرفیت"
          value={capacityDisplay(data.maleCapacity, data.femaleCapacity)}
        />
      </div>

      <section className="mawkib-card__panel">
        <h2 className="mawkib-card__panel-title">
          <IconDocument />
          <span>اطلاعات موکب</span>
        </h2>
        <div className="mawkib-card__details">
          <DetailRow icon={<IconMapPin />} label="آدرس" value={data.address} />
          <CountryCityPhoneRow data={data} />
          <ServiceDatesRow
            startDate={data.serviceStartDate}
            endDate={data.serviceEndDate}
          />
          <AmenitiesRow amenities={data.amenities} />
          {data.socialLinks.map((link) => (
            <DetailRow
              key={link.label}
              icon={<IconGlobe />}
              label={link.label}
              value={link.value}
              valueDir="ltr"
            />
          ))}
        </div>

        <div className="mawkib-card__location-row">
          <div className="mawkib-card__location-qr">
            <p className="mawkib-card__location-title">موقعیت موکب</p>
            <QRCodeSVG value={mawkibMapUrl} size={104} level="M" />
            <p className="mawkib-card__location-caption">اسکن برای مشاهده در نقشه</p>
          </div>
        </div>
      </section>
    </div>
  );
}

interface MawkibCardPrintButtonProps {
  data: MawkibCardData;
  className?: string;
}

export function MawkibCardPrintButton({ data, className }: MawkibCardPrintButtonProps) {
  const printRootId = useId().replace(/:/g, '');

  const handlePrint = () => {
    document.body.classList.add(PRINT_BODY_CLASS);

    const cleanup = () => {
      document.body.classList.remove(PRINT_BODY_CLASS);
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);
    window.requestAnimationFrame(() => window.print());
  };

  return (
    <>
      <style>{`
        ${PRINT_CARD_HERO_IMAGE_CSS}
        #${printRootId} {
          display: none;
        }

        @media print {
          @page {
            size: A5 portrait;
            margin: 10mm;
          }

          body.${PRINT_BODY_CLASS} * {
            visibility: hidden !important;
          }

          body.${PRINT_BODY_CLASS} #${printRootId},
          body.${PRINT_BODY_CLASS} #${printRootId} * {
            visibility: visible !important;
          }

          body.${PRINT_BODY_CLASS} #${printRootId} {
            display: flex !important;
            position: fixed;
            inset: 0;
            align-items: center;
            justify-content: center;
            background: white;
          }

          .mawkib-card {
            box-sizing: border-box;
            width: 128mm;
            max-width: 100%;
            overflow: hidden;
            border: 0.35mm solid #dbe3ea;
            border-radius: 3.5mm;
            background: #fff;
            font-family: Vazir, Tahoma, sans-serif;
            color: #1e293b;
            direction: rtl;
            box-shadow: 0 1mm 3mm rgba(15, 23, 42, 0.08);
          }

          .mawkib-card__header {
            min-height: 22mm;
          }

          .mawkib-card__header-hero {
            position: relative;
            min-height: 22mm;
            overflow: hidden;
            background-color: #334155;
          }

          .mawkib-card__hero-overlay {
            position: absolute;
            inset: 0;
            z-index: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            gap: 1mm;
            padding: 1.8mm 2.5mm;
            background: linear-gradient(
              180deg,
              rgba(15, 23, 42, 0.08) 0%,
              rgba(15, 23, 42, 0.72) 100%
            );
          }

          .mawkib-card__hero-title {
            margin: 0;
            font-size: 11pt;
            font-weight: 800;
            line-height: 1.2;
            color: #fff;
            text-shadow: 0 0.3mm 1mm rgba(0, 0, 0, 0.35);
          }

          .mawkib-card__hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 1mm;
            align-self: flex-start;
            margin: 0;
            padding: 1mm 2mm;
            border-radius: 999px;
            background: rgba(15, 23, 42, 0.55);
            font-size: 7pt;
            font-weight: 600;
            color: #fff;
          }

          .mawkib-card__hero-badge svg {
            width: 3.2mm;
            height: 3.2mm;
            flex-shrink: 0;
          }

          .mawkib-card__stats {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 0;
            border-bottom: 0.25mm solid #e2e8f0;
            background: #fff;
          }

          .mawkib-card__stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.6mm;
            padding: 1.5mm 1mm;
            text-align: center;
            border-left: 0.2mm solid #e2e8f0;
          }

          .mawkib-card__stat:first-child {
            border-left: none;
          }

          .mawkib-card__circle-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 6.5mm;
            height: 6.5mm;
            border-radius: 999px;
            background: ${CARD_TEAL_LIGHT};
            color: ${CARD_TEAL};
          }

          .mawkib-card__circle-icon svg {
            width: 3.5mm;
            height: 3.5mm;
          }

          .mawkib-card__stat-label {
            margin: 0;
            font-size: 5.8pt;
            font-weight: 500;
            color: #64748b;
          }

          .mawkib-card__stat-value {
            margin: 0;
            font-size: 6.2pt;
            font-weight: 700;
            line-height: 1.35;
            color: #1e293b;
            word-break: break-word;
          }

          .mawkib-card__capacity-value {
            display: inline-flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 1mm;
          }

          .mawkib-card__capacity-part {
            display: inline-flex;
            align-items: center;
            gap: 0.5mm;
          }

          .mawkib-card__capacity-part svg {
            width: 3.2mm;
            height: 3.2mm;
            flex-shrink: 0;
          }

          .mawkib-card__capacity-total {
            font-weight: 700;
          }

          .mawkib-card__panel {
            margin: 0.8mm 2.5mm 2.5mm;
            padding: 1.5mm 2.5mm 2.5mm;
            border: 0.25mm solid #e2e8f0;
            border-radius: 2.5mm;
            background: #fafbfc;
          }

          .mawkib-card__panel-title {
            display: flex;
            align-items: center;
            gap: 1.2mm;
            margin: 0 0 0.8mm;
            font-size: 9.5pt;
            font-weight: 700;
            color: #334155;
          }

          .mawkib-card__panel-title svg {
            width: 4.3mm;
            height: 4.3mm;
            color: ${CARD_TEAL};
          }

          .mawkib-card__details {
            display: grid;
            gap: 1mm;
            margin-bottom: 2mm;
          }

          .mawkib-card__meta-cols {
            display: grid;
            gap: 0;
            padding: 1mm 0;
            border-bottom: 0.15mm solid #e8edf2;
          }

          .mawkib-card__meta-col {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.4mm;
            min-width: 0;
            padding: 0 1.5mm;
            text-align: center;
            border-left: 0.15mm solid #e2e8f0;
          }

          .mawkib-card__meta-col:first-child {
            border-left: none;
          }

          .mawkib-card__meta-label {
            font-size: 6.8pt;
            font-weight: 500;
            color: #64748b;
          }

          .mawkib-card__meta-value {
            font-size: 8pt;
            font-weight: 700;
            color: #1e293b;
            line-height: 1.35;
            word-break: break-word;
          }

          .mawkib-card__detail-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 2mm;
            padding: 1.2mm 0;
            border-bottom: 0.15mm solid #e8edf2;
          }

          .mawkib-card__detail-row:last-child {
            border-bottom: none;
          }

          .mawkib-card__detail-row--stacked {
            flex-direction: column;
            align-items: stretch;
            gap: 1.2mm;
          }

          .mawkib-card__detail-row--service-dates {
            align-items: flex-start;
          }

          .mawkib-card__service-dates {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 2mm;
            flex: 1;
            max-width: 62%;
          }

          .mawkib-card__service-date-col {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 0.4mm;
            min-width: 0;
          }

          .mawkib-card__service-date-col + .mawkib-card__service-date-col {
            border-right: 0.15mm solid #e2e8f0;
            padding-right: 2mm;
          }

          .mawkib-card__service-date-label {
            font-size: 6pt;
            font-weight: 500;
            color: #64748b;
          }

          .mawkib-card__service-date-value {
            font-size: 7pt;
            font-weight: 700;
            color: #1e293b;
            text-align: left;
            word-break: break-word;
          }

          .mawkib-card__amenities {
            display: flex;
            flex-wrap: wrap;
            gap: 1mm;
            padding-right: 7.7mm;
          }

          .mawkib-card__amenity-tag {
            display: inline-flex;
            align-items: center;
            padding: 0.8mm 1.6mm;
            border-radius: 999px;
            background: ${CARD_TEAL_LIGHT};
            font-size: 6.5pt;
            font-weight: 600;
            color: ${CARD_TEAL};
            line-height: 1.3;
          }

          .mawkib-card__detail-key {
            display: flex;
            align-items: center;
            gap: 1.2mm;
            min-width: 0;
            font-size: 7pt;
            font-weight: 500;
            color: #64748b;
          }

          .mawkib-card__detail-value-wrap {
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 0.5mm;
            max-width: 58%;
            min-width: 0;
          }

          .mawkib-card__detail-value {
            font-size: 7.5pt;
            font-weight: 700;
            color: #1e293b;
            text-align: left;
            word-break: break-word;
          }

          .mawkib-card__detail-subvalue {
            font-size: 6.5pt;
            font-weight: 600;
            color: #64748b;
            text-align: left;
            word-break: break-word;
          }

          .mawkib-card__location-row {
            display: flex;
            justify-content: center;
          }

          .mawkib-card__location-qr {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1.2mm;
            width: 58%;
            min-width: 42mm;
            padding: 2.5mm 2mm;
            border: 0.25mm solid #e2e8f0;
            border-radius: 2mm;
            background: #fff;
            text-align: center;
          }

          .mawkib-card__location-qr svg {
            width: 24mm;
            height: 24mm;
          }

          .mawkib-card__location-title {
            margin: 0;
            font-size: 7pt;
            font-weight: 700;
            color: #334155;
          }

          .mawkib-card__location-caption {
            margin: 0;
            font-size: 6pt;
            font-weight: 500;
            color: #64748b;
          }
        }
      `}</style>

      <button
        type="button"
        onClick={handlePrint}
        className={className ?? `${btnSecondary} w-full sm:w-auto`}
      >
        <svg
          className="h-3.5 w-3.5 shrink-0 text-current"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.6}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
          />
        </svg>
        چاپ موکب کارت
      </button>

      <div id={printRootId} aria-hidden>
        <MawkibCardPrintContent data={data} />
      </div>
    </>
  );
}
