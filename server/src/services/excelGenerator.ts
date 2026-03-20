import ExcelJS from 'exceljs';
interface Invoice {
  invoice_number: string;
  date: string;
  due_date: string | null;
  client_name: string;
  client_email: string | null;
  client_address: string | null;
  case_name: string | null;
  case_party1_type: string | null;
  case_plaintiff: string | null;
  case_party2_type: string | null;
  case_defendant: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  status: string;
}
interface LineItem {
  description: string;
  hours: number;
  rate: number;
  amount: number;
}
export async function generateExcel(invoice: Invoice, lineItems: LineItem[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'LegalBill';
  workbook.created = new Date();
  const sheet = workbook.addWorksheet('Invoice', {
    properties: { defaultColWidth: 18 },
  });
  // Column widths
  sheet.columns = [
    { width: 40 }, // A - Description
    { width: 12 }, // B - Hours
    { width: 15 }, // C - Rate
    { width: 18 }, // D - Amount
  ];
  // --- Header ---
  const titleRow = sheet.addRow(['INVOICE']);
  titleRow.getCell(1).font = { size: 20, bold: true, color: { argb: 'FF1A1A2E' } };
  titleRow.height = 30;
  sheet.mergeCells('A1:D1');
  sheet.addRow([]);
  // Invoice details
  const detailStyle = { font: { size: 10, color: { argb: 'FF333333' } } };
  const labelStyle = { font: { size: 10, bold: true, color: { argb: 'FF1A1A2E' } } };
  const addDetail = (label: string, value: string) => {
    const row = sheet.addRow([label, value]);
    row.getCell(1).font = labelStyle.font;
    row.getCell(2).font = detailStyle.font;
  };
  addDetail('Invoice Number:', invoice.invoice_number);
  addDetail('Date:', invoice.date);
  if (invoice.due_date) addDetail('Due Date:', invoice.due_date);
  addDetail('Status:', invoice.status.toUpperCase());
  sheet.addRow([]);
  addDetail('Bill To:', invoice.client_name);
  if (invoice.client_email) addDetail('Email:', invoice.client_email);
  if (invoice.client_address) addDetail('Address:', invoice.client_address);
  sheet.addRow([]);
  // --- Case Details ---
  if (invoice.case_name || invoice.case_plaintiff || invoice.case_defendant) {
    const caseHeader = sheet.addRow(['Case Details']);
    caseHeader.getCell(1).font = { size: 11, bold: true, color: { argb: 'FF1A1A2E' } };
    if (invoice.case_name) addDetail('Case:', invoice.case_name);
    if (invoice.case_plaintiff) addDetail(`${invoice.case_party1_type || 'Plaintiff'}(s):`, invoice.case_plaintiff);
    if (invoice.case_defendant) addDetail(`${invoice.case_party2_type || 'Defendant'}(s):`, invoice.case_defendant);
    sheet.addRow([]);
  }
  // --- Line Items Table Header ---
  const headerRow = sheet.addRow(['Service Description', 'Hours', 'Rate (₹)', 'Amount (₹)']);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A2E' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF1A1A2E' } },
    };
  });
  headerRow.height = 22;
  // --- Line Items ---
  lineItems.forEach((item, idx) => {
    const row = sheet.addRow([
      item.description,
      item.hours > 0 ? item.hours : '-',
      item.rate,
      item.amount,
    ]);
    row.eachCell((cell, colNumber) => {
      cell.font = { size: 10, color: { argb: 'FF333333' } };
      if (colNumber >= 3) {
        cell.numFmt = '"₹"#,##0.00';
        cell.alignment = { horizontal: 'right' };
      }
      if (colNumber === 2) {
        cell.alignment = { horizontal: 'center' };
      }
      if (idx % 2 === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
      }
    });
  });
  sheet.addRow([]);
  // --- Totals ---
  const addTotal = (label: string, value: number, isBold = false) => {
    const row = sheet.addRow(['', '', label, value]);
    row.getCell(3).font = { bold: isBold, size: isBold ? 12 : 10, color: { argb: 'FF1A1A2E' } };
    row.getCell(3).alignment = { horizontal: 'right' };
    row.getCell(4).font = { bold: isBold, size: isBold ? 12 : 10, color: { argb: 'FF1A1A2E' } };
    row.getCell(4).numFmt = '"₹"#,##0.00';
    row.getCell(4).alignment = { horizontal: 'right' };
  };
  addTotal('Subtotal:', invoice.subtotal);
  if (invoice.tax_rate > 0) {
    addTotal(`Tax (${invoice.tax_rate}%):`, invoice.tax_amount);
  }
  addTotal('TOTAL:', invoice.total, true);
  // --- Notes ---
  if (invoice.notes) {
    sheet.addRow([]);
    const notesLabelRow = sheet.addRow(['Notes:']);
    notesLabelRow.getCell(1).font = { bold: true, size: 10, color: { argb: 'FF1A1A2E' } };
    const notesRow = sheet.addRow([invoice.notes]);
    notesRow.getCell(1).font = { size: 9, color: { argb: 'FF666666' } };
    sheet.mergeCells(`A${notesRow.number}:D${notesRow.number}`);
  }
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}