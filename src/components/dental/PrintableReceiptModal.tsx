import { ModalLayer } from '../common/ModalLayer';
import React from 'react';
import { PaymentRecord, PatientRecord } from '../../types';
import { X, Printer, Receipt, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PrintableReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment?: PaymentRecord | null;
  patient?: PatientRecord | null;
  patientOpNumber?: string;
  invoiceBalance?: number;
}

/**
 * High-fidelity isolated print handler for Shriya Multispeciality Dental Clinic Receipts
 * Uses an invisible iframe so physical printing and "Save as PDF" print ONLY the clean letterhead
 * pad document with zero browser backdrop or page borders.
 */
export const printReceiptElement = (
  elementId: string = 'shriya-receipt-sheet',
  patientName?: string,
  receiptNo?: string
) => {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((el) => el.outerHTML)
    .join('\n');

  const safeName = (patientName || 'Patient').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeRec = (receiptNo || 'Receipt').replace(/[^a-zA-Z0-9_-]/g, '_');
  const pageTitle = `Receipt_${safeRec}_${safeName}_Shriya_Dental_Clinic`;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${pageTitle}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Outfit:wght@700;800;900&display=swap" rel="stylesheet">
        ${headStyles}
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          *, *::before, *::after {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #ffffff !important;
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
          }
          .receipt-outer-border {
            border: 2px solid #1e3a8a !important;
            border-radius: 8px !important;
            padding: 16px 20px !important;
            background-color: #ffffff !important;
          }
          table, tr, td, th {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2500);
  }, 350);
};

export const PrintableReceiptModal: React.FC<PrintableReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  patient,
  patientOpNumber,
  invoiceBalance
}) => {
  const { patients, invoices } = useApp();

  if (!isOpen || !payment) return null;

  const matchedPatient = patient || patients.find(
    (p) => p.id === payment.patientId || p.opNumber === patientOpNumber || p.name.toLowerCase() === payment.patientName.toLowerCase()
  );

  const linkedInvoice = invoices.find((inv) => inv.id === payment.invoiceId);

  const balanceDue = typeof invoiceBalance === 'number'
    ? invoiceBalance
    : (linkedInvoice ? linkedInvoice.balance : 0);

  const opNumberDisplay = patientOpNumber || matchedPatient?.opNumber || payment.patientId || 'OP-2026-00101';
  const patientNameDisplay = payment.patientName || matchedPatient?.name || 'Customer 1';
  const doctorNameDisplay = linkedInvoice?.doctorName || matchedPatient?.assignedDoctorName || 'Dr. EBIN BRITTO. M. BDS';

  const handlePrint = () => {
    printReceiptElement('shriya-receipt-sheet', patientNameDisplay, payment.receiptNumber);
  };

  return (
    <ModalLayer onDismiss={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto space-y-4">
        
        {/* Modal Action Controls (Hidden in Print) */}
        <div className="flex flex-wrap gap-2 items-center justify-between pb-3 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
              <Receipt className="w-5 h-5 text-emerald-700" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">Official Payment Receipt</h3>
              <span className="text-xs text-slate-500 font-mono">{payment.receiptNumber} • {payment.date}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all hover:shadow"
              title="Print letterhead receipt or save as PDF"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Print / Save PDF</span>
            </button>
            <button aria-label="Close dialog"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* OFFICIAL SHRIYA DENTAL CLINIC LETTERHEAD PAD RECEIPT     */}
        {/* ========================================================= */}
        <div
          id="shriya-receipt-sheet"
          className="receipt-outer-border bg-white text-slate-900 mx-auto w-full p-5 sm:p-7 rounded-2xl border-2 border-blue-950 shadow-xs space-y-4 font-sans"
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            backgroundColor: '#ffffff',
            color: '#0f172a'
          }}
        >
          {/* Clinic Letterhead Header */}
          <div 
            className="pb-3 border-b-2 border-blue-900 text-center"
            style={{ borderBottom: '2.5px solid #1e3a8a' }}
          >
            <h1 
              style={{
                fontSize: '22px',
                fontWeight: 900,
                color: '#1e3a8a',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                margin: 0,
                lineHeight: 1.2
              }}
            >
              SHRIYA MULTISPECIALITY DENTAL CLINIC
            </h1>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', margin: '3px 0 2px 0' }}>
              Pollachi Road, Kozhinjapara, Palakkad.
            </p>
            <p style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', margin: '0 0 5px 0' }}>
              Mob : 9400320890, 7904221656
            </p>

            {/* Sub-header: Working hours (Left) & Doctor Reg Box (Right) */}
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: '6px',
                fontSize: '11px',
                paddingTop: '4px',
                borderTop: '1px dashed #cbd5e1'
              }}
            >
              <div style={{ textAlign: 'left', fontWeight: 600, color: '#334155', lineHeight: 1.3 }}>
                <p style={{ margin: 0 }}>Working Hours : 9.30 am to 6.30 pm</p>
                <p style={{ margin: 0, fontSize: '10.5px', color: '#64748b' }}>Sunday's by appointment</p>
              </div>

              <div 
                style={{
                  border: '1.5px solid #1e3a8a',
                  padding: '3px 12px',
                  textAlign: 'center',
                  backgroundColor: '#eff6ff',
                  borderRadius: '3px'
                }}
              >
                <p style={{ fontWeight: 800, color: '#172554', fontSize: '11.5px', textTransform: 'uppercase', margin: 0 }}>
                  {doctorNameDisplay}
                </p>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#1e3a8a', margin: 0 }}>
                  Reg. No. : 26719/KDC
                </p>
              </div>
            </div>
          </div>

          {/* Official Document Banner */}
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '6px 12px',
              margin: '6px 0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 900, fontSize: '11.5px', letterSpacing: '0.05em', color: '#1e3a8a', textTransform: 'uppercase' }}>
                Official Payment Receipt
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#047857', backgroundColor: '#d1fae5', padding: '1px 6px', borderRadius: '4px' }}>
                ORIGINAL
              </span>
            </div>
            <div style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, fontSize: '12px', color: '#0f172a' }}>
              Receipt No: <strong style={{ color: '#1e3a8a' }}>{payment.receiptNumber}</strong>
            </div>
          </div>

          {/* Patient & Billing Metadata Grid */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px 16px',
              fontSize: '11.5px',
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px'
            }}
          >
            <div>
              <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Patient Name:</span>
              <strong style={{ color: '#0f172a', fontSize: '12.5px' }}>{patientNameDisplay}</strong>
              {matchedPatient?.age && (
                <span style={{ color: '#475569', fontSize: '11px', marginLeft: '6px' }}>
                  ({matchedPatient.age}y / {matchedPatient.gender || 'M'})
                </span>
              )}
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>OP / Reg Number:</span>
              <strong style={{ fontFamily: 'monospace', color: '#1e3a8a', fontSize: '12.5px' }}>{opNumberDisplay}</strong>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Invoice Reference:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>{payment.invoiceId || 'N/A'}</span>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Payment Date & Time:</span>
              <span style={{ fontWeight: 600, color: '#334155' }}>{payment.date} {payment.time ? `at ${payment.time}` : ''}</span>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Payment Mode:</span>
              <strong style={{ color: '#0f172a' }}>{payment.paymentMethod}</strong>
              {payment.referenceNumber && (
                <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '10.5px', marginLeft: '6px' }}>
                  (Ref: {payment.referenceNumber})
                </span>
              )}
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Cashier / Receiving Staff:</span>
              <span style={{ fontWeight: 600, color: '#334155' }}>{payment.receivedBy || 'Front Desk'}</span>
            </div>
          </div>

          {/* Itemized Services Breakdown (if available from linked invoice) */}
          {linkedInvoice?.items && linkedInvoice.items.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <table 
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '11px'
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#eff6ff', borderBottom: '2px solid #1e3a8a' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 800, color: '#172554', textTransform: 'uppercase', fontSize: '10px' }}>
                      #
                    </th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 800, color: '#172554', textTransform: 'uppercase', fontSize: '10px' }}>
                      Procedure / Service Description
                    </th>
                    <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 800, color: '#172554', textTransform: 'uppercase', fontSize: '10px' }}>
                      Qty
                    </th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, color: '#172554', textTransform: 'uppercase', fontSize: '10px' }}>
                      Unit Price
                    </th>
                    <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, color: '#172554', textTransform: 'uppercase', fontSize: '10px' }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {linkedInvoice.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td data-label="Item" style={{ padding: '5px 8px', color: '#64748b', fontSize: '10px' }}>{idx + 1}</td>
                      <td data-label="Procedure" style={{ padding: '5px 8px', fontWeight: 600, color: '#0f172a' }}>{item.description}</td>
                      <td data-label="Quantity" style={{ padding: '5px 8px', textAlign: 'center', color: '#334155' }}>{item.quantity}</td>
                      <td data-label="Unit price" style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#334155' }}>₹{Number(item.unitPrice).toLocaleString()}</td>
                      <td data-label="Amount" style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                        ₹{(Number(item.quantity) * Number(item.unitPrice)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Amount Paid Highlight Box */}
          <div 
            style={{
              padding: '12px 16px',
              backgroundColor: '#ecfdf5',
              border: '1.5px solid #059669',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: '8px 0'
            }}
          >
            <div>
              <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#065f46', display: 'block' }}>
                Payment Received in this Transaction
              </span>
              <div style={{ fontSize: '26px', fontWeight: 900, fontFamily: 'monospace', color: '#064e3b', lineHeight: 1.1, marginTop: '2px' }}>
                ₹{payment.amount.toLocaleString()}
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#047857' }}>
                Mode: {payment.paymentMethod} • Settled & Credited to Patient Ledger ✓
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#475569', marginBottom: '2px' }}>
                {linkedInvoice && (
                  <span>Invoice Total: <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>₹{linkedInvoice.total.toLocaleString()}</strong></span>
                )}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 800 }}>
                Remaining Balance: 
                <span 
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 900,
                    marginLeft: '4px',
                    color: balanceDue > 0 ? '#b91c1c' : '#047857'
                  }}
                >
                  ₹{balanceDue.toLocaleString()} {balanceDue <= 0 ? '(Nil / Settled)' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Receipt Notes if any */}
          {payment.notes && (
            <div style={{ fontSize: '11px', color: '#475569', fontStyle: 'italic', padding: '4px 8px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
              <strong>Remarks:</strong> {payment.notes}
            </div>
          )}

          {/* Signatures & Verification Footer */}
          <div 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              paddingTop: '16px',
              marginTop: '12px',
              borderTop: '1.5px solid #1e3a8a',
              fontSize: '11px'
            }}
          >
            <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.4 }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#1e3a8a' }}>SHRIYA MULTISPECIALITY DENTAL CLINIC</p>
              <p style={{ margin: 0 }}>Computer-generated official receipt • No physical signature required</p>
              <p style={{ margin: 0, color: '#94a3b8' }}>Thank you for visiting Shriya Dental Clinic. Keep smiling!</p>
            </div>

            <div style={{ textAlign: 'center', minWidth: '160px' }}>
              <div style={{ borderBottom: '1.5px solid #1e293b', width: '130px', margin: '0 auto 4px auto' }} />
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Authorized Signatory
              </p>
              <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>
                Front Desk / Cashier
              </p>
            </div>
          </div>

        </div>

      </div>
    </ModalLayer>
  );
};
