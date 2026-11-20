import './clinic-modules.css';
import { InvoicePreview } from '../components/dental/InvoicePreview';
import { SectionPicker, WorkspaceHeading } from '../components/common/WorkspaceControls';
import { ModalLayer } from '../components/common/ModalLayer';
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/common/Sidebar';
import { Invoice, PaymentRecord, PaymentMethod } from '../types';
import { PrintableReceiptModal, printReceiptElement } from '../components/dental/PrintableReceiptModal';
import { 
  CreditCard, 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  QrCode, 
  ArrowRight, 
  FileText, 
  User, 
  DollarSign, 
  X, 
  Calendar, 
  Smartphone,
  Wallet,
  ShieldCheck,
  Building,
  Check,
  Share2,
  Sparkles
} from 'lucide-react';

export const BillingPaymentView: React.FC = () => {
  const { 
    invoices, 
    payments, 
    patients, 
    doctors, 
    services, 
    recordPayment, 
    createInvoice, 
    addToast,
    setActiveView,
    selectedPatientForDetail
  } = useApp();
  const { currentUser } = useAuth();

  // Active view tab in Billing Hub
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'create-bill'>('invoices');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<'ALL' | 'Pending' | 'Partial' | 'Paid'>('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [showPrintableReceiptModal, setShowPrintableReceiptModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<PaymentRecord | null>(null);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<Invoice | null>(null);

  // Record Payment Form State (Step-by-step)
  const [paymentStep, setPaymentStep] = useState<1 | 2 | 3>(1);
  const [payInvoiceId, setPayInvoiceId] = useState<string>('');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('UPI');
  const [payReference, setPayReference] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');
  const [cashTendered, setCashTendered] = useState<number>(0);

  // Create Bill Form State
  const [newBillPatientId, setNewBillPatientId] = useState<string>(selectedPatientForDetail?.id || patients[0]?.id || '');
  const [newBillDoctorName, setNewBillDoctorName] = useState<string>(doctors[0]?.name || 'Attending Doctor');
  const [newBillDueDate, setNewBillDueDate] = useState<string>('');
  const [newBillItems, setNewBillItems] = useState<{ description: string; quantity: number; unitPrice: number }[]>([
    { description: 'Dental Consultation & Oral Examination', quantity: 1, unitPrice: 500 }
  ]);
  const [newBillDiscount, setNewBillDiscount] = useState<number>(0);
  const [newBillCollectNow, setNewBillCollectNow] = useState<boolean>(false);
  const [newBillPayMethod, setNewBillPayMethod] = useState<PaymentMethod>('UPI');
  const [newBillPayAmount, setNewBillPayAmount] = useState<number>(0);

  // Sync new bill patient if selected in profile
  useEffect(() => {
    if (selectedPatientForDetail) {
      setNewBillPatientId(selectedPatientForDetail.id);
      if (selectedPatientForDetail.assignedDoctorName) {
        setNewBillDoctorName(selectedPatientForDetail.assignedDoctorName);
      }
    }
  }, [selectedPatientForDetail]);

  // Financial Stats
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalCollected = payments.reduce((sum, pay) => sum + pay.amount, 0);
  const totalPending = invoices.reduce((sum, inv) => sum + inv.balance, 0);
  const pendingInvoicesCount = invoices.filter((i) => i.status !== 'Paid').length;

  // Filtered Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = invoiceStatusFilter === 'ALL' || inv.status === invoiceStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Payments (Payment Pay Records)
  const filteredPayments = payments.filter((p) => {
    const matchesSearch = 
      p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.referenceNumber && p.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMethod = paymentMethodFilter === 'ALL' || p.paymentMethod === paymentMethodFilter;
    return matchesSearch && matchesMethod;
  });

  // Open Record Payment Modal for specific invoice
  const handleOpenPaymentModal = (invoice?: Invoice) => {
    const target = invoice || invoices.find((i) => i.balance > 0) || invoices[0];
    if (target) {
      setSelectedInvoiceForPayment(target);
      setPayInvoiceId(target.id);
      setPayAmount(target.balance > 0 ? target.balance : target.total);
      setCashTendered(target.balance > 0 ? target.balance : target.total);
    }
    setPaymentStep(1);
    setPayMethod('UPI');
    setPayReference(`UPI-${Date.now().toString().slice(-6)}`);
    setPayNotes('');
    setIsRecordPaymentModalOpen(true);
  };

  // Submit Payment Record
  const handleRecordPaymentSubmit = () => {
    if (!payInvoiceId) {
      addToast('Error', 'Please select a valid invoice.', 'danger');
      return;
    }
    if (payAmount <= 0) {
      addToast('Error', 'Payment amount must be greater than zero.', 'danger');
      return;
    }

    const createdPayment = recordPayment({
      invoiceId: payInvoiceId,
      amount: Number(payAmount),
      paymentMethod: payMethod,
      referenceNumber: payReference,
      notes: payNotes,
      receivedBy: currentUser.name || 'Reception Desk'
    });

    setIsRecordPaymentModalOpen(false);
    setActiveReceipt(createdPayment);
    setShowPrintableReceiptModal(true);
  };

  // Add Item to New Bill
  const handleAddItemToNewBill = () => {
    setNewBillItems((prev) => [
      ...prev,
      { description: 'Dental Treatment Procedure', quantity: 1, unitPrice: 1000 }
    ]);
  };

  const handleRemoveItemFromNewBill = (index: number) => {
    setNewBillItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit New Bill
  const handleCreateBillSubmit = () => {
    const targetPat = patients.find((p) => p.id === newBillPatientId) || patients[0];
    if (!targetPat) {
      addToast('Error', 'Please select a patient.', 'danger');
      return;
    }
    if (newBillItems.length === 0) {
      addToast('Error', 'Please add at least one line item.', 'danger');
      return;
    }

    const created = createInvoice({
      patientId: targetPat.id,
      patientName: targetPat.name,
      doctorName: newBillDoctorName,
      items: newBillItems,
      discount: Number(newBillDiscount),
      dueDate: newBillDueDate || undefined,
      paymentMethod: newBillCollectNow ? newBillPayMethod : undefined,
      initialPaymentAmount: newBillCollectNow ? Number(newBillPayAmount) : 0,
      notes: 'Standard clinic outpatient bill'
    });

    // Reset bill form
    setNewBillItems([{ description: 'Dental Consultation & Oral Examination', quantity: 1, unitPrice: 500 }]);
    setNewBillDiscount(0);
    setNewBillCollectNow(false);
    setActiveTab('invoices');
    addToast('Bill Issued Successfully! 📄', `Invoice ${created.id} generated for ${created.patientName}.`, 'success');
  };

  return (
    <div className="workspace w-full max-w-full mx-auto px-2.5 sm:px-4 lg:px-6 py-3 sm:py-5 flex flex-col lg:flex-row gap-4 lg:gap-6">
      <Sidebar type="admin" />

      <main className="flex-1 min-w-0 flex flex-col gap-5">
        <WorkspaceHeading title="Billing and payments" detail={invoices.length + ' invoices · ' + payments.length + ' payments'}>
          <button className="work-action primary" onClick={() => handleOpenPaymentModal()}><CreditCard size={17} /> Record payment</button>
        </WorkspaceHeading>
        <dl className="billing-summary">
          <div><dt>Total invoiced</dt><dd>₹{totalBilled.toLocaleString('en-IN')}</dd></div>
          <div><dt>Collected</dt><dd>₹{totalCollected.toLocaleString('en-IN')}</dd></div>
          <div><dt>Outstanding</dt><dd>₹{totalPending.toLocaleString('en-IN')}</dd><small>{pendingInvoicesCount} open</small></div>
          <div><dt>Payment modes</dt><dd className="billing-methods">UPI, cards, cash</dd></div>
        </dl>
        <SectionPicker label="Billing view" value={activeTab} onChange={setActiveTab} options={[
          { id: 'invoices', label: 'Invoices', description: 'Invoices & Bills' },
          { id: 'payments', label: 'Payments', description: 'Payment Ledger' },
          { id: 'create-bill', label: 'New bill', description: 'Create New Bill' },
        ]} />

        {/* TAB 1: INVOICES & BILLS */}
        {activeTab === 'invoices' && (
          <div className="invoice-list-panel space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="w-full sm:w-80">
                <div className="relative flex items-center w-full">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    aria-label="Search invoices by number, patient or doctor" placeholder="Search invoices or patients"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-1.5 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Status Filter Chips */}
              <div className="invoice-status-options" role="group" aria-label="Invoice status">
                {(['ALL', 'Pending', 'Partial', 'Paid'] as const).map((st) => (
                  <button
                    key={st}
                    aria-pressed={invoiceStatusFilter === st}
                    onClick={() => setInvoiceStatusFilter(st)}
                    className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                      invoiceStatusFilter === st
                        ? 'bg-emerald-800 text-white font-semibold'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {st === 'ALL' ? 'All' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="invoice-list-cards">
              {filteredInvoices.map(inv => (
                <article key={inv.id} className="bill-card">
                  <div className="bill-card-id"><span>{inv.id}</span><span className="record-status">{inv.status}</span></div>
                  <h3>{inv.patientName}</h3>
                  <p>{inv.date} · {inv.doctorName}</p>
                  <dl className="bill-amounts">
                    <div><dt>Total</dt><dd>₹{inv.total.toLocaleString('en-IN')}</dd></div>
                    <div><dt>Paid</dt><dd>₹{inv.paid.toLocaleString('en-IN')}</dd></div>
                    <div><dt>Balance</dt><dd>₹{inv.balance.toLocaleString('en-IN')}</dd></div>
                  </dl>
                  <div className="bill-actions">
                    <button className="work-action" title="View & Print Invoice" onClick={() => setSelectedInvoiceForView(inv)}>
                      <FileText size={16} />View invoice
                    </button>
                    {inv.balance > 0 && <button className="work-action primary" onClick={() => handleOpenPaymentModal(inv)}>
                      <CreditCard size={16} />Record payment
                    </button>}
                  </div>
                </article>
              ))}
              {!filteredInvoices.length && <p className="schedule-list-empty">No matching invoices.</p>}
            </div>

            {/* Desktop Invoices Table */}
            <div className="invoice-list-table overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs responsive-records">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Invoice ID</th>
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-3">Doctor</th>
                    <th className="py-2.5 px-3">Date & Due</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-right">Paid</th>
                    <th className="py-2.5 px-3 text-right">Balance Due</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td data-label="Invoice ID" className="py-3 px-3">
                          <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {inv.id}
                          </span>
                        </td>

                        <td data-label="Patient" className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{inv.patientName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{inv.patientId}</div>
                        </td>

                        <td data-label="Doctor" className="py-3 px-3">
                          <div className="font-medium text-slate-800">{inv.doctorName}</div>
                          <div className="text-[10px] text-slate-400">{inv.items.length} item(s)</div>
                        </td>

                        <td data-label="Date & Due" className="py-3 px-3">
                          <div className="font-medium text-slate-800">{inv.date}</div>
                          {inv.dueDate && (
                            <div className="text-[10px] text-slate-400">Due: {inv.dueDate}</div>
                          )}
                        </td>

                        <td data-label="Total" className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                          ₹{inv.total.toLocaleString()}
                        </td>

                        <td data-label="Paid" className="py-3 px-3 text-right font-mono font-semibold text-emerald-700">
                          ₹{inv.paid.toLocaleString()}
                        </td>

                        <td data-label="Balance Due" className="py-3 px-3 text-right font-mono font-bold">
                          {inv.balance > 0 ? (
                            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              ₹{inv.balance.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-emerald-700">₹0</span>
                          )}
                        </td>

                        <td data-label="Status" className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : inv.status === 'Partial'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>

                        <td data-label="Actions" className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.balance > 0 && (
                              <button
                                onClick={() => handleOpenPaymentModal(inv)}
                                className="px-2.5 py-1 rounded bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-semibold cursor-pointer shadow-2xs flex items-center gap-1"
                                title="Record payment for this invoice"
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Pay / Collect</span>
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedInvoiceForView(inv)}
                              className="p-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer"
                              title="View Invoice & Print"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                        No invoices found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PAYMENT PAY RECORDS / LEDGER */}
        {activeTab === 'payments' && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Payment ledger</h3>
                <p className="text-xs text-slate-500">Every payment receipt recorded with date, method, and transaction reference</p>
              </div>

              <div className="module-filter-fields w-full sm:w-auto">
                <div className="relative flex items-center flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    aria-label="Search by receipt, patient or transaction reference" placeholder="Search payments"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-1.5 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <select
                  aria-label="Payment method filter"
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="py-1.5 px-2.5 text-xs bg-white border border-slate-200 rounded-md text-slate-700 cursor-pointer"
                >
                  <option value="ALL">All Methods</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Insurance">Insurance</option>
                </select>
              </div>
            </div>

            {/* Payments Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs responsive-records">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Receipt No.</th>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-3">Invoice Ref</th>
                    <th className="py-2.5 px-3 text-right">Amount Paid</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Transaction / Ref ID</th>
                    <th className="py-2.5 px-3">Received By</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                        <td data-label="Receipt No." className="py-3 px-3">
                          <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {pay.receiptNumber}
                          </span>
                        </td>

                        <td data-label="Date & Time" className="py-3 px-3">
                          <div className="font-medium text-slate-800">{pay.date}</div>
                          <div className="text-[10px] text-slate-400">{pay.time}</div>
                        </td>

                        <td data-label="Patient" className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{pay.patientName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{pay.patientId}</div>
                        </td>

                        <td data-label="Invoice Ref" className="py-3 px-3">
                          <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                            {pay.invoiceId}
                          </span>
                        </td>

                        <td data-label="Amount Paid" className="py-3 px-3 text-right font-mono font-bold text-emerald-700 text-sm">
                          ₹{pay.amount.toLocaleString()}
                        </td>

                        <td data-label="Method" className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              pay.paymentMethod === 'UPI'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : pay.paymentMethod === 'Card'
                                ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                : pay.paymentMethod === 'Cash'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-teal-100 text-teal-800 border border-teal-200'
                            }`}
                          >
                            <span>{pay.paymentMethod}</span>
                          </span>
                        </td>

                        <td data-label="Transaction / Ref ID" className="py-3 px-3 font-mono text-[11px] text-slate-600">
                          {pay.referenceNumber || 'N/A'}
                        </td>

                        <td data-label="Received By" className="py-3 px-3 text-slate-600">
                          {pay.receivedBy}
                        </td>

                        <td data-label="Status" className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Cleared ✓
                          </span>
                        </td>

                        <td data-label="Receipt" className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setActiveReceipt(pay);
                              setIsReceiptModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1"
                            title="View official digital receipt"
                          >
                            <Receipt className="w-3 h-3 text-emerald-700" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                        No payment records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CREATE NEW BILL (WIZARD) */}
        {activeTab === 'create-bill' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-6 max-w-4xl">
            <div>
              <h2 className="text-base font-bold text-slate-900">Create New Patient Bill / Invoice</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate an itemized invoice for treatments, dental procedures, and consultations.
              </p>
            </div>

            {/* Step 1: Patient & Doctor Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Select Patient *</label>
                <select
                  value={newBillPatientId}
                  onChange={(e) => setNewBillPatientId(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-medium"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone || p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Consulting Doctor *</label>
                <select
                  value={newBillDoctorName}
                  onChange={(e) => setNewBillDoctorName(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-medium"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Due Date (Optional)</label>
                <input
                  type="date"
                  value={newBillDueDate}
                  onChange={(e) => setNewBillDueDate(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-medium"
                />
              </div>
            </div>

            {/* Planned Treatments from Doctor's Case Sheet & Dental Chart */}
            {(() => {
              const selectedPat = patients.find((p) => p.id === newBillPatientId);
              const activePlans = (selectedPat?.treatmentPlans || []).filter(
                (tp) => tp.status !== 'Completed' && tp.status !== 'Cancelled'
              );

              if (!selectedPat || activePlans.length === 0) return null;

              const totalPlannedCost = activePlans.reduce((sum, p) => sum + (p.estimatedCost || 0), 0);

              return (
                <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50/60 border-2 border-sky-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 bg-white px-2 py-0.5 rounded border border-sky-300">
                          Doctor Treatment Plan Integration
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {activePlans.length} Planned Procedure{activePlans.length > 1 ? 's' : ''} • Est. Total: <strong className="font-mono text-emerald-800">₹{totalPlannedCost.toLocaleString()}</strong>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Procedures with amounts added during doctor consultation and dental charting. Click to import directly into the invoice.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const itemsToAdd = activePlans.map((plan) => ({
                          description: `${plan.procedure}${plan.toothNumbers?.length ? ` (Tooth #${plan.toothNumbers.join(', #')})` : ''}`,
                          quantity: 1,
                          unitPrice: plan.estimatedCost || 1000
                        }));
                        setNewBillItems((prev) => {
                          if (prev.length === 1 && prev[0].description === 'Dental Consultation & Oral Examination') {
                            return itemsToAdd;
                          }
                          return [...prev, ...itemsToAdd];
                        });
                        addToast('Treatment Plans Imported', `Added ${activePlans.length} planned procedures totaling ₹${totalPlannedCost}.`, 'success');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shadow-2xs transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Import All Planned Treatments (₹{totalPlannedCost.toLocaleString()})</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                    {activePlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="p-2.5 bg-white rounded-lg border border-sky-200 flex items-center justify-between gap-2 shadow-2xs hover:border-sky-400 transition-colors"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 text-xs block truncate" title={plan.procedure}>
                            {plan.procedure}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                            {plan.toothNumbers?.length > 0 && (
                              <span className="font-mono font-bold text-sky-700">
                                #{plan.toothNumbers.join(', #')}
                              </span>
                            )}
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 font-semibold">
                              {plan.status}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-black text-emerald-800 text-xs block">
                            ₹{plan.estimatedCost.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setNewBillItems((prev) => [
                                ...prev,
                                {
                                  description: `${plan.procedure}${plan.toothNumbers?.length ? ` (Tooth #${plan.toothNumbers.join(', #')})` : ''}`,
                                  quantity: 1,
                                  unitPrice: plan.estimatedCost || 1000
                                }
                              ]);
                              addToast('Item Added', `${plan.procedure} added to bill.`, 'info');
                            }}
                            className="mt-0.5 px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 rounded text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            + Add to Bill
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Step 2: Line Items */}
            <div className="space-y-3">
              <div className="module-section-heading">
                <h3 className="text-base font-semibold">Bill items</h3>
                <button
                  type="button"
                  onClick={handleAddItemToNewBill}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="bill-item-editor w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Description / Procedure</th>
                      <th className="py-2 px-3 w-20 text-center">Qty</th>
                      <th className="py-2 px-3 w-32 text-right">Unit Price (₹)</th>
                      <th className="py-2 px-3 w-28 text-right">Total</th>
                      <th className="py-2 px-3 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {newBillItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2" data-field="Procedure">
                          <input
                            aria-label={`Procedure for item ${idx + 1}`}
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const updated = [...newBillItems];
                              updated[idx].description = e.target.value;
                              setNewBillItems(updated);
                            }}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                            placeholder="e.g. Ultrasonic Scaling, Root Canal, Composite Filling"
                          />
                        </td>
                        <td className="p-2 text-center" data-field="Quantity">
                          <input
                            aria-label={`Quantity for item ${idx + 1}`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = [...newBillItems];
                              updated[idx].quantity = Number(e.target.value) || 1;
                              setNewBillItems(updated);
                            }}
                            className="w-16 p-1.5 text-center bg-white border border-slate-200 rounded text-xs"
                          />
                        </td>
                        <td className="p-2 text-right" data-field="Unit price (₹)">
                          <input
                            aria-label={`Unit price in rupees for item ${idx + 1}`}
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const updated = [...newBillItems];
                              updated[idx].unitPrice = Number(e.target.value) || 0;
                              setNewBillItems(updated);
                            }}
                            className="w-28 p-1.5 text-right bg-white border border-slate-200 rounded text-xs"
                          />
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-slate-800" data-field="Total">
                          ₹{(item.quantity * item.unitPrice).toLocaleString()}
                        </td>
                        <td className="p-2 text-center">
                          {newBillItems.length > 1 && (
                            <button
                              type="button"
                              aria-label={`Remove item ${idx + 1}`}
                              onClick={() => handleRemoveItemFromNewBill(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quick Preset Procedure Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Quick Add:</span>
                {[
                  { name: 'Routine Scaling & Polishing', price: 800 },
                  { name: 'Diagnostic RVG Digital X-Ray', price: 350 },
                  { name: 'Composite Tooth Restoration', price: 1200 },
                  { name: 'Root Canal Session 1', price: 2500 }
                ].map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => {
                      setNewBillItems((prev) => [
                        ...prev,
                        { description: preset.name, quantity: 1, unitPrice: preset.price }
                      ]);
                    }}
                    className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer transition-colors"
                  >
                    + {preset.name} (₹{preset.price})
                  </button>
                ))}
              </div>
            </div>

            {/* Calculations & Immediate Payment Option */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-slate-200">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="collectImmediate"
                    checked={newBillCollectNow}
                    onChange={(e) => {
                      setNewBillCollectNow(e.target.checked);
                      if (e.target.checked) {
                        const sub = newBillItems.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
                        const tot = Math.max(0, sub - newBillDiscount);
                        setNewBillPayAmount(tot);
                      }
                    }}
                    className="rounded text-emerald-800 cursor-pointer"
                  />
                  <label htmlFor="collectImmediate" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Collect payment immediately upon billing (POS / Counter)
                  </label>
                </div>

                {newBillCollectNow && (
                  <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                    <div className="text-[11px] font-bold text-emerald-900">Immediate Payment Details</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-medium text-slate-600 block mb-0.5">Payment Method</label>
                        <select
                          value={newBillPayMethod}
                          onChange={(e) => setNewBillPayMethod(e.target.value as PaymentMethod)}
                          className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                        >
                          <option value="UPI">UPI / QR Code</option>
                          <option value="Card">Debit / Credit Card</option>
                          <option value="Cash">Cash at Counter</option>
                          <option value="Net Banking">Net Banking</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-medium text-slate-600 block mb-0.5">Amount to Collect (₹)</label>
                        <input
                          type="number"
                          value={newBillPayAmount}
                          onChange={(e) => setNewBillPayAmount(Number(e.target.value))}
                          className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Total Calculation Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                {(() => {
                  const subtotal = newBillItems.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
                  const total = Math.max(0, subtotal - newBillDiscount);
                  const remainingDue = newBillCollectNow ? Math.max(0, total - newBillPayAmount) : total;

                  return (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal:</span>
                        <span className="font-mono font-semibold">₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Discount (₹):</span>
                        <input
                          type="number"
                          min="0"
                          value={newBillDiscount}
                          onChange={(e) => setNewBillDiscount(Number(e.target.value) || 0)}
                          className="w-24 p-1 text-right bg-white border border-slate-200 rounded font-mono text-xs"
                        />
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200 text-sm">
                        <span>Total Invoice Amount:</span>
                        <span className="font-mono text-emerald-800">₹{total.toLocaleString()}</span>
                      </div>
                      {newBillCollectNow && (
                        <div className="flex justify-between font-bold text-emerald-700 text-xs">
                          <span>Collecting Now:</span>
                          <span className="font-mono">₹{newBillPayAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-slate-700 text-xs pt-1 border-t border-slate-200">
                        <span>Balance Remaining:</span>
                        <span className="font-mono text-rose-600">₹{remainingDue.toLocaleString()}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('invoices')}
                className="px-4 py-2 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateBillSubmit}
                className="px-5 py-2 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Issue Invoice & Generate Bill</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* STEP-BY-STEP RECORD PAYMENT MODAL                   */}
      {/* ==================================================== */}
      {isRecordPaymentModalOpen && (
        <ModalLayer onDismiss={() => setIsRecordPaymentModalOpen(false)} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-5 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  💳
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Record Patient Payment</h3>
                  <p className="text-[11px] text-slate-500">Step {paymentStep} of 3: Fast-track settlement</p>
                </div>
              </div>
              <button aria-label="Close dialog"
                onClick={() => setIsRecordPaymentModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-between px-2">
              {[
                { s: 1, label: 'Invoice & Amount' },
                { s: 2, label: 'Payment Method' },
                { s: 3, label: 'Confirm & Receipt' }
              ].map((stepItem) => (
                <div key={stepItem.s} className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      paymentStep === stepItem.s
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : paymentStep > stepItem.s
                        ? 'bg-emerald-100 text-emerald-800 font-bold'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {paymentStep > stepItem.s ? '✓' : stepItem.s}
                  </div>
                  <span
                    className={`text-[11px] hidden sm:inline ${
                      paymentStep === stepItem.s ? 'font-bold text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {stepItem.label}
                  </span>
                </div>
              ))}
            </div>

            {/* STEP 1: SELECT INVOICE & AMOUNT */}
            {paymentStep === 1 && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Select Target Invoice</label>
                  <select
                    value={payInvoiceId}
                    onChange={(e) => {
                      setPayInvoiceId(e.target.value);
                      const target = invoices.find((i) => i.id === e.target.value);
                      if (target) {
                        setSelectedInvoiceForPayment(target);
                        setPayAmount(target.balance > 0 ? target.balance : target.total);
                        setCashTendered(target.balance > 0 ? target.balance : target.total);
                      }
                    }}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    {invoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.id} — {inv.patientName} (Balance Due: ₹{inv.balance.toLocaleString()} / Total: ₹{inv.total.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedInvoiceForPayment && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Patient:</span>
                      <strong className="text-slate-900">{selectedInvoiceForPayment.patientName}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Doctor:</span>
                      <span>{selectedInvoiceForPayment.doctorName}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Total Invoice:</span>
                      <span className="font-mono">₹{selectedInvoiceForPayment.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Already Paid:</span>
                      <span className="font-mono text-emerald-700">₹{selectedInvoiceForPayment.paid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                      <span>Current Due:</span>
                      <span className="font-mono text-rose-600">₹{selectedInvoiceForPayment.balance.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Payment Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPayAmount(val);
                        setCashTendered(val);
                      }}
                      className="w-full py-2 pl-7 pr-3 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-700"
                    />
                  </div>

                  {/* Quick Amount Chips */}
                  {selectedInvoiceForPayment && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPayAmount(selectedInvoiceForPayment.balance);
                          setCashTendered(selectedInvoiceForPayment.balance);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                      >
                        Full Balance (₹{selectedInvoiceForPayment.balance.toLocaleString()})
                      </button>
                      {selectedInvoiceForPayment.balance > 1000 && (
                        <button
                          type="button"
                          onClick={() => {
                            const half = Math.round(selectedInvoiceForPayment.balance / 2);
                            setPayAmount(half);
                            setCashTendered(half);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                        >
                          50% (₹{Math.round(selectedInvoiceForPayment.balance / 2).toLocaleString()})
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setPayAmount(500);
                          setCashTendered(500);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                      >
                        ₹500
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPayAmount(1000);
                          setCashTendered(1000);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                      >
                        ₹1,000
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (payAmount <= 0) {
                        addToast('Error', 'Please enter a valid amount.', 'danger');
                        return;
                      }
                      setPaymentStep(2);
                    }}
                    className="px-4 py-2 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Choose Payment Method</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CHOOSE PAYMENT METHOD */}
            {paymentStep === 2 && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Select Payment Method</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'UPI', label: 'UPI / QR', icon: <QrCode className="w-4 h-4 text-purple-600" /> },
                      { id: 'Card', label: 'Card (POS)', icon: <CreditCard className="w-4 h-4 text-sky-600" /> },
                      { id: 'Cash', label: 'Cash Desk', icon: <DollarSign className="w-4 h-4 text-amber-600" /> },
                      { id: 'Net Banking', label: 'Net Banking', icon: <Building className="w-4 h-4 text-teal-600" /> }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPayMethod(m.id as PaymentMethod)}
                        className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 cursor-pointer transition-all ${
                          payMethod === m.id
                            ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {m.icon}
                        <span className="text-xs">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* UPI QR Visual Preview */}
                {payMethod === 'UPI' && (
                  <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col items-center text-center gap-2">
                    <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">
                      Instant Clinic QR Scanner
                    </span>
                    <div className="w-28 h-28 bg-white p-2 rounded-lg border border-purple-200 shadow-2xs flex flex-col items-center justify-center">
                      <QrCode className="w-20 h-20 text-slate-800" />
                    </div>
                    <div className="text-[11px] font-bold text-slate-800">
                      UPI ID: <span className="font-mono text-purple-900">smilecare.dental@hdfcbank</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Patient can scan via Google Pay, PhonePe, Paytm, or BHIM. Amount: ₹{payAmount.toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Cash Calculator */}
                {payMethod === 'Cash' && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-950">Cash Received from Patient:</span>
                      <div className="relative w-28">
                        <span className="absolute left-2 top-1 text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          value={cashTendered}
                          onChange={(e) => setCashTendered(Number(e.target.value))}
                          className="w-full py-1 pl-5 pr-2 bg-white border border-slate-300 rounded font-mono font-bold text-right"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-amber-200 font-bold text-amber-950">
                      <span>Change to Return:</span>
                      <span className="font-mono text-emerald-800 text-sm">
                        ₹{Math.max(0, cashTendered - payAmount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Reference ID input */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Transaction / Reference ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={payReference}
                    onChange={(e) => setPayReference(e.target.value)}
                    placeholder="e.g. UTR #, Card Auth Code, Receipt Note"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Staff Notes / Comments
                  </label>
                  <input
                    type="text"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    placeholder="e.g. Settlement for session 1"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentStep(1)}
                    className="px-3.5 py-2 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStep(3)}
                    className="px-4 py-2 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Review Settlement</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CONFIRMATION & ISSUE RECEIPT */}
            {paymentStep === 3 && (
              <div className="space-y-4 pt-2">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 pb-1.5 border-b border-slate-200 font-bold">
                    <span>Invoice:</span>
                    <span className="font-mono text-slate-900">{payInvoiceId}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Patient Name:</span>
                    <strong className="text-slate-900">{selectedInvoiceForPayment?.patientName}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Payment Mode:</span>
                    <strong className="text-slate-900">{payMethod}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Transaction Ref:</span>
                    <span className="font-mono">{payReference || 'None'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200 text-sm">
                    <span>Amount Being Paid:</span>
                    <span className="font-mono text-emerald-700 text-base">₹{payAmount.toLocaleString()}</span>
                  </div>
                  {selectedInvoiceForPayment && (
                    <div className="flex justify-between text-slate-500 pt-1 text-[11px]">
                      <span>Remaining Balance after Payment:</span>
                      <span className="font-mono font-bold text-rose-600">
                        ₹{Math.max(0, selectedInvoiceForPayment.balance - payAmount).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentStep(2)}
                    className="px-3.5 py-2 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleRecordPaymentSubmit}
                    className="px-5 py-2 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Generate Digital Receipt</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </ModalLayer>
      )}

      {/* ==================================================== */}
      {/* DIGITAL RECEIPT MODAL                                */}
      {/* ==================================================== */}
      {isReceiptModalOpen && activeReceipt && (
        <ModalLayer onDismiss={() => setIsReceiptModalOpen(false)} className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            {/* Top Close Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Payment Cleared & Confirmed
              </span>
              <button aria-label="Close dialog"
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Digital Receipt Card */}
            <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200 space-y-3.5 text-xs text-slate-700">
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <div className="text-lg font-bold text-slate-900 tracking-tight flex items-center justify-center gap-1.5">
                  <span>🦷</span>
                  <span>Shriya Multispeciality Dental Clinic</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  104 Medical Enclave, Indiranagar • Reg: DENT-2026-KA • Tel: +91 98888 77777
                </div>
                <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider">
                  Official Payment Receipt
                </div>
              </div>

              <div className="space-y-1.5 pb-3 border-b border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt No:</span>
                  <strong className="font-mono text-slate-900">{activeReceipt.receiptNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span>{activeReceipt.date} • {activeReceipt.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice ID:</span>
                  <span className="font-mono">{activeReceipt.invoiceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient Name:</span>
                  <strong className="text-slate-900">{activeReceipt.patientName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient ID:</span>
                  <span className="font-mono">{activeReceipt.patientId}</span>
                </div>
                {activeReceipt.doctorName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Doctor:</span>
                    <span>{activeReceipt.doctorName}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 pb-3 border-b border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <strong>{activeReceipt.paymentMethod}</strong>
                </div>
                {activeReceipt.referenceNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction Ref:</span>
                    <span className="font-mono text-[11px]">{activeReceipt.referenceNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Received By:</span>
                  <span>{activeReceipt.receivedBy}</span>
                </div>
              </div>

              {/* Total Paid Highlight */}
              <div className="bg-emerald-100/60 p-3 rounded-lg flex items-center justify-between text-emerald-950 font-bold">
                <span className="text-xs uppercase tracking-wider">Amount Paid</span>
                <span className="text-xl font-mono">₹{activeReceipt.amount.toLocaleString()}</span>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-1">
                Thank you for visiting Shriya Multispeciality Dental Clinic. Keep smiling!
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  window.print();
                  addToast('Printed', 'Receipt sent to printer.', 'info');
                }}
                className="flex-1 py-2 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>

              <button
                onClick={() => {
                  addToast('Receipt Shared 💬', `WhatsApp receipt link sent to ${activeReceipt.patientPhone || 'patient'}.`, 'success');
                }}
                className="py-2 px-3 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                title="Share via WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="py-2 px-3 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </ModalLayer>
      )}

      {/* ==================================================== */}
      {/* INVOICE VIEW & PRINT MODAL                           */}
      {/* ==================================================== */}
      {selectedInvoiceForView && <InvoicePreview invoice={selectedInvoiceForView}
        opNumber={patients.find(patient => patient.id === selectedInvoiceForView.patientId)?.opNumber}
        onClose={() => setSelectedInvoiceForView(null)}
        onPayment={() => { setSelectedInvoiceForView(null); handleOpenPaymentModal(selectedInvoiceForView); }}
      />}

      {/* PRINTABLE OFFICIAL RECEIPT MODAL (PHASE 6) */}
      {showPrintableReceiptModal && activeReceipt && (
        <PrintableReceiptModal
          isOpen={showPrintableReceiptModal}
          onClose={() => setShowPrintableReceiptModal(false)}
          payment={activeReceipt}
          patient={patients.find((p) => p.id === activeReceipt.patientId)}
        />
      )}
    </div>
  );
};
