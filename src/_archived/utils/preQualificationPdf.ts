// jsPDF and autoTable are dynamically imported to reduce initial bundle size
import { getCurrencyFormatter } from '@/stores/currencyStore';
export interface PreQualificationData {
  // Personal
  fullName: string;
  email: string;
  phone: string;
  
  // Employment
  employmentType: string;
  companyName: string;
  yearsEmployed: number;
  
  // Income
  monthlyIncome: number;
  otherIncome: number;
  
  // Expenses
  monthlyExpenses: number;
  existingDebt: number;
  
  // Property
  propertyPrice: number;
  downPaymentPercent: number;
  loanTermYears: number;
  interestRate: number;
  
  // Calculated
  downPayment: number;
  loanAmount: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  dtiRatio: number;
  maxAffordable: number;
  qualificationStatus: 'qualified' | 'conditional' | 'not_qualified';
}

const formatIDR = (v: number) => getCurrencyFormatter()(v);

export async function generatePreQualificationPDF(data: PreQualificationData): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Mortgage Pre-Qualification Summary', 14, 18);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 28);
  doc.text(`Reference: PQ-${Date.now().toString(36).toUpperCase()}`, 14, 34);
  
  // Status badge
  const statusColors: Record<string, [number, number, number]> = {
    qualified: [34, 197, 94],
    conditional: [234, 179, 8],
    not_qualified: [239, 68, 68],
  };
  const statusLabels: Record<string, string> = {
    qualified: 'PRE-QUALIFIED',
    conditional: 'CONDITIONALLY QUALIFIED',
    not_qualified: 'NOT QUALIFIED',
  };
  
  const [r, g, b] = statusColors[data.qualificationStatus];
  doc.setFillColor(r, g, b);
  doc.roundedRect(pageWidth - 70, 10, 56, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(statusLabels[data.qualificationStatus], pageWidth - 42, 18, { align: 'center' });
  
  let y = 50;
  doc.setTextColor(15, 23, 42);
  
  // Applicant Information
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Applicant Information', 14, y);
  y += 2;
  
  autoTable(doc, {
    startY: y,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50, textColor: [100, 116, 139] }, 1: { cellWidth: 80 } },
    body: [
      ['Full Name', data.fullName],
      ['Email', data.email],
      ['Phone', data.phone],
      ['Employment', `${data.employmentType} — ${data.companyName}`],
      ['Years Employed', `${data.yearsEmployed} years`],
    ],
  });
  
  y = (doc as any).lastAutoTable.finalY + 10;
  
  // Financial Summary
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Summary', 14, y);
  y += 2;
  
  autoTable(doc, {
    startY: y,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4 },
    head: [['Category', 'Amount']],
    body: [
      ['Monthly Income', formatIDR(data.monthlyIncome)],
      ['Other Income', formatIDR(data.otherIncome)],
      ['Total Monthly Income', formatIDR(data.monthlyIncome + data.otherIncome)],
      ['Monthly Expenses', formatIDR(data.monthlyExpenses)],
      ['Existing Debt Payments', formatIDR(data.existingDebt)],
      ['Net Disposable Income', formatIDR(data.monthlyIncome + data.otherIncome - data.monthlyExpenses - data.existingDebt)],
    ],
  });
  
  y = (doc as any).lastAutoTable.finalY + 10;
  
  // Mortgage Details
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Mortgage Details', 14, y);
  y += 2;
  
  autoTable(doc, {
    startY: y,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4 },
    head: [['Detail', 'Value']],
    body: [
      ['Property Price', formatIDR(data.propertyPrice)],
      ['Down Payment', `${data.downPaymentPercent}% — ${formatIDR(data.downPayment)}`],
      ['Loan Amount', formatIDR(data.loanAmount)],
      ['Interest Rate', `${data.interestRate}% p.a.`],
      ['Loan Term', `${data.loanTermYears} years`],
      ['Monthly Payment', formatIDR(data.monthlyPayment)],
      ['Total Payment', formatIDR(data.totalPayment)],
      ['Total Interest', formatIDR(data.totalInterest)],
    ],
  });
  
  y = (doc as any).lastAutoTable.finalY + 10;
  
  // Qualification Analysis
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Qualification Analysis', 14, y);
  y += 2;
  
  autoTable(doc, {
    startY: y,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, textColor: [100, 116, 139] } },
    body: [
      ['Debt-to-Income Ratio', `${data.dtiRatio.toFixed(1)}% ${data.dtiRatio <= 30 ? '✓ Excellent' : data.dtiRatio <= 40 ? '✓ Good' : data.dtiRatio <= 50 ? '⚠ Moderate' : '✗ High'}`],
      ['Max Affordable Loan', formatIDR(data.maxAffordable)],
      ['Qualification Status', statusLabels[data.qualificationStatus]],
    ],
  });
  
  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('This pre-qualification summary is for informational purposes only and does not constitute a loan approval.', 14, pageHeight - 20);
  doc.text('Please contact your preferred bank for official mortgage application.', 14, pageHeight - 15);
  doc.text('© Astra Villa Realty', 14, pageHeight - 10);
  
  doc.save(`PreQualification_${data.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
