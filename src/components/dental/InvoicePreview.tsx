import './invoice.css';
import { CreditCard, Printer, X } from 'lucide-react';
import type { Invoice } from '../../types';
import { ModalLayer } from '../common/ModalLayer';
import { printReceiptElement } from './PrintableReceiptModal';

const rupees = (amount: number) => '₹' + amount.toLocaleString('en-IN');

export function InvoicePreview({ invoice, opNumber, onClose, onPayment }: {
  invoice: Invoice;
  opNumber?: string;
  onClose: () => void;
  onPayment: () => void;
}) {
  function printInvoice() {
    printReceiptElement('invoice-letterhead-sheet', invoice.patientName, invoice.id);
  }

  return (
    <ModalLayer onDismiss={onClose} aria-labelledby="invoice-preview-title" className="fixed inset-0 z-50 flex items-center justify-center document-layer">
      <section className="document-dialog">
        <div className="document-toolbar">
          <div><h2 id="invoice-preview-title">Invoice preview</h2><p>{invoice.id}</p></div>
          <button type="button" className="work-action document-close" aria-label="Close invoice preview" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="document-scroll">
          <article id="invoice-letterhead-sheet" className="invoice-paper">
            <div className="invoice-letterhead">
              <h2>Shriya Multispeciality Dental Clinic</h2>
              <p>Pollachi Road, Kozhinjapara, Palakkad.</p>
              <p>9400320890 · 7904221656</p>
            </div>
            <div className="invoice-clinic-details">
              <div>9.30 am to 6.30 pm<br />Sundays by appointment</div>
              <div><strong>{invoice.doctorName || 'Dr. EBIN BRITTO. M. BDS'}</strong><br />Reg. No. 26719/KDC</div>
            </div>
            <div className="invoice-caption">
              <div><h3>Patient bill &amp; tax invoice</h3><p>{invoice.id}</p></div>
              <time>{invoice.date}</time>
            </div>
            <dl className="invoice-people">
              <div><dt>Billed to</dt><dd>{invoice.patientName}</dd>
                <dd className="invoice-identifier">Patient ID · {invoice.patientId}</dd>
                {opNumber && opNumber !== invoice.patientId && <dd className="invoice-identifier">OP · {opNumber}</dd>}
              </div>
              <div><dt>Attending doctor</dt><dd>{invoice.doctorName || '—'}</dd>
                <dd className="invoice-identifier">Dental Surgeon &amp; Consultant</dd>
              </div>
            </dl>
            <table className="invoice-lines" aria-label="Billed treatments">
              <thead><tr><th scope="col">#</th><th scope="col">Procedure or treatment</th><th scope="col">Qty</th><th scope="col">Unit price</th><th scope="col">Amount</th></tr></thead>
              <tbody>{invoice.items.map((item, index) => <tr key={item.id || index}>
                <td className="line-number">{index + 1}</td>
                <td className="line-description"><span className="mobile-line-number" aria-hidden="true">Item {index + 1}</span>{item.description}</td>
                <td data-label="Quantity">{item.quantity}</td><td data-label="Unit price">{rupees(item.unitPrice)}</td><td data-label="Amount">{rupees(item.total)}</td>
              </tr>)}</tbody>
            </table>
            <dl className="invoice-totals">
              <div><dt>Subtotal</dt><dd>{rupees(invoice.subtotal)}</dd></div>
              {invoice.discount > 0 && <div><dt>Approved discount</dt><dd>−{rupees(invoice.discount)}</dd></div>}
              <div><dt>Net amount</dt><dd>{rupees(invoice.total)}</dd></div>
              <div><dt>Paid to date</dt><dd>{rupees(invoice.paid)}</dd></div>
              <div className="invoice-balance"><dt>Balance due</dt><dd>{rupees(invoice.balance)} {invoice.balance <= 0 && <small>Settled</small>}</dd></div>
            </dl>
            <div className="invoice-signature">
              <p>Computer-generated tax invoice<br />Shriya Multispeciality Dental Clinic</p>
              <p><strong>Authorized signatory</strong><br />Clinic Accounts &amp; Billing</p>
            </div>
          </article>
        </div>
        <div className="document-actions">
          {invoice.balance > 0 && <button className="work-action" onClick={onPayment}><CreditCard size={17} />Record payment</button>}
          <button className="work-action primary" onClick={printInvoice}><Printer size={17} />Print / Save PDF</button>
        </div>
      </section>
    </ModalLayer>
  );
}

