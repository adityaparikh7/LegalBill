import PDFDocument from 'pdfkit';
interface Invoice {
  invoice_number: string;
  date: string;
  due_date: string | null;
  client_name: string;
  client_email: string | null;
  client_address: string | null;
  client_phone: string | null;
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
export function generatePDF(invoice: Invoice, lineItems: LineItem[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      // --- Header ---
      doc.fontSize(24).font('Helvetica-Bold').fillColor('#1a1a2e')
        .text('Advocate Sandeep H. Parikh ', 50, 50);
      doc.fontSize(10).font('Helvetica').fillColor('#666')
        .text('11/E, Examiner Press Building, Dalal Street, Fort, Mumbai - 400 001. (M) +91 9820122460, E-mail : adv.sparikh@gmail.com', 50, 80);
      // Invoice details (right side)
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a1a2e')
        .text('Invoice Number:', 350, 50, { width: 200, align: 'right' });
      doc.font('Helvetica').fillColor('#333')
        .text(invoice.invoice_number, 350, 65, { width: 200, align: 'right' });
      doc.font('Helvetica-Bold').fillColor('#1a1a2e')
        .text('Date:', 350, 85, { width: 200, align: 'right' });
      doc.font('Helvetica').fillColor('#333')
        .text(invoice.date, 350, 100, { width: 200, align: 'right' });
      if (invoice.due_date) {
        doc.font('Helvetica-Bold').fillColor('#1a1a2e')
          .text('Due Date:', 350, 120, { width: 200, align: 'right' });
        doc.font('Helvetica').fillColor('#333')
          .text(invoice.due_date, 350, 135, { width: 200, align: 'right' });
      }
      // Status badge
      const statusColors: Record<string, string> = {
        draft: '#6c757d', sent: '#0d6efd', paid: '#00ad5c', overdue: '#dc3545', cancelled: '#dc3545'
      };
      const badgeColor = statusColors[invoice.status] || '#6c757d';
      doc.fontSize(9).font('Helvetica-Bold').fillColor(badgeColor)
        .text(invoice.status.toUpperCase(), 350, 155, { width: 200, align: 'right' });
      // Divider
      doc.moveTo(50, 180).lineTo(550, 180).strokeColor('#e0e0e0').lineWidth(1).stroke();
      // --- Bill To ---
      let yPos = 200;
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a1a2e')
        .text('Bill To:', 50, yPos);
      yPos += 18;
      doc.fontSize(10).font('Helvetica').fillColor('#333')
        .text(invoice.client_name, 50, yPos);
      yPos += 15;
      if (invoice.client_email) {
        doc.text(invoice.client_email, 50, yPos);
        yPos += 15;
      }
      if (invoice.client_phone) {
        doc.text(invoice.client_phone, 50, yPos);
        yPos += 15;
      }
      if (invoice.client_address) {
        doc.text(invoice.client_address, 50, yPos);
        yPos += 15;
      }
      yPos += 15;
      // --- Case Details ---
      if (invoice.case_name || invoice.case_plaintiff || invoice.case_defendant) {
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a1a2e')
          .text('Case Details:', 50, yPos);
        yPos += 18;
        doc.fontSize(10).font('Helvetica').fillColor('#333');
        if (invoice.case_name) {
          doc.font('Helvetica-Bold').text('Case: ', 50, yPos, { continued: true })
            .font('Helvetica').text(invoice.case_name);
          yPos += 15;
        }
        if (invoice.case_plaintiff) {
          const party1Label = `${invoice.case_party1_type || 'Plaintiff'}(s): `;
          doc.font('Helvetica-Bold').text(party1Label, 50, yPos, { continued: true })
            .font('Helvetica').text(invoice.case_plaintiff);
          yPos += 15;
        }
        if (invoice.case_defendant) {
          const party2Label = `${invoice.case_party2_type || 'Defendant'}(s): `;
          doc.font('Helvetica-Bold').text(party2Label, 50, yPos, { continued: true })
            .font('Helvetica').text(invoice.case_defendant);
          yPos += 15;
        }
        yPos += 5;
      }
      // --- Line Items Table ---
      // Table header
      doc.rect(50, yPos, 500, 25).fill('#1a1a2e');
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#fff');
      doc.text('Service Description', 60, yPos + 7, { width: 230 });
      doc.text('Hours', 300, yPos + 7, { width: 60, align: 'center' });
      doc.text('Rate', 365, yPos + 7, { width: 80, align: 'right' });
      doc.text('Amount', 455, yPos + 7, { width: 85, align: 'right' });
      yPos += 25;
      // Table rows
      doc.font('Helvetica').fillColor('#333').fontSize(9);
      lineItems.forEach((item, idx) => {
        const bgColor = idx % 2 === 0 ? '#f8f9fa' : '#ffffff';
        doc.rect(50, yPos, 500, 22).fill(bgColor);
        doc.fillColor('#333');
        doc.text(item.description, 60, yPos + 6, { width: 230 });
        doc.text(item.hours > 0 ? item.hours.toString() : '-', 300, yPos + 6, { width: 60, align: 'center' });
        doc.text(`₹${item.rate.toFixed(2)}`, 365, yPos + 6, { width: 80, align: 'right' });
        doc.text(`₹${item.amount.toFixed(2)}`, 455, yPos + 6, { width: 85, align: 'right' });
        yPos += 22;
      });
      // Table bottom border
      doc.moveTo(50, yPos).lineTo(550, yPos).strokeColor('#1a1a2e').lineWidth(1).stroke();
      yPos += 15;
      // --- Totals ---
      const totalsX = 380;
      doc.fontSize(10).font('Helvetica').fillColor('#333');
      doc.text('Subtotal:', totalsX, yPos, { width: 80, align: 'right' });
      doc.text(`₹${invoice.subtotal.toFixed(2)}`, 470, yPos, { width: 70, align: 'right' });
      yPos += 18;
      if (invoice.tax_rate > 0) {
        doc.text(`Tax (${invoice.tax_rate}%):`, totalsX, yPos, { width: 80, align: 'right' });
        doc.text(`₹${invoice.tax_amount.toFixed(2)}`, 470, yPos, { width: 70, align: 'right' });
        yPos += 18;
      }
      doc.moveTo(totalsX, yPos).lineTo(550, yPos).strokeColor('#e0e0e0').lineWidth(0.5).stroke();
      yPos += 8;
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#1a1a2e');
      doc.text('Total:', totalsX, yPos, { width: 80, align: 'right' });
      doc.text(`₹${invoice.total.toFixed(2)}`, 470, yPos, { width: 70, align: 'right' });
      yPos += 30;
      // --- Notes ---
      if (invoice.notes) {
        doc.moveTo(50, yPos).lineTo(550, yPos).strokeColor('#e0e0e0').lineWidth(0.5).stroke();
        yPos += 15;
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a1a2e').text('Notes:', 50, yPos);
        yPos += 15;
        doc.fontSize(9).font('Helvetica').fillColor('#666').text(invoice.notes, 50, yPos, { width: 500 });
      }
      // --- Footer ---
      doc.fontSize(8).font('Helvetica').fillColor('#999')
        .text('Thank you for your business.', 50, 750, { align: 'center', width: 500 });
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 50, 762, { align: 'center', width: 500 });
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
