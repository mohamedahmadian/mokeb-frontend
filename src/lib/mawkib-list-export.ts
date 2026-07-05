import { formatPersianNumber } from './capacity';
import { MAWKIB_STATUS_LABELS } from './constants';
import { mawkibCityLabel, mawkibCountryLabel } from './mawkib-locations';
import type { Mawkib } from '../types';

export interface MawkibExportOptions {
  includeOwner?: boolean;
  includeStatus?: boolean;
}

export interface MawkibExportRow {
  index: number;
  id: string;
  name: string;
  ownerName: string;
  ownerMobile: string;
  ownerProvince: string;
  ownerCity: string;
  address: string;
  country: string;
  mawkibCity: string;
  phoneNumber: string;
  distanceToShrine: string;
  description: string;
  facilities: string;
  services: string;
  rules: string;
  maleCapacityTotal: string;
  maleCapacityAvailable: string;
  femaleCapacityTotal: string;
  femaleCapacityAvailable: string;
  serviceStartDate: string;
  serviceEndDate: string;
  defaultCheckInTime: string;
  defaultCheckOutTime: string;
  maxReservationDays: string;
  defaultReservationDays: string;
  onlineReservationEnabled: string;
  breakfastReception: string;
  lunchReception: string;
  dinnerReception: string;
  bathroom: string;
  laundry: string;
  parking: string;
  internet: string;
  familyFriendly: string;
  telegramChannel: string;
  whatsapp: string;
  bale: string;
  eitaa: string;
  websiteUrl: string;
  latitude: string;
  longitude: string;
  reservationCount: string;
  status: string;
}

export interface MawkibListStats {
  total: number;
  approvedCount: number;
  pendingCount: number;
}

type ExportColumn = {
  header: string;
  value: (row: MawkibExportRow) => string;
  ownerOnly?: boolean;
  adminOnly?: boolean;
};

const EXPORT_COLUMNS: ExportColumn[] = [
  { header: 'ردیف', value: (row) => String(row.index) },
  { header: 'شناسه', value: (row) => row.id },
  { header: 'نام موکب', value: (row) => row.name },
  { header: 'مسئول', value: (row) => row.ownerName, ownerOnly: true },
  { header: 'موبایل مسئول', value: (row) => row.ownerMobile, ownerOnly: true },
  { header: 'استان مسئول', value: (row) => row.ownerProvince, ownerOnly: true },
  { header: 'شهر مسئول', value: (row) => row.ownerCity, ownerOnly: true },
  { header: 'کشور', value: (row) => row.country },
  { header: 'شهر موکب', value: (row) => row.mawkibCity },
  { header: 'آدرس', value: (row) => row.address },
  { header: 'تلفن موکب', value: (row) => row.phoneNumber },
  { header: 'فاصله تا حرم', value: (row) => row.distanceToShrine },
  { header: 'توضیحات', value: (row) => row.description },
  { header: 'امکانات (متن)', value: (row) => row.facilities },
  { header: 'خدمات (متن)', value: (row) => row.services },
  { header: 'قوانین', value: (row) => row.rules },
  { header: 'ظرفیت کل آقایان', value: (row) => row.maleCapacityTotal },
  { header: 'ظرفیت آزاد آقایان', value: (row) => row.maleCapacityAvailable },
  { header: 'ظرفیت کل بانوان', value: (row) => row.femaleCapacityTotal },
  { header: 'ظرفیت آزاد بانوان', value: (row) => row.femaleCapacityAvailable },
  { header: 'شروع خدمات', value: (row) => row.serviceStartDate },
  { header: 'پایان خدمات', value: (row) => row.serviceEndDate },
  { header: 'ساعت ورود پیش‌فرض', value: (row) => row.defaultCheckInTime },
  { header: 'ساعت خروج پیش‌فرض', value: (row) => row.defaultCheckOutTime },
  { header: 'حداکثر روز رزرو', value: (row) => row.maxReservationDays },
  { header: 'روز پیش‌فرض رزرو', value: (row) => row.defaultReservationDays },
  { header: 'رزرو آنلاین', value: (row) => row.onlineReservationEnabled },
  { header: 'پذیرایی صبحانه', value: (row) => row.breakfastReception },
  { header: 'پذیرایی ناهار', value: (row) => row.lunchReception },
  { header: 'پذیرایی شام', value: (row) => row.dinnerReception },
  { header: 'حمام', value: (row) => row.bathroom },
  { header: 'لباسشویی', value: (row) => row.laundry },
  { header: 'پارکینگ', value: (row) => row.parking },
  { header: 'اینترنت', value: (row) => row.internet },
  { header: 'خانوادگی', value: (row) => row.familyFriendly },
  { header: 'کانال تلگرام', value: (row) => row.telegramChannel },
  { header: 'واتس‌اپ', value: (row) => row.whatsapp },
  { header: 'بله', value: (row) => row.bale },
  { header: 'ایتا', value: (row) => row.eitaa },
  { header: 'وب‌سایت', value: (row) => row.websiteUrl },
  { header: 'عرض جغرافیایی', value: (row) => row.latitude },
  { header: 'طول جغرافیایی', value: (row) => row.longitude },
  { header: 'تعداد رزروها', value: (row) => row.reservationCount },
  { header: 'وضعیت', value: (row) => row.status, adminOnly: true },
];

function sanitizeCellText(value?: string | null): string {
  if (!value?.trim()) return '—';
  return value.replace(/\r?\n/g, ' ').trim();
}

function formatBool(value?: boolean | null): string {
  return value ? 'بله' : 'خیر';
}

function formatOptionalNumber(value?: number | null): string {
  if (value == null) return '—';
  return formatPersianNumber(value);
}

function formatServiceDate(date?: string | null): string {
  if (!date) return '—';
  return new Date(date.slice(0, 10)).toLocaleDateString('fa-IR');
}

function formatCoordinate(value?: number | null): string {
  if (value == null) return '—';
  return String(value);
}

function activeColumns(options: MawkibExportOptions): ExportColumn[] {
  return EXPORT_COLUMNS.filter((column) => {
    if (column.ownerOnly && !options.includeOwner) return false;
    if (column.adminOnly && !options.includeStatus) return false;
    return true;
  });
}

export function exportHeader(options: MawkibExportOptions = {}): string[] {
  return activeColumns(options).map((column) => column.header);
}

export function exportRowValues(
  row: MawkibExportRow,
  options: MawkibExportOptions = {},
): string[] {
  return activeColumns(options).map((column) => column.value(row));
}

export function mapMawkibsToExportRows(
  mawkibs: Mawkib[],
  _options: MawkibExportOptions = {},
): MawkibExportRow[] {
  return mawkibs.map((mawkib, index) => ({
    index: index + 1,
    id: formatPersianNumber(mawkib.id),
    name: mawkib.name,
    ownerName: mawkib.owner?.fullName ?? '—',
    ownerMobile: mawkib.owner?.mobileNumber ?? '—',
    ownerProvince: sanitizeCellText(mawkib.owner?.province),
    ownerCity: sanitizeCellText(mawkib.owner?.city),
    address: sanitizeCellText(mawkib.address),
    country: mawkibCountryLabel(mawkib.country),
    mawkibCity: mawkibCityLabel(mawkib.mawkibCity),
    phoneNumber: mawkib.phoneNumber,
    distanceToShrine: sanitizeCellText(mawkib.distanceToShrine),
    description: sanitizeCellText(mawkib.description),
    facilities: sanitizeCellText(mawkib.facilities),
    services: sanitizeCellText(mawkib.services),
    rules: sanitizeCellText(mawkib.rules),
    maleCapacityTotal: formatOptionalNumber(mawkib.maleCapacity),
    maleCapacityAvailable: formatOptionalNumber(mawkib.availableMaleCapacity),
    femaleCapacityTotal: formatOptionalNumber(mawkib.femaleCapacity),
    femaleCapacityAvailable: formatOptionalNumber(mawkib.availableFemaleCapacity),
    serviceStartDate: formatServiceDate(mawkib.serviceStartDate),
    serviceEndDate: formatServiceDate(mawkib.serviceEndDate),
    defaultCheckInTime: mawkib.defaultCheckInTime ?? '—',
    defaultCheckOutTime: mawkib.defaultCheckOutTime ?? '—',
    maxReservationDays: formatOptionalNumber(mawkib.maxReservationDays),
    defaultReservationDays: formatOptionalNumber(mawkib.defaultReservationDays),
    onlineReservationEnabled: formatBool(mawkib.onlineReservationEnabled),
    breakfastReception: formatBool(mawkib.breakfastReception),
    lunchReception: formatBool(mawkib.lunchReception),
    dinnerReception: formatBool(mawkib.dinnerReception),
    bathroom: formatBool(mawkib.bathroom),
    laundry: formatBool(mawkib.laundry),
    parking: formatBool(mawkib.parking),
    internet: formatBool(mawkib.internet),
    familyFriendly: formatBool(mawkib.familyFriendly),
    telegramChannel: sanitizeCellText(mawkib.telegramChannel),
    whatsapp: sanitizeCellText(mawkib.whatsapp),
    bale: sanitizeCellText(mawkib.bale),
    eitaa: sanitizeCellText(mawkib.eitaa),
    websiteUrl: sanitizeCellText(mawkib.websiteUrl),
    latitude: formatCoordinate(mawkib.latitude),
    longitude: formatCoordinate(mawkib.longitude),
    reservationCount: formatOptionalNumber(mawkib._count?.reservations ?? 0),
    status: MAWKIB_STATUS_LABELS[mawkib.status] ?? mawkib.status,
  }));
}

export function computeMawkibListStats(mawkibs: Mawkib[]): MawkibListStats {
  let approvedCount = 0;
  let pendingCount = 0;

  for (const mawkib of mawkibs) {
    if (mawkib.status === 'Approved') approvedCount += 1;
    if (mawkib.status === 'Pending') pendingCount += 1;
  }

  return {
    total: mawkibs.length,
    approvedCount,
    pendingCount,
  };
}

export function buildMawkibTextExport(
  rows: MawkibExportRow[],
  stats: MawkibListStats,
  options: MawkibExportOptions = {},
  title = 'لیست موکب‌ها',
): string {
  const header = exportHeader(options);
  const lines = [
    title,
    `تاریخ تهیه: ${new Date().toLocaleDateString('fa-IR')}`,
    '',
    header.join('\t'),
    ...rows.map((row) => exportRowValues(row, options).join('\t')),
    '',
    `تعداد کل موکب‌ها: ${formatPersianNumber(stats.total)}`,
    `تأیید شده: ${formatPersianNumber(stats.approvedCount)}`,
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

export function buildMawkibExcelExport(
  rows: MawkibExportRow[],
  stats: MawkibListStats,
  options: MawkibExportOptions = {},
  title = 'لیست موکب‌ها',
): string {
  const header = exportHeader(options);
  const headerRow = excelRow(header.map((cell) => excelCell(cell, 'header')).join(''));
  const bodyRows = rows
    .map((row) =>
      excelRow(
        exportRowValues(row, options)
          .map((cell, i) =>
            i === 0 ? excelCell(cell, 'rtl', 'Number') : excelCell(cell),
          )
          .join(''),
      ),
    )
    .join('\n');

  const summaryRows = [
    excelRow(''),
    excelRow(excelCell(`تعداد کل موکب‌ها: ${formatPersianNumber(stats.total)}`, 'summary')),
    excelRow(excelCell(`تأیید شده: ${formatPersianNumber(stats.approvedCount)}`, 'summary')),
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
<Worksheet ss:Name="لیست موکب‌ها">
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

export function downloadMawkibExport(
  content: string,
  filename: string,
  mimeType: string,
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function mawkibExportFilename(ext: 'txt' | 'xls') {
  const stamp = new Date().toISOString().slice(0, 10);
  return `mawkib-list-${stamp}.${ext}`;
}
