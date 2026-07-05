import { createPortal, flushSync } from "react-dom";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Modal } from "../Modal";
import { NavIcon } from "../ui/NavIcons";
import { formatPersianNumber } from "../../lib/capacity";
import { buildGuestMawkibUrl } from "../../lib/guest-mawkib";
import { buildPilgrimCardUrl } from "../../lib/reservation-track";
import { btnPrimary, btnSecondary, inputClass } from "../../lib/styles";
import { formatPersianDateRange } from "../ui/PersianDateRangePicker";
import { formatPresenceStayWeekdays } from "../../lib/pilgrim-card-weekday";
import { PRINT_CARD_HERO_IMAGE_CSS } from "../mawkibs/PrintCardHeroImage";
import { resolveMawkibImageUrl } from "../mawkibs/MawkibThumbnail";

import type { Reservation } from "../../types";

const CARD_TEAL = "#1a3f3f";
const CARD_TEAL_LIGHT = "#e8f3f3";

function resolveHeroImage(imageUrl?: string | null): string {
  return resolveMawkibImageUrl(imageUrl);
}

interface ReservationUserCardPrintProps {
  reservation: Reservation;
  className?: string;
}

function presenceDateLabel(reservation: Reservation) {
  const start = reservation.reservationDate.slice(0, 10);
  const end = (
    reservation.reservationEndDate ?? reservation.reservationDate
  ).slice(0, 10);
  return formatPersianDateRange(start, end);
}

function companionCountDisplay(male: number, female: number) {
  const total = male + female;
  if (total === 0) {
    return <span>۰</span>;
  }
  return (
    <span className="pilgrim-card__companion-value">
      {male > 0 && (
        <span className="pilgrim-card__companion-part">
          <IconMale />
          {formatPersianNumber(male)}
        </span>
      )}
      {female > 0 && (
        <span className="pilgrim-card__companion-part">
          <IconFemale />
          {formatPersianNumber(female)}
        </span>
      )}
      {female > 0 && (
        <span className="pilgrim-card__companion-total">
          ({formatPersianNumber(total)})
        </span>
      )}
    </span>
  );
}

const PRINT_BODY_CLASS = "printing-reservation-user-card";

function CircleIcon({ children }: { children: ReactNode }) {
  return <span className="pilgrim-card__circle-icon">{children}</span>;
}

function StatColumn({
  icon,
  label,
  value,
  valueDir,
  subValue,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  valueDir?: "ltr" | "rtl";
  subValue?: ReactNode;
}) {
  return (
    <div className="pilgrim-card__stat">
      <CircleIcon>{icon}</CircleIcon>
      <p className="pilgrim-card__stat-label">{label}</p>
      <p className="pilgrim-card__stat-value" dir={valueDir}>
        {value}
      </p>
      {subValue != null && subValue !== "" && (
        <p className="pilgrim-card__stat-subvalue">{subValue}</p>
      )}
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  valueDir,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  valueDir?: "ltr" | "rtl";
}) {
  return (
    <div className="pilgrim-card__detail-row">
      <div className="pilgrim-card__detail-key">
        <CircleIcon>{icon}</CircleIcon>
        <span>{label}</span>
      </div>
      <span className="pilgrim-card__detail-value" dir={valueDir}>
        {value}
      </span>
    </div>
  );
}

const iconProps = {
  fill: "none",
  viewBox: "0 0 24 24",
  stroke: "currentColor",
  strokeWidth: 1.6,
} as const;

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

function IconInfo() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m11.25 11.25.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
      />
    </svg>
  );
}

export function ReservationUserCardPrintContent({
  reservation,
  footerNote,
}: {
  reservation: Reservation;
  footerNote?: string;
}) {
  const trackUrl = buildPilgrimCardUrl(reservation.trackingCode);
  const mawkibMapUrl = buildGuestMawkibUrl(reservation.mawkib.id, {
    focusMap: true,
  });
  const trimmedFooterNote = footerNote?.trim();
  const mawkibAddress = reservation.mawkib.address?.trim() || "—";
  const ownerName = reservation.mawkib.owner?.fullName?.trim() || "—";
  const ownerPhone = reservation.mawkib.owner?.mobileNumber?.trim() || "—";
  const pilgrimName = reservation.pilgrim.fullName;
  const stayRange = presenceDateLabel(reservation);
  const stayWeekdays = formatPresenceStayWeekdays(
    reservation.reservationDate,
    reservation.reservationEndDate,
  );

  return (
    <div className="pilgrim-card">
      <header className="pilgrim-card__header">
        <div className="pilgrim-card__header-hero">
          <img
            src={resolveHeroImage(reservation.mawkib.imageUrl)}
            alt=""
            aria-hidden
            className="pilgrim-card__hero-image"
            loading="eager"
            decoding="sync"
          />
          <div className="pilgrim-card__hero-overlay">
            <h1 className="pilgrim-card__hero-title">
              {reservation.mawkib.name}
            </h1>
            <p className="pilgrim-card__hero-badge">
              <IconUser />
              <span>{pilgrimName}</span>
            </p>
          </div>
        </div>
        <div className="pilgrim-card__header-qr">
          <QRCodeSVG
            value={trackUrl}
            size={92}
            level="M"
            fgColor="#ffffff"
            bgColor={CARD_TEAL}
            aria-label={`QR زائر کارت ${reservation.trackingCode}`}
          />
          <p className="pilgrim-card__header-qr-label">شناسه رزرو</p>
          <p className="pilgrim-card__header-qr-code" dir="ltr">
            {reservation.trackingCode}
          </p>
        </div>
      </header>

      <div className="pilgrim-card__stats">
        <StatColumn
          icon={<IconPhone />}
          label="موبایل"
          value={reservation.pilgrimMobile}
          valueDir="ltr"
        />
        <StatColumn
          icon={<IconCalendar />}
          label="تاریخ حضور"
          value={stayRange}
          subValue={stayWeekdays}
        />
        <StatColumn
          icon={<IconUsers />}
          label="تعداد همراهان"
          value={companionCountDisplay(
            reservation.maleGuestCount,
            reservation.femaleGuestCount,
          )}
        />
      </div>

      <section className="pilgrim-card__panel">
        <h2 className="pilgrim-card__panel-title">
          <IconDocument />
          <span>اطلاعات موکب</span>
        </h2>
        <div className="pilgrim-card__details">
          <DetailRow
            icon={<IconHome />}
            label="نام موکب"
            value={reservation.mawkib.name}
          />
          <DetailRow icon={<IconMapPin />} label="آدرس" value={mawkibAddress} />
          <DetailRow
            icon={<IconUser />}
            label="مسئول موکب"
            value={
              <span className="pilgrim-card__owner-value">
                <span>{ownerName}</span>
                <span className="pilgrim-card__detail-sep">·</span>
                <span dir="ltr">{ownerPhone}</span>
              </span>
            }
          />
        </div>

        <div className="pilgrim-card__location-row">
          <div className="pilgrim-card__location-qr">
            <p className="pilgrim-card__location-title">موقعیت موکب</p>
            <QRCodeSVG value={mawkibMapUrl} size={72} level="M" />
            <p className="pilgrim-card__location-caption">
              اسکن برای مشاهده در نقشه
            </p>
          </div>
        </div>
      </section>

      {trimmedFooterNote && (
        <p className="pilgrim-card__custom-note">{trimmedFooterNote}</p>
      )}
    </div>
  );
}

export function ReservationUserCardPrintButton({
  reservation,
  className,
}: ReservationUserCardPrintProps) {
  const printRootId = useId().replace(/:/g, "");
  const [modalOpen, setModalOpen] = useState(false);
  const [draftNote, setDraftNote] = useState("");
  const [footerNote, setFooterNote] = useState("");
  const printSubmitRef = useRef<HTMLButtonElement>(null);
  const printFormRef = useRef<HTMLFormElement>(null);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!modalOpen) return;
    const frameId = window.requestAnimationFrame(() => {
      noteInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [modalOpen]);

  const triggerPrint = () => {
    document.body.classList.add(PRINT_BODY_CLASS);

    const cleanup = () => {
      document.body.classList.remove(PRINT_BODY_CLASS);
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);
    window.requestAnimationFrame(() => window.print());
  };

  const handleOpenModal = () => {
    setDraftNote("");
    setModalOpen(true);
  };

  const handleConfirmPrint = (event: React.FormEvent) => {
    event.preventDefault();
    flushSync(() => {
      setFooterNote(draftNote.trim());
      setModalOpen(false);
    });
    triggerPrint();
  };

  const handleNoteKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    printFormRef.current?.requestSubmit();
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

          .pilgrim-card {
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

          .pilgrim-card__header {
            display: flex;
            min-height: 34mm;
          }

          .pilgrim-card__header-qr {
            flex: 0 0 34%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            gap: 1.2mm;
            padding: 3mm 2.5mm 3mm 3mm;
            background: ${CARD_TEAL};
            color: #fff;
            direction: ltr;
          }

          .pilgrim-card__header-qr svg {
            display: block;
            width: 24mm;
            height: 24mm;
            align-self: flex-start;
          }

          .pilgrim-card__header-qr-label {
            margin: 0.8mm 0 0;
            width: 100%;
            font-size: 7pt;
            font-weight: 500;
            opacity: 0.92;
            text-align: left;
          }

          .pilgrim-card__header-qr-code {
            margin: 0;
            width: 100%;
            font-size: 6.5pt;
            font-weight: 700;
            font-family: ui-monospace, monospace;
            letter-spacing: 0.04em;
            line-height: 1.35;
            word-break: break-all;
            text-align: left;
          }

          .pilgrim-card__header-hero {
            flex: 1;
            position: relative;
            overflow: hidden;
            background-color: #334155;
          }

          .pilgrim-card__hero-overlay {
            position: absolute;
            inset: 0;
            z-index: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            gap: 1.5mm;
            padding: 3mm;
            background: linear-gradient(
              180deg,
              rgba(15, 23, 42, 0.08) 0%,
              rgba(15, 23, 42, 0.72) 100%
            );
          }

          .pilgrim-card__hero-title {
            margin: 0;
            font-size: 12pt;
            font-weight: 800;
            line-height: 1.25;
            color: #fff;
            text-shadow: 0 0.3mm 1mm rgba(0, 0, 0, 0.35);
          }

          .pilgrim-card__hero-badge {
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

          .pilgrim-card__hero-badge svg {
            width: 3.2mm;
            height: 3.2mm;
            flex-shrink: 0;
          }

          .pilgrim-card__stats {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 0;
            border-bottom: 0.25mm solid #e2e8f0;
            background: #fff;
          }

          .pilgrim-card__stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.8mm;
            padding: 2mm 1mm;
            text-align: center;
            border-left: 0.2mm solid #e2e8f0;
          }

          .pilgrim-card__stat:first-child {
            border-left: none;
          }

          .pilgrim-card__circle-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 6.5mm;
            height: 6.5mm;
            border-radius: 999px;
            background: ${CARD_TEAL_LIGHT};
            color: ${CARD_TEAL};
          }

          .pilgrim-card__circle-icon svg {
            width: 3.5mm;
            height: 3.5mm;
          }

          .pilgrim-card__stat-label {
            margin: 0;
            font-size: 6.8pt;
            font-weight: 500;
            color: #64748b;
          }

          .pilgrim-card__stat-value {
            margin: 0;
            font-size: 7.8pt;
            font-weight: 700;
            line-height: 1.35;
            color: #1e293b;
            word-break: break-word;
          }

          .pilgrim-card__stat-subvalue {
            margin: 0.4mm 0 0;
            font-size: 6.2pt;
            font-weight: 500;
            line-height: 1.3;
            color: #64748b;
          }

          .pilgrim-card__companion-value {
            display: inline-flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 1mm;
          }

          .pilgrim-card__companion-part {
            display: inline-flex;
            align-items: center;
            gap: 0.5mm;
          }

          .pilgrim-card__companion-part svg {
            width: 3.2mm;
            height: 3.2mm;
            flex-shrink: 0;
          }

          .pilgrim-card__companion-total {
            font-weight: 700;
          }

          .pilgrim-card__panel {
            margin: 2.5mm;
            padding: 2.5mm;
            border: 0.25mm solid #e2e8f0;
            border-radius: 2.5mm;
            background: #fafbfc;
          }

          .pilgrim-card__panel-title {
            display: flex;
            align-items: center;
            gap: 1.2mm;
            margin: 0 0 2mm;
            font-size: 8.5pt;
            font-weight: 700;
            color: #334155;
          }

          .pilgrim-card__panel-title svg {
            width: 4mm;
            height: 4mm;
            color: ${CARD_TEAL};
          }

          .pilgrim-card__details {
            display: grid;
            gap: 1.2mm;
            margin-bottom: 2mm;
          }

          .pilgrim-card__detail-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 2mm;
            padding: 1.2mm 0;
            border-bottom: 0.15mm solid #e8edf2;
          }

          .pilgrim-card__detail-row:last-child {
            border-bottom: none;
          }

          .pilgrim-card__detail-key {
            display: flex;
            align-items: center;
            gap: 1.2mm;
            min-width: 0;
            font-size: 7pt;
            font-weight: 500;
            color: #64748b;
          }

          .pilgrim-card__detail-value {
            flex-shrink: 0;
            max-width: 58%;
            font-size: 7.5pt;
            font-weight: 700;
            color: #1e293b;
            text-align: left;
            word-break: break-word;
          }

          .pilgrim-card__owner-value {
            display: inline-flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: flex-end;
            gap: 0.8mm;
          }

          .pilgrim-card__detail-sep {
            opacity: 0.55;
          }

          .pilgrim-card__location-row {
            display: flex;
            justify-content: center;
            width: 100%;
          }

          .pilgrim-card__location-qr {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1mm;
            width: 100%;
            padding: 2.5mm 2mm;
            border: 0.25mm solid #e2e8f0;
            border-radius: 2mm;
            background: #fff;
            text-align: center;
          }

          .pilgrim-card__location-qr svg {
            width: 16mm;
            height: 16mm;
          }

          .pilgrim-card__location-title {
            margin: 0;
            font-size: 7pt;
            font-weight: 700;
            color: #334155;
          }

          .pilgrim-card__location-caption {
            margin: 0;
            font-size: 6pt;
            font-weight: 500;
            color: #64748b;
          }

          .pilgrim-card__custom-note {
            margin: 0 2.5mm 2mm;
            padding: 2mm 2.5mm;
            border: 0.25mm dashed #cbd5e1;
            border-radius: 2mm;
            background: #fff;
            font-size: 7.5pt;
            font-weight: 600;
            line-height: 1.45;
            color: #334155;
            white-space: pre-wrap;
            word-break: break-word;
          }

          .pilgrim-card__footer {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1.2mm;
            margin: 0 2.5mm 2.5mm;
            padding: 1.8mm 2mm;
            border-radius: 2mm;
            background: #f1f5f9;
            font-size: 6.8pt;
            font-weight: 600;
            color: #475569;
          }

          .pilgrim-card__footer svg {
            width: 3.8mm;
            height: 3.8mm;
            color: #4a6fa5;
            flex-shrink: 0;
          }
        }
      `}</style>

      <button
        type="button"
        onClick={handleOpenModal}
        className={
          className ??
          `${btnSecondary} inline-flex w-full items-center justify-center gap-1.5 sm:w-auto`
        }
      >
        <svg
          className="h-4 w-4 shrink-0"
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
        چاپ زائر کارت
      </button>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="چاپ زائر کارت"
      >
        <form
          ref={printFormRef}
          onSubmit={handleConfirmPrint}
          className="space-y-4"
        >
          <p className="text-sm text-slate-600">
            در صورت نیاز، توضیحات تکمیلی را وارد کنید تا در پایین زائر کارت چاپ
            شود.
          </p>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5] ring-1 ring-[#4a6fa5]/15">
                <NavIcon name="book" className="h-4 w-4" strokeWidth={1.75} />
              </span>
              توضیحات جهت درج در زائر کارت
            </span>
            <textarea
              ref={noteInputRef}
              value={draftNote}
              onChange={(event) => setDraftNote(event.target.value)}
              onKeyDown={handleNoteKeyDown}
              rows={4}
              maxLength={500}
              className={`${inputClass} resize-none`}
              placeholder="مثلاً شماره اتاق، نکات ویژه..."
            />
          </label>
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className={btnSecondary}
            >
              انصراف
            </button>
            <button ref={printSubmitRef} type="submit" className={btnPrimary}>
              چاپ زائر کارت
            </button>
          </div>
        </form>
      </Modal>

      {createPortal(
        <div id={printRootId} aria-hidden>
          <ReservationUserCardPrintContent
            reservation={reservation}
            footerNote={footerNote}
          />
        </div>,
        document.body,
      )}
    </>
  );
}
