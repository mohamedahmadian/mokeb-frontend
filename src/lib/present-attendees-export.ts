import { formatPersianNumber } from './capacity';
import { MEAL_TYPE_LABELS } from './meal-plan-utils';
import type { PresentAttendeesReport } from './present-attendees-report';

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

function formatReportDate(date: string): string {
  return new Date(date.slice(0, 10)).toLocaleDateString('fa-IR');
}

export function buildPresentAttendeesExcelExport(
  report: PresentAttendeesReport,
): string {
  const title = `گزارش وعده‌های غذایی — ${report.mawkibName}`;
  const mealLabel = MEAL_TYPE_LABELS[report.mealType];
  const headerRow = excelRow(
    ['ردیف', 'نام و نام خانوادگی', 'کد رزرو', 'تلفن همراه', 'کد ملی', 'حضور', 'تحویل']
      .map((cell) => excelCell(cell, 'header'))
      .join(''),
  );

  const bodyRows = report.rows
    .map((row, index) =>
      excelRow(
        [
          formatPersianNumber(index + 1),
          row.fullName,
          row.trackingCode,
          row.mobile,
          row.nationalId ?? '—',
          row.presence,
          row.isServed ? '✓' : '',
        ]
          .map((cell, cellIndex) => {
            const style =
              cellIndex === 2 || cellIndex === 3 ? 'ltr' : cellIndex === 0 ? 'rtl' : 'rtl';
            return excelCell(cell, style);
          })
          .join(''),
      ),
    )
    .join('\n');

  const summaryRows = [
    excelRow(excelCell(`تعداد کل زوار: ${formatPersianNumber(report.stats.total)}`, 'summary')),
    excelRow(excelCell(`تعداد حاضرین: ${formatPersianNumber(report.stats.present)}`, 'summary')),
    excelRow(excelCell(`تعداد غائبین: ${formatPersianNumber(report.stats.absent)}`, 'summary')),
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
  <Style ss:ID="ltr" ss:Parent="Default">
    <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
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
<Worksheet ss:Name="گزارش وعده‌های غذایی">
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
    <DisplayRightToLeft/>
  </WorksheetOptions>
  <Table>
    ${excelRow(excelCell(title, 'title'))}
    ${excelRow(excelCell(`تاریخ: ${formatReportDate(report.date)} — وعده: ${mealLabel}`, 'summary'))}
    ${excelRow(excelCell(`تاریخ تهیه: ${new Date().toLocaleDateString('fa-IR')}`, 'summary'))}
    ${excelRow('')}
    ${headerRow}
    ${bodyRows}
    ${excelRow('')}
    ${summaryRows}
  </Table>
</Worksheet>
</Workbook>`;
}

export function downloadPresentAttendeesExcel(
  report: PresentAttendeesReport,
): void {
  const content = `\uFEFF${buildPresentAttendeesExcelExport(report)}`;
  const blob = new Blob([content], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `present-attendees-${report.date}-${report.mealType}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}
