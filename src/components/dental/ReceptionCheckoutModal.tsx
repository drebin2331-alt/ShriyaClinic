import { ModalLayer } from '../common/ModalLayer';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ClinicVisit, PatientRecord, PaymentMethod, PaymentRecord, Invoice } from '../../types';
import { ClayButton } from '../common/ClayButton';
import { PrintableReceiptModal } from './PrintableReceiptModal';
import { 
  X, 
  CheckCircle2, 
  CreditCard, 
  Receipt, 
  Calendar, 
  Clock, 
  Stethoscope, 
  AlertCircle, 
  Printer, 
  ArrowRight,
  FileText, 
  UserCheck, 
  ShieldCheck, 
  QrCode,
  ExternalLink,
  DollarSign,
  Banknote,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface ReceptionCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit?: ClinicVisit;
  patient?: PatientRecord;
  targetInvoiceId?: string;
  targetFeeApprovalId?: string;
}

export const ReceptionCheckoutModal: React.FC<ReceptionCheckoutModalProps> = ({
  isOpen,
  onClose,
  visit,
  patient,
  targetInvoiceId,
  targetFeeApprovalId
}) => {
  const { 
    invoices, 
    payments, 
    recordPayment, 
    createInvoice,
    closeVisit, 
    addAppointment, 
    addToast,
    doctors,
    patients,
    visits,
    setActiveView,
    setSelectedPatientForDetail
  } = useApp();
  const { currentUser } = useAuth();

  // Resolve real-time visit & patient records
  const currentVisit = visits.find((v) => v.id === visit?.id || (v.tokenId && v.tokenId === visit?.tokenId)) || visit;
  const currentPatient = patients.find((p) => p.id === currentVisit?.patientId || p.id === patient?.id) || patient;

  // Deduplicate all available invoices by ID
  const allInvoices = React.useMemo(() => {
    const map = new Map<string, Invoice>();
    (currentPatient?.invoices || []).forEach((inv) => map.set(inv.id, inv));
    (invoices || []).forEach((inv) => map.set(inv.id, inv));
    return Array.from(map.values());
  }, [invoices, currentPatient?.invoices]);

  // Priority-based invoice resolution
  const linkedInvoice = React.useMemo(() => {
    const candidateInvoices = allInvoices.filter(
      (inv) =>
        inv.patientId === currentPatient?.id ||
        (currentPatient?.opNumber && inv.patientOpNumber === currentPatient.opNumber) ||
        (inv.patientName && currentPatient?.name && inv.patientName.toLowerCase() === currentPatient.name.toLowerCase())
    );

    // 1. Explicit target invoice ID
    if (targetInvoiceId) {
      const match = candidateInvoices.find((i) => i.id === targetInvoiceId);
      if (match) return match;
    }

    // 2. Explicit target fee approval ID
    if (targetFeeApprovalId) {
      const match = candidateInvoices.find((i) => i.feeApprovalId === targetFeeApprovalId);
      if (match) return match;
    }

    // 3. Current visit's fee approval invoiceId
    if (currentVisit?.feeApproval?.invoiceId) {
      const match = candidateInvoices.find((i) => i.id === currentVisit.feeApproval.invoiceId);
      if (match && (match.balance > 0 || !candidateInvoices.some((ci) => ci.balance > 0))) return match;
    }

    // 4. Current visit's fee approval ID
    if (currentVisit?.feeApproval?.id) {
      const match = candidateInvoices.find((i) => i.feeApprovalId === currentVisit.feeApproval.id);
      if (match && (match.balance > 0 || !candidateInvoices.some((ci) => ci.balance > 0))) return match;
    }

    // 5. Any UNPAID invoice for this patient with balance > 0
    const unpaidInv = candidateInvoices.find((i) => i.status !== 'Paid' && i.balance > 0);
    if (unpaidInv) return unpaidInv;

    // 6. Current visit's direct invoiceId
    if (currentVisit?.invoiceId) {
      const match = candidateInvoices.find((i) => i.id === currentVisit.invoiceId);
      if (match) return match;
    }

    // 7. Fallback to newest invoice
    return candidateInvoices[0] || null;
  }, [allInvoices, targetInvoiceId, targetFeeApprovalId, currentVisit, currentPatient]);

  // Treatment plan total
  const treatmentPlanTotal = (currentPatient?.treatmentPlans || []).reduce(
    (sum, tp) => sum + (Number(tp.estimatedCost) || 0),
    0
  );
  const defaultConsultationFee = 0;
  const estimatedVisitCost = currentVisit?.feeApproval?.finalPayable 
    ? currentVisit.feeApproval.finalPayable 
    : (treatmentPlanTotal > 0 ? treatmentPlanTotal : 0);

  const doctorApprovedAmount = currentVisit?.feeApproval?.finalPayable || estimatedVisitCost;
  const grossTotal = linkedInvoice ? linkedInvoice.total : Math.max(doctorApprovedAmount, currentPatient?.outstandingBalance || 0);
  const alreadyPaid = linkedInvoice ? linkedInvoice.paid : 0;

  // Real-time remaining balance
  const remainingBalance = linkedInvoice 
    ? linkedInvoice.balance 
    : Math.max(0, grossTotal - alreadyPaid);

  // Payment Form State
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
  const [payAmount, setPayAmount] = useState<number>(remainingBalance);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('UPI');
  const [payRef, setPayRef] = useState<string>('');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [payNotes, setPayNotes] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState<boolean>(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<PaymentRecord | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  // Synchronize payAmount with remainingBalance
  useEffect(() => {
    setPayAmount(remainingBalance);
  }, [remainingBalance, linkedInvoice?.id]);

  // Follow-Up Appointment State
  const [bookFollowUp, setBookFollowUp] = useState<boolean>(!!currentVisit?.followUpDate);
  const [followUpDate, setFollowUpDate] = useState<string>(currentVisit?.followUpDate || '');
  const [followUpTimeSlot, setFollowUpTimeSlot] = useState<string>('10:30 AM');
  const [followUpDoctorId, setFollowUpDoctorId] = useState<string>(currentVisit?.doctorId || 'doc-1');
  const [followUpReason, setFollowUpReason] = useState<string>(currentVisit?.followUpReason || 'Review & Follow-up');
  const [followUpBooked, setFollowUpBooked] = useState<boolean>(false);

  // Admin notes and closing
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isClosing, setIsClosing] = useState<boolean>(false);

  useEffect(() => {
    if (currentVisit?.followUpDate) {
      setFollowUpDate(currentVisit.followUpDate);
      setBookFollowUp(true);
    }
    if (currentVisit?.doctorId) {
      setFollowUpDoctorId(currentVisit.doctorId);
    }
    if (currentVisit?.followUpReason) {
      setFollowUpReason(currentVisit.followUpReason);
    }
    setPayAmount(remainingBalance);
  }, [currentVisit?.id, currentVisit?.followUpDate, currentVisit?.doctorId, currentVisit?.followUpReason, remainingBalance]);

  if (!isOpen || !currentVisit || !currentPatient) return null;

  // Navigate to Billing & Invoices section
  const handleGoToBillingPage = () => {
    setSelectedPatientForDetail(currentPatient);
    setActiveView('admin-billing');
    onClose();
  };

  // Ensure an invoice exists for the doctor-approved fee
  const ensureInvoice = async (): Promise<Invoice> => {
    if (linkedInvoice) return linkedInvoice;

    setIsGeneratingInvoice(true);
    try {
      const fallbackItems: Array<{ description: string; quantity: number; unitPrice: number }> = [
        {
          description: currentVisit?.reasonForVisit || currentPatient?.currentTreatment || 'Doctor Dental Consultation & Examination',
          quantity: 1,
          unitPrice: defaultConsultationFee
        },
        ...(currentPatient?.treatmentPlans || []).map((tp) => ({
          description: tp.procedure,
          quantity: 1,
          unitPrice: Number(tp.estimatedCost) || 0
        }))
      ];

      const items = currentVisit?.feeApproval?.items && currentVisit.feeApproval.items.length > 0
        ? currentVisit.feeApproval.items
        : fallbackItems;

      const inv = await createInvoice({
        visitId: currentVisit.id,
        patientId: currentPatient.id,
        patientName: currentPatient.name,
        doctorName: currentVisit?.feeApproval?.authorizingDoctorName || currentVisit?.doctorName || 'Attending Doctor',
        items: items.map(it => ({
          description: it.description,
          quantity: it.quantity || 1,
          unitPrice: it.unitPrice || 0
        })),
        discount: currentVisit?.feeApproval?.discountAmount || 0,
        tax: currentVisit?.feeApproval?.tax || 0,
        notes: currentVisit?.feeApproval?.discountReason ? `Discount: ${currentVisit.feeApproval.discountReason}` : undefined
      });
      addToast('Bill Generated 📄', `Official invoice ${inv.id} created for ₹${inv.total.toLocaleString()}.`, 'success');
      return inv;
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  // Handle Payment Submission (Full or Partial)
  const handleRecordPaymentSubmit = async () => {
    const amt = Number(payAmount);
    if (isNaN(amt) || amt <= 0) {
      addToast('Invalid Amount', 'Please enter a valid payment amount greater than ₹0.', 'danger');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const targetInvoice = linkedInvoice || (await ensureInvoice());

      const rec = await recordPayment({
        invoiceId: targetInvoice.id,
        amount: amt,
        paymentMethod: payMethod,
        referenceNumber: payRef || (payMethod === 'UPI' ? `UPI-${Date.now().toString().slice(-6)}` : undefined),
        notes: payNotes || (cashTendered > amt ? `Cash received ₹${cashTendered}, change returned ₹${cashTendered - amt}` : `Payment collected at checkout by ${currentUser.name}`),
        receivedBy: currentUser.name,
        patientId: currentPatient.id
      });

      setGeneratedReceipt(rec);
      setPayAmount(Math.max(0, remainingBalance - amt));
      addToast('Payment Recorded! 💳', `Receipt ${rec.receiptNumber} generated for ₹${amt.toLocaleString()} via ${payMethod}.`, 'success');
    } catch (err: any) {
      addToast('Payment Error', err.message || 'Could not record payment.', 'danger');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle Follow-up Booking
  const handleBookFollowUp = async () => {
    if (!followUpDate) {
      addToast('Select Date', 'Please choose a follow-up appointment date.', 'warning');
      return;
    }
    try {
      await addAppointment({
        patientName: currentPatient.name,
        patientPhone: currentPatient.phone,
        patientAge: currentPatient.age,
        patientGender: currentPatient.gender,
        doctorId: followUpDoctorId,
        date: followUpDate,
        timeSlot: followUpTimeSlot,
        reasonForVisit: followUpReason
      });
      setFollowUpBooked(true);
      addToast('Follow-Up Confirmed', `Appointment booked for ${followUpDate} at ${followUpTimeSlot}.`, 'success');
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to book follow-up appointment.', 'danger');
    }
  };

  // Complete Checkout and Close Encounter
  const handleCompleteCheckout = async () => {
    setIsClosing(true);
    try {
      await closeVisit(currentVisit.id, adminNotes);
      onClose();
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to close encounter.', 'danger');
    } finally {
      setIsClosing(false);
    }
  };

  const cashChange = payMethod === 'Cash' && cashTendered > payAmount ? cashTendered - payAmount : 0;

  return (
    <ModalLayer onDismiss={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200 max-h-[94vh] overflow-y-auto space-y-5">
        
        {/* ========================================================= */}
        {/* MODAL HEADER WITH DIRECT BILLING HUB SHORTCUT             */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Reception Checkout Desk
              </span>
              <span className="text-xs font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                Token {currentVisit.tokenId || 'Active'}
              </span>
              {linkedInvoice && (
                <span className="text-xs font-mono font-semibold text-slate-500">
                  Bill #{linkedInvoice.id}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Close Today's Visit — {currentPatient.name}
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              OP Number: <strong className="text-slate-800 font-mono">{currentPatient.opNumber || currentPatient.id}</strong> • Doctor: <strong className="text-slate-800">{currentVisit.doctorName}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGoToBillingPage}
              className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
              title="Open dedicated Bills & Invoices section for this patient"
            >
              <CreditCard className="w-3.5 h-3.5 text-sky-700" />
              <span>Billing Hub ↗</span>
            </button>
            <button aria-label="Close dialog"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clinical Diagnosis & Doctor's Treatment Summary */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Clinical Diagnosis:</span>
            <p className="font-bold text-slate-900 mt-0.5">{currentVisit.diagnosis || 'General Dental Examination'}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Treatment Performed Today:</span>
            <p className="font-bold text-slate-900 mt-0.5">{currentVisit.treatmentPlan || currentVisit.reasonForVisit || 'Oral Consultation'}</p>
          </div>
          {currentVisit.clinicalNotes && (
            <div className="md:col-span-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Doctor's Advice & Post-Care Instructions:</span>
              <p className="text-slate-700 font-medium mt-0.5 leading-relaxed">{currentVisit.clinicalNotes}</p>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* DOCTOR-APPROVED FEES & INVOICE BREAKDOWN                  */}
        {/* ========================================================= */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-sky-600" />
              <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                Doctor-Approved Fees & Balance Due
              </h3>
            </div>
            {currentVisit.feeApproval && (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                Authorized by {currentVisit.feeApproval.authorizingDoctorName}
              </span>
            )}
          </div>

          {/* Line items for this fee / invoice */}
          {((currentVisit.feeApproval?.items && currentVisit.feeApproval.items.length > 0) || (linkedInvoice?.items && linkedInvoice.items.length > 0)) && (
            <div className="overflow-x-auto bg-slate-50/90 rounded-xl p-3 border border-slate-200 text-xs">
              <table className="w-full text-left responsive-records">
                <thead>
                  <tr className="text-slate-500 font-bold border-b border-slate-200">
                    <th className="pb-1.5">Procedure / Service</th>
                    <th className="pb-1.5 text-center">Qty</th>
                    <th className="pb-1.5 text-right">Rate</th>
                    <th className="pb-1.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(currentVisit.feeApproval?.consultationFee || 0) > 0 && (
                    <tr>
                      <td data-label="Procedure / Service" className="py-1.5 font-semibold">Specialist Doctor Consultation</td>
                      <td data-label="Qty" className="py-1.5 text-center">1</td>
                      <td data-label="Rate" className="py-1.5 text-right tabular-nums">₹{currentVisit.feeApproval!.consultationFee.toLocaleString()}</td>
                      <td data-label="Amount" className="py-1.5 text-right tabular-nums font-bold">₹{currentVisit.feeApproval!.consultationFee.toLocaleString()}</td>
                    </tr>
                  )}
                  {(currentVisit.feeApproval?.items || linkedInvoice?.items || []).map((it: any, idx: number) => (
                    <tr key={it.id || idx}>
                      <td data-label="Procedure / Service" className="py-1.5 font-semibold text-slate-800">{it.description}</td>
                      <td data-label="Qty" className="py-1.5 text-center">{it.quantity || 1}</td>
                      <td data-label="Rate" className="py-1.5 text-right tabular-nums">₹{Number(it.unitPrice || (it.total / (it.quantity || 1)) || 0).toLocaleString()}</td>
                      <td data-label="Amount" className="py-1.5 text-right tabular-nums font-bold">₹{Number(it.total || ((it.quantity || 1) * (it.unitPrice || 0)) || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pricing Calculation Summary */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Gross Subtotal (Consultation + Procedures):</span>
              <span className="font-mono font-bold">₹{grossTotal.toLocaleString()}</span>
            </div>

            {currentVisit.feeApproval && currentVisit.feeApproval.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Doctor Discount ({currentVisit.feeApproval.discountReason}):</span>
                <span className="font-mono">- ₹{currentVisit.feeApproval.discountAmount.toLocaleString()}</span>
              </div>
            )}

            {currentVisit.feeApproval && currentVisit.feeApproval.tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Applicable Tax:</span>
                <span className="font-mono">+ ₹{currentVisit.feeApproval.tax.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between pt-1.5 border-t border-slate-200 font-black text-slate-900 text-sm">
              <span>Final Payable Amount:</span>
              <span className="font-mono text-sky-900">₹{grossTotal.toLocaleString()}</span>
            </div>

            {alreadyPaid > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold text-xs pt-1 border-t border-slate-200">
                <span>Total Paid to Date:</span>
                <span className="font-mono text-emerald-800">₹{alreadyPaid.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Remaining Outstanding Balance Status Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl bg-slate-100 border border-slate-200 gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Remaining Outstanding Balance</span>
              <div className={`text-2xl font-black font-mono ${remainingBalance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                ₹{remainingBalance.toLocaleString()}
              </div>
            </div>

            {remainingBalance <= 0 ? (
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                All Invoices Fully Settled
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-300">
                  Payment Collection Due
                </span>
                {!linkedInvoice && (
                  <button
                    type="button"
                    onClick={ensureInvoice}
                    disabled={isGeneratingInvoice}
                    className="px-2.5 py-1 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-[11px] font-bold cursor-pointer transition-all"
                  >
                    {isGeneratingInvoice ? 'Creating Bill...' : 'Create Bill 📄'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* PAYMENT COLLECTION PANEL (Full or Partial)                */}
          {/* ========================================================= */}
          {remainingBalance > 0 && (
            <div className="p-4 rounded-2xl bg-sky-50/80 border-2 border-sky-300 space-y-3.5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-sky-950 uppercase tracking-wide">
                    Collect Payment from Patient
                  </span>
                </div>

                {/* Full vs Partial Payment Mode Selector */}
                <div className="inline-flex rounded-xl p-1 bg-white border border-sky-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentType('full');
                      setPayAmount(remainingBalance);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      paymentType === 'full'
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Full Payment (₹{remainingBalance.toLocaleString()})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentType('partial');
                      setPayAmount(Math.round(remainingBalance / 2));
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      paymentType === 'partial'
                        ? 'bg-sky-700 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Partial Payment
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons for Partial Payment */}
              {paymentType === 'partial' && (
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-[11px] font-bold text-slate-500">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => setPayAmount(Math.round(remainingBalance * 0.25))}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    25% (₹{Math.round(remainingBalance * 0.25).toLocaleString()})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayAmount(Math.round(remainingBalance * 0.5))}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    50% (₹{Math.round(remainingBalance * 0.5).toLocaleString()})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayAmount(Math.round(remainingBalance * 0.75))}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    75% (₹{Math.round(remainingBalance * 0.75).toLocaleString()})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayAmount(remainingBalance)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                  >
                    100% (₹{remainingBalance.toLocaleString()})
                  </button>
                </div>
              )}

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Amount to Collect (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="1"
                      max={remainingBalance}
                      value={payAmount || ''}
                      onChange={(e) => setPayAmount(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 rounded-xl text-xs font-black border border-slate-300 bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  {payAmount < remainingBalance && payAmount > 0 && (
                    <span className="text-[10px] text-amber-700 font-bold block mt-1">
                      Balance after payment: ₹{(remainingBalance - payAmount).toLocaleString()}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white"
                  >
                    <option value="UPI">UPI / GPay / PhonePe / QR</option>
                    <option value="Cash">Cash (Physical Currency)</option>
                    <option value="Card">Debit / Credit Card (POS)</option>
                    <option value="Net Banking">Net Banking / NEFT / IMPS</option>
                    <option value="Insurance">Insurance / TPA Claim</option>
                  </select>
                </div>

                <div>
                  {payMethod === 'Cash' ? (
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Cash Tendered (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 5000"
                        value={cashTendered || ''}
                        onChange={(e) => setCashTendered(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white"
                      />
                      {cashChange > 0 && (
                        <span className="text-[10px] text-emerald-700 font-black block mt-1">
                          Change to Return: ₹{cashChange.toLocaleString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Transaction Ref / Auth Code
                      </label>
                      <input
                        type="text"
                        value={payRef}
                        onChange={(e) => setPayRef(e.target.value)}
                        placeholder={payMethod === 'UPI' ? 'UPI Ref / UTR #' : 'Card Auth / Ref #'}
                        className="w-full px-3 py-2 rounded-xl text-xs font-medium border border-slate-300 bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2 border-t border-sky-200">
                <span className="text-xs font-bold text-slate-600">
                  Ready to record: <strong className="text-emerald-800 font-mono">₹{payAmount.toLocaleString()}</strong> via {payMethod}
                </span>

                <ClayButton
                  variant="mint"
                  size="md"
                  onClick={handleRecordPaymentSubmit}
                  disabled={isProcessingPayment || payAmount <= 0}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  {isProcessingPayment ? 'Recording...' : `Collect ₹${payAmount.toLocaleString()} & Issue Receipt 🧾`}
                </ClayButton>
              </div>
            </div>
          )}

          {/* Generated Receipt Banner */}
          {generatedReceipt && (
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-300 flex items-center justify-between text-xs animate-in fade-in">
              <div>
                <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Payment Successful! Receipt #{generatedReceipt.receiptNumber}
                </span>
                <span className="text-[11px] text-emerald-700 block mt-0.5">
                  ₹{generatedReceipt.amount.toLocaleString()} received via {generatedReceipt.paymentMethod} by {generatedReceipt.receivedBy}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt 🖨️</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* SCHEDULE NEXT APPOINTMENT SECTION                         */}
        {/* ========================================================= */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                Follow-Up Appointment Booking
              </h3>
            </div>
            {followUpBooked && (
              <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                Appointment Booked ✓
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Appointment Date *</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Time Slot *</label>
              <select
                value={followUpTimeSlot}
                onChange={(e) => setFollowUpTimeSlot(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
              >
                {['09:30 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'].map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Consulting Doctor</label>
              <select
                value={followUpDoctorId}
                onChange={(e) => setFollowUpDoctorId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleBookFollowUp}
                disabled={followUpBooked || !followUpDate}
                className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  followUpBooked 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{followUpBooked ? 'Booked ✓' : 'Book Follow-Up'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Administration Notes */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            Reception Checkout Notes (Optional)
          </label>
          <input
            type="text"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="e.g. Patient collected medicine, receipt handed over, next visit confirmed."
            className="w-full px-3 py-2 rounded-xl text-xs font-medium border border-slate-300 bg-white"
          />
        </div>

        {/* ========================================================= */}
        {/* CLOSING / CHECKOUT ACTIONS & ENCOUNTER COMPLETION         */}
        {/* ========================================================= */}
        <div className="pt-2 border-t border-slate-200 space-y-3">
          {remainingBalance > 0 ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Remaining balance of <strong>₹{remainingBalance.toLocaleString()}</strong> is unpaid. Collect payment above, or close with balance remaining on patient's account.
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleGoToBillingPage}
                  className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 cursor-pointer text-xs"
                >
                  Manage Invoices in Billing Hub
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center gap-2 text-xs text-emerald-900 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All charges for today are fully settled (₹0 balance). Ready to finalize checkout.</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <ClayButton
                variant={remainingBalance <= 0 ? 'mint' : 'primary'}
                size="md"
                className="w-full sm:w-auto"
                onClick={handleCompleteCheckout}
                disabled={isClosing}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                {isClosing 
                  ? 'Closing Encounter...' 
                  : remainingBalance <= 0 
                    ? 'Complete Reception Checkout & Close Encounter' 
                    : `Close Encounter (Keep ₹${remainingBalance.toLocaleString()} on Ledger)`}
              </ClayButton>
            </div>
          </div>
        </div>

      </div>

      {/* Official Printable Receipt Modal */}
      {showReceiptModal && generatedReceipt && (
        <PrintableReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          payment={generatedReceipt}
          patientOpNumber={currentPatient.opNumber}
          invoiceBalance={remainingBalance}
        />
      )}
    </ModalLayer>
  );
};
