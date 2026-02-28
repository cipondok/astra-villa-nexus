// jsPDF is dynamically imported to reduce initial bundle size
import { getCurrencyFormatter } from "@/stores/currencyStore";

interface InvoiceData {
  invoice_number: string;
  description: string;
  invoice_type: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  due_date: string;
  status: string;
  paid_at?: string | null;
  payment_method?: string | null;
  payment_reference?: string | null;
  created_at: string;
  notes?: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  rent: "Sewa", deposit: "Deposit", utility: "Utilitas",
  maintenance: "Perbaikan", penalty: "Denda", other: "Lainnya",
};

const PAYMENT_LABELS: Record<string, string> = {
  bank_transfer: "Transfer Bank", ewallet: "E-Wallet",
  cash: "Tunai", qris: "QRIS",
};

export async function generateInvoicePdf(invoice: InvoiceData, isReceipt = false) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 25;

  const title = isReceipt ? "KWITANSI PEMBAYARAN" : "INVOICE";

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, y);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.invoice_number, pageW - margin, y, { align: "right" });

  y += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  // Info section
  const addRow = (label: string, value: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(label, margin, y);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text(value, margin + 55, y);
    y += 7;
  };

  addRow("Tanggal Terbit", new Date(invoice.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }));
  addRow("Jatuh Tempo", new Date(invoice.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }));
  addRow("Tipe", TYPE_LABELS[invoice.invoice_type] || invoice.invoice_type);
  addRow("Status", invoice.status === "paid" ? "LUNAS" : "BELUM BAYAR");

  if (isReceipt && invoice.paid_at) {
    addRow("Tanggal Bayar", new Date(invoice.paid_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }));
    if (invoice.payment_method) {
      addRow("Metode Bayar", PAYMENT_LABELS[invoice.payment_method] || invoice.payment_method);
    }
    if (invoice.payment_reference) {
      addRow("Referensi", invoice.payment_reference);
    }
  }

  y += 5;
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  // Description
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text("Keterangan:", margin, y);
  y += 6;
  doc.setTextColor(30, 30, 30);
  doc.text(invoice.description || "-", margin, y);
  y += 12;

  // Amount table
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 2, pageW - margin * 2, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Item", margin + 3, y + 4);
  doc.text("Jumlah", pageW - margin - 3, y + 4, { align: "right" });
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.text("Subtotal", margin + 3, y);
  doc.text(getCurrencyFormatter()(invoice.amount), pageW - margin - 3, y, { align: "right" });
  y += 7;

  if (invoice.tax_amount > 0) {
    doc.text("Pajak (10%)", margin + 3, y);
    doc.text(getCurrencyFormatter()(invoice.tax_amount), pageW - margin - 3, y, { align: "right" });
    y += 7;
  }

  doc.line(margin, y, pageW - margin, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTAL", margin + 3, y);
  doc.text(getCurrencyFormatter()(invoice.total_amount), pageW - margin - 3, y, { align: "right" });
  y += 12;

  if (invoice.notes) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Catatan: " + invoice.notes, margin, y);
    y += 8;
  }

  // Footer
  y = doc.internal.pageSize.getHeight() - 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text(`Dokumen ini digenerate otomatis pada ${new Date().toLocaleDateString("id-ID")}`, pageW / 2, y, { align: "center" });
  doc.text(`${invoice.invoice_number}`, pageW / 2, y + 4, { align: "center" });

  const filename = `${isReceipt ? "Receipt" : "Invoice"}_${invoice.invoice_number.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(filename);
}
