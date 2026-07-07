import { useId, type ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  hasMawkibRulesForPrint,
  type MawkibRulesPrintData,
} from "../../lib/mawkib-rules-print";
import { buildMawkibLocationMapUrl, hasValidCoords } from "../../lib/geo";
import { btnSecondary } from "../../lib/styles";
import { toast } from "../../lib/toast";

const TEAL = "#1a3f3f";
const TEAL_LIGHT = "#e8f3f3";
const ACCENT = "#4a6fa5";
export const MAWKIB_RULES_PRINT_BODY_CLASS = "printing-mawkib-rules";

const iconProps = {
  fill: "none",
  viewBox: "0 0 24 24",
  stroke: "currentColor",
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
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

function IconBook() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m6-16.042A8.966 8.966 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25a8.966 8.966 0 016-2.292c0 0 0 0 0 0"
      />
    </svg>
  );
}

function IconRule() {
  return (
    <svg {...iconProps} className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function InfoTile({
  icon,
  label,
  value,
  valueDir,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueDir?: "ltr" | "rtl";
}) {
  return (
    <div className="mawkib-rules-sheet__info-tile">
      <span className="mawkib-rules-sheet__info-icon">{icon}</span>
      <div className="mawkib-rules-sheet__info-body">
        <p className="mawkib-rules-sheet__info-label">{label}</p>
        <p className="mawkib-rules-sheet__info-value" dir={valueDir}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function MawkibRulesPrintContent({
  data,
}: {
  data: MawkibRulesPrintData;
}) {
  const locationMapUrl =
    hasValidCoords(data.latitude, data.longitude)
      ? buildMawkibLocationMapUrl(data.latitude, data.longitude!, data.name)
      : null;

  return (
    <article className="mawkib-rules-sheet">
      <header className="mawkib-rules-sheet__hero">
        <div className="mawkib-rules-sheet__hero-badge">
          <IconBook />
          <span>قوانین و مقررات</span>
        </div>
        <h1 className="mawkib-rules-sheet__title">{data.name}</h1>
      </header>

      <section className="mawkib-rules-sheet__info">
        <InfoTile icon={<IconHome />} label="موکب" value={data.name} />
        <InfoTile
          icon={<IconPhone />}
          label="تلفن موکب"
          value={data.phoneNumber}
          valueDir="ltr"
        />
        <InfoTile
          icon={<IconUser />}
          label="مسئول موکب"
          value={data.ownerFullName}
        />
      </section>

      <section className="mawkib-rules-sheet__rules-panel">
        <div className="mawkib-rules-sheet__rules-heading">
          <IconBook />
          <h2>قوانین موکب</h2>
        </div>
        <div className="mawkib-rules-sheet__rules-body">
          <ul className="mawkib-rules-sheet__rules-list">
            {data.rules.map((rule, index) => (
              <li key={`${index}-${rule}`} className="mawkib-rules-sheet__rule">
                <span className="mawkib-rules-sheet__rule-icon" aria-hidden>
                  <IconRule />
                </span>
                <span className="mawkib-rules-sheet__rule-text">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="mawkib-rules-sheet__sheet-footer">
        {locationMapUrl && (
          <section className="mawkib-rules-sheet__location">
            <div className="mawkib-rules-sheet__location-qr">
              <QRCodeSVG value={locationMapUrl} size={96} level="M" />
            </div>
            <div className="mawkib-rules-sheet__location-text">
              <p className="mawkib-rules-sheet__location-caption">
                با اسکن بارکد، برنامه نقشه (گوگل‌مپ، نشان و ...) باز می‌شود
              </p>
              <p className="mawkib-rules-sheet__location-coords" dir="ltr">
                {data.latitude!.toFixed(5)}, {data.longitude!.toFixed(5)}
              </p>
            </div>
          </section>
        )}
      </footer>
    </article>
  );
}

export function mawkibRulesSheetStyles(): string {
  return `
    .mawkib-rules-sheet {
      box-sizing: border-box;
      width: 210mm;
      padding: 0;
      border-radius: 0;
      background: #fff;
      color: #1e293b;
      direction: rtl;
      font-family: Vazir, Tahoma, sans-serif;
    }

    @media screen {
      .mawkib-rules-sheet {
        min-height: 297mm;
        overflow: hidden;
      }
    }

    .mawkib-rules-sheet__hero {
      padding: 10mm 12mm 8mm;
      background: linear-gradient(135deg, ${TEAL} 0%, #245656 55%, ${ACCENT} 100%);
      color: #fff;
      text-align: center;
    }

    .mawkib-rules-sheet__hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 1.5mm;
      margin-bottom: 3mm;
      padding: 1.2mm 3mm;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.14);
      font-size: 9pt;
      font-weight: 600;
    }

    .mawkib-rules-sheet__hero-badge svg {
      width: 4mm;
      height: 4mm;
    }

    .mawkib-rules-sheet__title {
      margin: 0;
      font-size: 22pt;
      font-weight: 800;
      line-height: 1.35;
      text-shadow: 0 0.4mm 1.2mm rgba(0, 0, 0, 0.18);
    }

    .mawkib-rules-sheet__subtitle {
      margin: 2.5mm 0 0;
      font-size: 9.5pt;
      font-weight: 500;
      opacity: 0.92;
    }

    .mawkib-rules-sheet__info {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0;
      border-bottom: 0.3mm solid #e2e8f0;
      background: #fff;
    }

    .mawkib-rules-sheet__info-tile {
      display: flex;
      align-items: center;
      gap: 2mm;
      padding: 4mm 3mm;
      border-left: 0.25mm solid #e2e8f0;
    }

    .mawkib-rules-sheet__info-tile:first-child {
      border-left: none;
    }

    .mawkib-rules-sheet__info-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 9mm;
      height: 9mm;
      border-radius: 999px;
      background: ${TEAL_LIGHT};
      color: ${TEAL};
      flex-shrink: 0;
    }

    .mawkib-rules-sheet__info-icon svg {
      width: 4.5mm;
      height: 4.5mm;
    }

    .mawkib-rules-sheet__info-label {
      margin: 0;
      font-size: 7pt;
      font-weight: 500;
      color: #64748b;
    }

    .mawkib-rules-sheet__info-value {
      margin: 0.6mm 0 0;
      font-size: 9pt;
      font-weight: 700;
      line-height: 1.35;
      color: #0f172a;
      word-break: break-word;
    }

    .mawkib-rules-sheet__rules-panel {
      margin: 8mm 10mm 6mm;
      padding: 5mm 6mm;
      border: 0.35mm solid #dbe3ea;
      border-radius: 3mm;
      background: linear-gradient(180deg, #fcfdfe 0%, #f8fafc 100%);
      box-shadow: inset 0 0 0 0.2mm rgba(255, 255, 255, 0.8);
    }

    .mawkib-rules-sheet__rules-body {
      margin: 0;
      padding: 0;
    }

    .mawkib-rules-sheet__rules-heading {
      display: flex;
      align-items: center;
      gap: 2mm;
      margin-bottom: 4mm;
      padding-bottom: 3mm;
      border-bottom: 0.25mm solid #e2e8f0;
      color: ${TEAL};
    }

    .mawkib-rules-sheet__rules-heading svg {
      width: 5mm;
      height: 5mm;
    }

    .mawkib-rules-sheet__rules-heading h2 {
      margin: 0;
      font-size: 13pt;
      font-weight: 800;
      color: #1e293b;
    }

    .mawkib-rules-sheet__rules-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 2.5mm;
    }

    .mawkib-rules-sheet__rule {
      display: flex;
      align-items: flex-start;
      gap: 2.5mm;
      padding: 2.5mm 3mm;
      border-radius: 2mm;
      background: #fff;
      border: 0.2mm solid #e8eef2;
    }

    .mawkib-rules-sheet__rule-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 7mm;
      height: 7mm;
      margin-top: 0.3mm;
      border-radius: 999px;
      background: ${TEAL_LIGHT};
      color: ${TEAL};
      flex-shrink: 0;
    }

    .mawkib-rules-sheet__rule-icon svg {
      width: 4mm;
      height: 4mm;
    }

    .mawkib-rules-sheet__rule-text {
      flex: 1;
      font-size: 10.5pt;
      font-weight: 600;
      line-height: 1.65;
      color: #334155;
    }

    .mawkib-rules-sheet__footer {
      margin: 0 10mm 6mm;
      padding: 3mm 4mm;
      border-radius: 2mm;
      background: #f1f5f9;
      text-align: center;
      font-size: 8.5pt;
      font-weight: 600;
      color: #475569;
    }

    .mawkib-rules-sheet__location {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5mm;
      margin: 0 10mm 10mm;
      padding: 4mm 5mm;
      border: 0.3mm solid #dbe3ea;
      border-radius: 3mm;
      background: #fff;
    }

    .mawkib-rules-sheet__sheet-footer {
      margin: 0 10mm 10mm;
      padding: 0;
    }

    @media print {
      .mawkib-rules-sheet {
        width: 100%;
        min-height: auto;
        overflow: visible;
      }

      .mawkib-rules-sheet__hero,
      .mawkib-rules-sheet__info {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .mawkib-rules-sheet__rules-panel {
        margin: 6mm 0;
        padding: 0;
        border: none;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
      }

      .mawkib-rules-sheet__rules-heading {
        break-after: avoid;
        page-break-after: avoid;
        margin-bottom: 3mm;
        padding-bottom: 2mm;
      }

      .mawkib-rules-sheet__rules-list {
        gap: 2mm;
      }

      .mawkib-rules-sheet__rule {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .mawkib-rules-sheet__sheet-footer {
        break-inside: avoid;
        page-break-inside: avoid;
        margin: 4mm 0 0;
      }

      .mawkib-rules-sheet__location {
        margin: 0;
      }
    }

    .mawkib-rules-sheet__location-qr {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2mm;
      border: 0.25mm solid #e2e8f0;
      border-radius: 2mm;
      background: #fff;
      flex-shrink: 0;
    }

    .mawkib-rules-sheet__location-qr svg {
      display: block;
      width: 24mm;
      height: 24mm;
    }

    .mawkib-rules-sheet__location-text {
      text-align: center;
    }

    .mawkib-rules-sheet__location-title {
      margin: 0;
      font-size: 11pt;
      font-weight: 800;
      color: ${TEAL};
    }

    .mawkib-rules-sheet__location-caption {
      margin: 1.5mm 0 0;
      font-size: 8.5pt;
      font-weight: 500;
      line-height: 1.55;
      color: #64748b;
    }

    .mawkib-rules-sheet__location-coords {
      margin: 2mm 0 0;
      font-size: 8pt;
      font-weight: 600;
      color: #94a3b8;
      font-family: ui-monospace, monospace;
    }
  `;
}

export function mawkibRulesPrintStyles(scopeId: string): string {
  const scope = `#${scopeId}`;

  return `
    ${mawkibRulesSheetStyles()}

    ${scope} {
      display: none;
    }

    @media print {
      @page {
        size: A4 portrait;
        margin: 10mm;
      }

      html,
      body {
        height: auto !important;
        overflow: visible !important;
        background: white !important;
      }

      body.${MAWKIB_RULES_PRINT_BODY_CLASS} * {
        visibility: hidden !important;
      }

      body.${MAWKIB_RULES_PRINT_BODY_CLASS} ${scope},
      body.${MAWKIB_RULES_PRINT_BODY_CLASS} ${scope} * {
        visibility: visible !important;
      }

      body.${MAWKIB_RULES_PRINT_BODY_CLASS} ${scope} {
        display: block !important;
        position: static !important;
        inset: auto !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
      }

      .mawkib-rules-sheet {
        margin: 0 auto;
        box-shadow: none;
      }
    }
  `;
}

interface MawkibRulesPrintButtonProps {
  data: MawkibRulesPrintData;
  className?: string;
  disabled?: boolean;
}

export function MawkibRulesPrintButton({
  data,
  className,
  disabled,
}: MawkibRulesPrintButtonProps) {
  const printRootId = useId().replace(/:/g, "");
  const canPrint = hasMawkibRulesForPrint(data);
  const isDisabled = disabled || !canPrint;

  const handlePrint = () => {
    if (!canPrint) {
      toast.error("قوانینی برای این موکب ثبت نشده است");
      return;
    }

    const printRoot = document.getElementById(printRootId);
    if (!printRoot) return;

    const placeholder = document.createComment("mawkib-rules-print-anchor");
    const originalParent = printRoot.parentNode;
    const originalNextSibling = printRoot.nextSibling;

    document.body.classList.add(MAWKIB_RULES_PRINT_BODY_CLASS);
    originalParent?.insertBefore(placeholder, printRoot);
    document.body.appendChild(printRoot);

    const cleanup = () => {
      document.body.classList.remove(MAWKIB_RULES_PRINT_BODY_CLASS);
      if (placeholder.parentNode) {
        placeholder.parentNode.insertBefore(printRoot, placeholder);
        placeholder.remove();
      } else if (originalParent) {
        originalParent.insertBefore(
          printRoot,
          originalNextSibling ?? null,
        );
      }
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);
    window.requestAnimationFrame(() => window.print());
  };

  return (
    <>
      <style>{mawkibRulesPrintStyles(printRootId)}</style>

      <button
        type="button"
        onClick={handlePrint}
        disabled={isDisabled}
        title={isDisabled ? "قوانینی برای چاپ ثبت نشده است" : undefined}
        className={
          className ??
          `${btnSecondary} w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-50`
        }
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
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m6-16.042A8.966 8.966 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25a8.966 8.966 0 016-2.292c0 0 0 0 0 0"
          />
        </svg>
        چاپ قوانین
      </button>

      <div id={printRootId} aria-hidden>
        <MawkibRulesPrintContent data={data} />
      </div>
    </>
  );
}
