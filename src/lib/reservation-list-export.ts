import { formatGuestCount, formatPersianNumber } from './capacity';
import { RESERVATION_STATUS_LABELS } from './constants';
import {
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_CHECK_OUT_TIME,
  formatTimeFa,
  formatTimeFromIso,
} from './format-time';
import type { Reservation } from '../types';

export interface ReservationExportOptions {
  includePilgrim?: boolean;
  /** Hide check-in/out columns (pilgrim print) */
  compactColumns?: boolean;
}

export interface ReservationExportRow {
  index: number;
  trackingCode: string;
  mawkibName: string;
  pilgrimName: string;
  pilgrimMobile: string;
  guestCount: string;
  startDate: string;
  endDate: string;
  checkInTime: string;
  checkOutTime: string;
  status: string;
}

export interface ReservationListStats {
  total: number;
  confirmedCount: number;
  pendingCount: number;
}

function formatReservationDate(date?: string | null): string {
  if (!date) return '—';
  return new Date(date.slice(0, 10)).toLocaleDateString('fa-IR');
}

function resolveCheckInTime(reservation: Reservation): string {
  if (reservation.actualCheckInAt) {
    return formatTimeFromIso(reservation.actualCheckInAt) || '—';
  }
  return formatTimeFa(
    reservation.plannedCheckInTime ??
      reservation.mawkib.defaultCheckInTime ??
      DEFAULT_CHECK_IN_TIME,
  );
}

function resolveCheckOutTime(reservation: Reservation): string {
  if (reservation.actualCheckOutAt) {
    return formatTimeFromIso(reservation.actualCheckOutAt) || '—';
  }
  return formatTimeFa(
    reservation.plannedCheckOutTime ??
      reservation.mawkib.defaultCheckOutTime ??
      DEFAULT_CHECK_OUT_TIME,
  );
}

export function mapReservationsToExportRows(
  reservations: Reservation[],
  options: ReservationExportOptions = {},
): ReservationExportRow[] {
  return reservations.map((reservation, index) => ({
    index: index + 1,
    trackingCode: reservation.trackingCode,
    mawkibName: reservation.mawkib.name,
    pilgrimName: options.includePilgrim ? reservation.pilgrim.fullName : '',
    pilgrimMobile: reservation.pilgrimMobile || reservation.pilgrim.mobileNumber,
    guestCount: formatGuestCount(reservation.maleGuestCount, reservation.femaleGuestCount),
    startDate: formatReservationDate(reservation.reservationDate),
    endDate: formatReservationDate(
      reservation.reservationEndDate ?? reservation.reservationDate,
    ),
    checkInTime: resolveCheckInTime(reservation),
    checkOutTime: resolveCheckOutTime(reservation),
    status: RESERVATION_STATUS_LABELS[reservation.status] ?? reservation.status,
  }));
}

export function computeReservationListStats(
  reservations: Reservation[],
): ReservationListStats {
  let confirmedCount = 0;
  let pendingCount = 0;

  for (const reservation of reservations) {
    if (reservation.status === 'Confirmed') confirmedCount += 1;
    if (reservation.status === 'Pending') pendingCount += 1;
  }

  return {
    total: reservations.length,
    confirmedCount,
    pendingCount,
  };
}

function exportHeader(options: ReservationExportOptions): string[] {
  const header = ['ردیف', 'شناسه رزرو', 'موکب'];
  if (options.includePilgrim) header.push('زائر');
  header.push(
    'موبایل',
    'تعداد',
    'تاریخ شروع',
    'تاریخ پایان',
  );
  if (!options.compactColumns) {
    header.push(
      'ساعت ورود',
      'ساعت خروج',
    );
  }
  header.push('وضعیت');
  return header;
}

export function reservationExportHeader(options: ReservationExportOptions = {}): string[] {
  return exportHeader(options);
}

function rowCells(row: ReservationExportRow, options: ReservationExportOptions): string[] {
  const cells = [String(row.index), row.trackingCode, row.mawkibName];
  if (options.includePilgrim) cells.push(row.pilgrimName);
  cells.push(
    row.pilgrimMobile,
    row.guestCount,
    row.startDate,
    row.endDate,
  );
  if (!options.compactColumns) {
    cells.push(
      row.checkInTime,
      row.checkOutTime,
    );
  }
  cells.push(row.status);
  return cells;
}

export function reservationExportRowValues(
  row: ReservationExportRow,
  options: ReservationExportOptions = {},
): string[] {
  return rowCells(row, options);
}

export function buildReservationTextExport(
  rows: ReservationExportRow[],
  stats: ReservationListStats,
  options: ReservationExportOptions = {},
  title = 'لیست رزروها',
): string {
  const header = exportHeader(options);
  const lines = [
    title,
    `تاریخ تهیه: ${new Date().toLocaleDateString('fa-IR')}`,
    '',
    header.join('\t'),
    ...rows.map((row) => rowCells(row, options).join('\t')),
    '',
    `تعداد کل رزروها: ${formatPersianNumber(stats.total)}`,
    `تأیید شده: ${formatPersianNumber(stats.confirmedCount)}`,
    `در انتظار: ${formatPersianNumber(stats.pendingCount)}`,
  ];
  return lines.join('\n');
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function excelCell(
  value: string | number,
  styleId = 'rtl',
  type: 'String' | 'Number' = 'String',
): string {
  const dataType = typeof value === 'number' ? 'Number' : type;
  return `<Cell ss:StyleID="${styleId}"><Data ss:Type="${dataType}">${escapeXml(String(value))}</Data></Cell>`;
}

function excelRow(cells: string): string {
  return `<Row>${cells}</Row>`;
}

export function buildReservationExcelExport(
  rows: ReservationExportRow[],
  stats: ReservationListStats,
  options: ReservationExportOptions = {},
  title = 'لیست رزروها',
): string {
  const header = exportHeader(options);
  const headerRow = excelRow(header.map((cell) => excelCell(cell, 'header')).join(''));
  const bodyRows = rows
    .map((row) =>
      excelRow(
        rowCells(row, options)
          .map((cell, i) =>
            i === 0 ? excelCell(cell, 'rtl', 'Number') : excelCell(cell),
          )
          .join(''),
      ),
    )
    .join('\n');

  const summaryRows = [
    excelRow(''),
    excelRow(excelCell(`تعداد کل رزروها: ${formatPersianNumber(stats.total)}`, 'summary')),
    excelRow(excelCell(`تأیید شده: ${formatPersianNumber(stats.confirmedCount)}`, 'summary')),
    excelRow(excelCell(`در انتظار: ${formatPersianNumber(stats.pendingCount)}`, 'summary')),
  ].join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
  <Style ss:ID="Default" ss:Name="Normal">
    <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:ReadingOrder="RightToLeft"/>
    <Font ss:FontName="Tahoma" x:Family="Swiss" ss:Size="11"/>
  </Style>
  <Style ss:ID="rtl" ss:Parent="Default">
    <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:ReadingOrder="RightToLeft"/>
  </Style>
  <Style ss:ID="header" ss:Parent="Default">
    <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:ReadingOrder="RightToLeft"/>
    <Font ss:FontName="Tahoma" x:Family="Swiss" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#1A2744" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="summary" ss:Parent="Default">
    <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:ReadingOrder="RightToLeft"/>
    <Font ss:FontName="Tahoma" x:Family="Swiss" ss:Size="11" ss:Bold="1"/>
  </Style>
  <Style ss:ID="title" ss:Parent="Default">
    <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:ReadingOrder="RightToLeft"/>
    <Font ss:FontName="Tahoma" x:Family="Swiss" ss:Size="14" ss:Bold="1"/>
  </Style>
</Styles>
<Worksheet ss:Name="لیست رزروها">
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
    <DisplayRightToLeft/>
  </WorksheetOptions>
  <Table>
    ${excelRow(excelCell(title, 'title'))}
    ${excelRow(excelCell(`تاریخ تهیه: ${new Date().toLocaleDateString('fa-IR')}`, 'summary'))}
    ${excelRow('')}
    ${headerRow}
    ${bodyRows}
    ${summaryRows}
  </Table>
</Worksheet>
</Workbook>`;
}

export function downloadReservationExport(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function reservationExportFilename(ext: 'txt' | 'xls'): string {
  const date = new Date().toISOString().slice(0, 10);
  return `reservations-${date}.${ext}`;
}
