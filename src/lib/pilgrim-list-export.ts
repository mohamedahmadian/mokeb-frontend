import { splitFullName } from './full-name';
import { formatPersianNumber } from './capacity';
import { formatPersianDate } from '../components/ui/PersianDateInput';
import type { AdminUser, UserGender } from '../types';
import { userGenderLabel } from './user-gender';

export interface PilgrimExportRow {
  index: number;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  nationalId: string;
  gender: UserGender | null;
  birthDate: string;
}

export interface PilgrimListStats {
  total: number;
  maleCount: number;
  femaleCount: number;
  unknownGenderCount: number;
}

export function mapPilgrimsToExportRows(pilgrims: AdminUser[]): PilgrimExportRow[] {
  return pilgrims.map((pilgrim, index) => {
    const { firstName, lastName } = splitFullName(pilgrim.fullName);
    return {
      index: index + 1,
      firstName,
      lastName,
      mobileNumber: pilgrim.mobileNumber,
      nationalId: pilgrim.nationalId?.trim() || '—',
      gender: pilgrim.gender ?? null,
      birthDate: pilgrim.birthDate
        ? formatPersianDate(pilgrim.birthDate.slice(0, 10))
        : '—',
    };
  });
}

export function computePilgrimListStats(rows: PilgrimExportRow[]): PilgrimListStats {
  let maleCount = 0;
  let femaleCount = 0;
  let unknownGenderCount = 0;

  for (const row of rows) {
    if (row.gender === 'Male') maleCount += 1;
    else if (row.gender === 'Female') femaleCount += 1;
    else unknownGenderCount += 1;
  }

  return {
    total: rows.length,
    maleCount,
    femaleCount,
    unknownGenderCount,
  };
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildPilgrimTextExport(
  rows: PilgrimExportRow[],
  stats: PilgrimListStats,
  title = 'لیست زائرین',
): string {
  const header = ['ردیف', 'نام', 'نام خانوادگی', 'تلفن همراه', 'کد ملی', 'جنسیت', 'تاریخ تولد'];
  const lines = [
    title,
    `تاریخ تهیه: ${new Date().toLocaleDateString('fa-IR')}`,
    '',
    header.join('\t'),
    ...rows.map((row) =>
      [
        row.index,
        row.firstName,
        row.lastName,
        row.mobileNumber,
        row.nationalId,
        userGenderLabel(row.gender),
        row.birthDate,
      ].join('\t'),
    ),
    '',
    `تعداد کل زائرین: ${formatPersianNumber(stats.total)}`,
    `تعداد آقایان: ${formatPersianNumber(stats.maleCount)}`,
    `تعداد بانوان: ${formatPersianNumber(stats.femaleCount)}`,
  ];

  if (stats.unknownGenderCount > 0) {
    lines.push(
      `بدون جنسیت ثبت‌شده: ${formatPersianNumber(stats.unknownGenderCount)}`,
    );
  }

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

function excelRow(cells: string, height?: number): string {
  const heightAttr = height ? ` ss:Height="${height}"` : '';
  return `<Row${heightAttr}>${cells}</Row>`;
}

export function buildPilgrimExcelExport(
  rows: PilgrimExportRow[],
  stats: PilgrimListStats,
  title = 'لیست زائرین',
): string {
  const header = ['ردیف', 'نام', 'نام خانوادگی', 'تلفن همراه', 'کد ملی', 'جنسیت', 'تاریخ تولد'];
  const headerRow = excelRow(header.map((cell) => excelCell(cell, 'header')).join(''));

  const bodyRows = rows
    .map((row) =>
      excelRow(
        [
          excelCell(row.index, 'rtl', 'Number'),
          excelCell(row.firstName),
          excelCell(row.lastName),
          excelCell(row.mobileNumber),
          excelCell(row.nationalId),
          excelCell(userGenderLabel(row.gender)),
          excelCell(row.birthDate),
        ].join(''),
      ),
    )
    .join('\n');

  const summaryRows = [
    excelRow(''),
    excelRow(excelCell(`تعداد کل زائرین: ${formatPersianNumber(stats.total)}`, 'summary')),
    excelRow(excelCell(`تعداد آقایان: ${formatPersianNumber(stats.maleCount)}`, 'summary')),
    excelRow(excelCell(`تعداد بانوان: ${formatPersianNumber(stats.femaleCount)}`, 'summary')),
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
<Worksheet ss:Name="لیست زائرین">
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
    <DisplayRightToLeft/>
  </WorksheetOptions>
  <Table>
    <Column ss:Width="48"/>
    <Column ss:Width="88"/>
    <Column ss:Width="120"/>
    <Column ss:Width="110"/>
    <Column ss:Width="110"/>
    <Column ss:Width="72"/>
    <Column ss:Width="88"/>
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

export function buildPilgrimCsvExport(
  rows: PilgrimExportRow[],
  stats: PilgrimListStats,
): string {
  const header = ['ردیف', 'نام', 'نام خانوادگی', 'تلفن همراه', 'کد ملی', 'جنسیت', 'تاریخ تولد'];
  const body = rows.map((row) =>
    [
      row.index,
      row.firstName,
      row.lastName,
      row.mobileNumber,
      row.nationalId,
      userGenderLabel(row.gender),
      row.birthDate,
    ]
      .map((cell) => escapeCsvCell(String(cell)))
      .join(','),
  );

  const summary = [
    '',
    `تعداد کل,${stats.total}`,
    `آقایان,${stats.maleCount}`,
    `بانوان,${stats.femaleCount}`,
  ];

  if (stats.unknownGenderCount > 0) {
    summary.push(`بدون جنسیت,${stats.unknownGenderCount}`);
  }

  return [
    header.map((cell) => escapeCsvCell(cell)).join(','),
    ...body,
    ...summary,
  ].join('\r\n');
}

export function downloadPilgrimExport(
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

export function pilgrimExportFilename(ext: 'txt' | 'xls') {
  const stamp = new Date().toISOString().slice(0, 10);
  return `zayerin-${stamp}.${ext}`;
}
