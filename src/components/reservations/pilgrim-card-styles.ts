import { PRINT_CARD_HERO_IMAGE_CSS } from '../mawkibs/PrintCardHeroImage';

export const CARD_TEAL = '#1a3f3f';
export const CARD_TEAL_LIGHT = '#e8f3f3';

/** استایل نمایش زائر کارت روی صفحه (نه فقط چاپ) */
export function pilgrimCardScreenCss(rootClass = 'pilgrim-card-screen-root') {
  const r = `.${rootClass}`;
  return `
${PRINT_CARD_HERO_IMAGE_CSS}
${r} {
  display: flex;
  justify-content: center;
  width: 100%;
}

${r} .pilgrim-card-shell {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: 28rem;
  overflow: hidden;
  border: 3px solid var(--pilgrim-weekday-border, #94a3b8);
  border-radius: 1.25rem;
  background: #fff;
  font-family: Vazir, Tahoma, sans-serif;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 8px 24px rgba(15, 23, 42, 0.06);
}

${r} .pilgrim-card__weekday-dot {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  z-index: 2;
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 999px;
  background: var(--pilgrim-weekday-accent, #64748b);
  border: 2px solid #fff;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--pilgrim-weekday-accent, #64748b) 45%, transparent),
    0 2px 6px color-mix(in srgb, var(--pilgrim-weekday-accent, #64748b) 35%, transparent);
}

${r} .pilgrim-card__weekday-banner {
  margin: 0;
  padding: 0.65rem 1rem;
  background: linear-gradient(
    180deg,
    var(--pilgrim-weekday-color, #f1f5f9) 0%,
    color-mix(in srgb, var(--pilgrim-weekday-color, #f1f5f9) 58%, #ffffff) 100%
  );
  border-bottom: 1px solid color-mix(in srgb, var(--pilgrim-weekday-border, #94a3b8) 70%, transparent);
  color: var(--pilgrim-weekday-text, #475569);
  text-align: center;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1.2;
}

${r} .pilgrim-card-shell .pilgrim-card {
  border: none;
  border-radius: 0;
  box-shadow: none;
  max-width: none;
}

${r} .pilgrim-card {
  box-sizing: border-box;
  width: 100%;
  max-width: 28rem;
  overflow: hidden;
  border: 1px solid #dbe3ea;
  border-radius: 1rem;
  background: #fff;
  font-family: Vazir, Tahoma, sans-serif;
  color: #1e293b;
  direction: rtl;
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.08);
}

${r} .pilgrim-card__header {
  display: flex;
  min-height: 8.5rem;
}

${r} .pilgrim-card__header-qr {
  flex: 0 0 34%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.85rem 0.75rem 0.85rem 0.85rem;
  background: ${CARD_TEAL};
  color: #fff;
  direction: ltr;
}

${r} .pilgrim-card__header-qr svg {
  display: block;
  width: 5.75rem;
  height: 5.75rem;
}

${r} .pilgrim-card__header-qr-label {
  margin: 0.25rem 0 0;
  width: 100%;
  font-size: 0.7rem;
  font-weight: 500;
  opacity: 0.92;
  text-align: left;
}

${r} .pilgrim-card__header-qr-code {
  margin: 0;
  width: 100%;
  font-size: 0.68rem;
  font-weight: 700;
  font-family: ui-monospace, monospace;
  letter-spacing: 0.04em;
  line-height: 1.35;
  word-break: break-all;
  text-align: left;
}

${r} .pilgrim-card__header-hero {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #334155;
}

${r} .pilgrim-card__hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.4rem;
  padding: 0.85rem;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.72) 100%);
}

${r} .pilgrim-card__hero-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.25;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
}

${r} .pilgrim-card__hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  align-self: flex-start;
  margin: 0;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.55);
  font-size: 0.7rem;
  font-weight: 600;
  color: #fff;
}

${r} .pilgrim-card__hero-badge svg {
  width: 0.9rem;
  height: 0.9rem;
  flex-shrink: 0;
}

${r} .pilgrim-card__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-bottom: 1px solid #e2e8f0;
  background: #fff;
}

${r} .pilgrim-card__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.65rem 0.35rem;
  text-align: center;
  border-left: 1px solid #e2e8f0;
}

${r} .pilgrim-card__stat:first-child {
  border-left: none;
}

${r} .pilgrim-card__circle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.65rem;
  height: 1.65rem;
  border-radius: 999px;
  background: ${CARD_TEAL_LIGHT};
  color: ${CARD_TEAL};
}

${r} .pilgrim-card__circle-icon svg {
  width: 0.9rem;
  height: 0.9rem;
}

${r} .pilgrim-card__stat-label {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 500;
  color: #64748b;
}

${r} .pilgrim-card__stat-value {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.35;
  color: #1e293b;
  word-break: break-word;
}

${r} .pilgrim-card__stat-subvalue {
  margin: 0.1rem 0 0;
  font-size: 0.62rem;
  font-weight: 500;
  line-height: 1.3;
  color: #64748b;
}

${r} .pilgrim-card__companion-value {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

${r} .pilgrim-card__companion-part {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
}

${r} .pilgrim-card__companion-part svg {
  width: 0.85rem;
  height: 0.85rem;
}

${r} .pilgrim-card__panel {
  margin: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.65rem;
  background: #fafbfc;
}

${r} .pilgrim-card__panel-title {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0 0 0.5rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: #334155;
}

${r} .pilgrim-card__panel-title svg {
  width: 1rem;
  height: 1rem;
  color: ${CARD_TEAL};
}

${r} .pilgrim-card__details {
  display: grid;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
}

${r} .pilgrim-card__detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.35rem 0;
  border-bottom: 1px solid #e8edf2;
}

${r} .pilgrim-card__detail-row:last-child {
  border-bottom: none;
}

${r} .pilgrim-card__detail-key {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
  font-size: 0.72rem;
  font-weight: 500;
  color: #64748b;
}

${r} .pilgrim-card__detail-value {
  flex-shrink: 0;
  max-width: 58%;
  font-size: 0.74rem;
  font-weight: 700;
  color: #1e293b;
  text-align: left;
  word-break: break-word;
}

${r} .pilgrim-card__owner-value {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
}

${r} .pilgrim-card__location-row {
  display: flex;
  justify-content: center;
  width: 100%;
}

${r} .pilgrim-card__location-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  width: 100%;
  padding: 0.75rem 0.65rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #fff;
  text-align: center;
}

${r} .pilgrim-card__location-title {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  color: #334155;
}

${r} .pilgrim-card__location-caption {
  margin: 0;
  font-size: 0.65rem;
  color: #64748b;
}

${r} .pilgrim-card__custom-note {
  margin: 0 0.75rem 0.75rem;
  padding: 0.65rem 0.75rem;
  border: 1px dashed #cbd5e1;
  border-radius: 0.5rem;
  background: #fff;
  font-size: 0.74rem;
  font-weight: 600;
  line-height: 1.45;
  color: #334155;
  white-space: pre-wrap;
  word-break: break-word;
}

${r} .pilgrim-card__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  margin: 0 0.75rem 0.75rem;
  padding: 0.55rem 0.65rem;
  border-radius: 0.5rem;
  background: #f1f5f9;
  font-size: 0.7rem;
  font-weight: 600;
  color: #475569;
}

${r} .pilgrim-card__footer svg {
  width: 1rem;
  height: 1rem;
  color: #4a6fa5;
  flex-shrink: 0;
}
`;
}
