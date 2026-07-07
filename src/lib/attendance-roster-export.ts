import { formatPersianNumber } from './capacity';
import { formatDurationFaWords } from './format-duration-fa';
import { formatTimeFromIso } from './format-time';
import { attendanceRosterTitle } from './attendance-page-utils';
import type { AttendanceRosterResponse } from './attendance-roster';

function excelCell(value: string, style = 'rtl'): string {
  const escaped = value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<Cell ss:StyleID="${style}"><Data ss:Type="String">${escaped}</Data></Cell>`;
}

function excelRow(cells: string): string {
  return `<Row>${cells}</Row>`;
}

export function buildAttendanceRosterExcelExport(
  data: AttendanceRosterResponse,
): string {
  const isAbsent = data.kind === 'absent';
  const title = attendanceRosterTitle(data.kind);
  const durationHeader = isAbsent ? 'مدت زمان عدم حضور' : 'مدت حضور';

  const headers = isAbsent
    ? ['ردیف', 'نام و نام خانوادگی', 'تلفن همراه', 'کد ملی', durationHeader, 'آخرین خروج']
    : ['ردیف', 'نام و نام خانوادگی', 'تلفن همراه', 'کد ملی', durationHeader];

  const headerRow = excelRow(
    headers.map((cell) => excelCell(cell, 'header')).join(''),
  );

  const bodyRows = data.rows
    .map((row, index) => {
      const durationLabel = formatDurationFaWords(row.durationMs);
      const cells = [
        formatPersianNumber(index + 1),
        row.fullName,
        row.mobile,
        row.nationalId ?? '—',
        durationLabel,
      ];

      if (isAbsent) {
        const exitTime = row.lastExitAt
          ? formatTimeFromIso(row.lastExitAt)
          : '—';
        const exitCell =
          row.lastExitAt && row.durationMs > 0
            ? `${exitTime} (${durationLabel})`
            : exitTime;
        cells.push(exitCell);
      }

      return excelRow(
        cells
          .map((cell, cellIndex) => {
            const style = cellIndex === 2 ? 'ltr' : 'rtl';
            return excelCell(cell, style);
          })
          .join(''),
      );
    })
    .join('\n');

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
  <Style ss:ID="ltr" ss:Parent="Default">
    <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="header" ss:Parent="Default">
    <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:ReadingOrder="RightToLeft"/>
    <Font ss:FontName="Tahoma" x:Family="Swiss" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
    <Interior ss:Color="#1A2744" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="title" ss:Parent="Default">
    <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:ReadingOrder="RightToLeft"/>
    <Font ss:FontName="Tahoma" x:Family="Swiss" ss:Size="14" ss:Bold="1"/>
  </Style>
</Styles>
<Worksheet ss:Name="${title}">
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
    <DisplayRightToLeft/>
  </WorksheetOptions>
  <Table>
    ${excelRow(excelCell(title, 'title'))}
    ${excelRow(excelCell(`تاریخ تهیه: ${new Date().toLocaleDateString('fa-IR')}`, 'rtl'))}
    ${excelRow('')}
    ${headerRow}
    ${bodyRows}
  </Table>
</Worksheet>
</Workbook>`;
}

export function downloadAttendanceRosterExcel(
  data: AttendanceRosterResponse,
): void {
  const content = `\uFEFF${buildAttendanceRosterExcelExport(data)}`;
  const blob = new Blob([content], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `attendance-${data.kind}-${new Date().toISOString().slice(0, 10)}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}
