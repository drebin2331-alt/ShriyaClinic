import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PatientRecord, ClinicVisit, FeeApprovalRecord, Invoice } from '../../types';
import { ClayButton } from '../common/ClayButton';
import { X, CheckCircle2, DollarSign, Plus, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

interface DoctorFeeApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: PatientRecord;
  visit?: ClinicVisit;
  visitId?: string;
  patientId?: string;
  patientName?: string;
  defaultDoctorName?: string;
  onFeeApproved?: (approval: FeeApprovalRecord, invoice: Invoice) => void;
}

export const DoctorFeeApprovalModal: React.FC<DoctorFeeApprovalModalProps> = ({
  isOpen,
  onClose,
  patient,
  visit,
  visitId,
  patientId,
  patientName,
  defaultDoctorName,
  onFeeApproved
}) => {
  const { approveFee, addToast, doctors, patients, visits, tokens } = useApp();
  const { currentUser } = useAuth();

  const targetPatientId = patient?.id || patientId;
  const targetVisitId = visit?.id || visitId;

  const resolvedPatient = patient || (targetPatientId ? patients.find((p) => p.id === targetPatientId) : undefined);
  const resolvedVisit =
    visit ||
    (targetVisitId ? visits.find((v) => v.id === targetVisitId) : undefined) ||
    (targetPatientId ? visits.find((v) => v.patientId === targetPatientId && v.status !== 'Cancelled') : undefined);

  const existingFeeApproval =
    resolvedVisit?.feeApproval ||
    (resolvedPatient?.feeApprovals && resolvedPatient.feeApprovals.find((f) => f.visitId === resolvedVisit?.id));
  const isAlreadyApproved = Boolean(existingFeeApproval?.status === 'Approved' || resolvedVisit?.invoiceId);

  // When a previous fee is already approved/invoiced, default to 'new' mode so the doctor can add the NEXT fee cleanly
  const [mode, setMode] = useState<'new' | 'edit'>('new');

  const [consultationFee, setConsultationFee] = useState<number>(0);
  const [items, setItems] = useState<Array<{ id: string; description: string; quantity: number; unitPrice: number }>>([
    {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0
    }
  ]);
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load mode-specific data
  const handleSwitchMode = (targetMode: 'new' | 'edit') => {
    setMode(targetMode);
    if (targetMode === 'edit' && existingFeeApproval) {
      setConsultationFee(Number(existingFeeApproval.consultationFee) || 0);
      if (existingFeeApproval.items && existingFeeApproval.items.length > 0) {
        setItems(
          existingFeeApproval.items.map((it, idx) => ({
            id: it.id || `item-${idx}`,
            description: it.description,
            quantity: it.quantity || 1,
            unitPrice: Number(it.unitPrice) || 0
          }))
        );
      }
      setDiscountType(existingFeeApproval.discountType || 'amount');
      setDiscountValue(existingFeeApproval.discountValue || 0);
      setDiscountReason(existingFeeApproval.discountReason || '');
      setTaxRate(existingFeeApproval.tax || 0);
    } else {
      // Clean form for adding NEXT/NEW fee (do NOT show old billed or paid procedures)
      setConsultationFee(0);

      // Collect all procedure descriptions already billed across all patient invoices or fee approvals
      const alreadyBilledDescriptions = new Set<string>();
      (resolvedPatient?.invoices || []).forEach((inv) => {
        (inv.items || []).forEach((it) => {
          if (it.description) alreadyBilledDescriptions.add(it.description.toLowerCase().trim());
        });
      });
      (resolvedPatient?.feeApprovals || []).forEach((fa) => {
        (fa.items || []).forEach((it) => {
          if (it.description) alreadyBilledDescriptions.add(it.description.toLowerCase().trim());
        });
      });
      if (existingFeeApproval?.items) {
        existingFeeApproval.items.forEach((it) => {
          if (it.description) alreadyBilledDescriptions.add(it.description.toLowerCase().trim());
        });
      }

      const unbilledPlans = (resolvedPatient?.treatmentPlans || []).filter(
        (tp) =>
          tp.status !== 'Billed' &&
          tp.status !== 'Completed' &&
          !tp.invoiceId &&
          !alreadyBilledDescriptions.has((tp.procedure || '').toLowerCase().trim())
      );
      if (unbilledPlans.length > 0) {
        setItems(
          unbilledPlans.map((tp, idx) => ({
            id: `tp-item-${idx}`,
            description: tp.procedure,
            quantity: 1,
            unitPrice: Number(tp.estimatedCost) || 0
          }))
        );
      } else {
        setItems([
          {
            id: `item-${Date.now()}`,
            description: '',
            quantity: 1,
            unitPrice: 0
          }
        ]);
      }
      setDiscountType('amount');
      setDiscountValue(0);
      setDiscountReason('');
      setTaxRate(0);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    // By default, open in 'new' mode ready to add next fee
    handleSwitchMode('new');
  }, [isOpen, resolvedPatient?.id, resolvedVisit?.id]);

  if (!isOpen) return null;

  // Real-time calculations enforcing Phase 3 rules:
  const itemsSubtotal = items.reduce((sum, it) => sum + (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0), 0);
  const grossSubtotal = (Number(consultationFee) || 0) + itemsSubtotal;

  let calculatedDiscount = 0;
  if (discountType === 'percentage') {
    calculatedDiscount = Math.round((grossSubtotal * Math.min(100, Math.max(0, Number(discountValue) || 0))) / 100);
  } else {
    calculatedDiscount = Math.min(grossSubtotal, Math.max(0, Number(discountValue) || 0));
  }

  const taxableAmount = Math.max(0, grossSubtotal - calculatedDiscount);
  const calculatedTax = taxRate > 0 ? Math.round((taxableAmount * taxRate) / 100) : 0;
  const finalPayable = Math.max(0, taxableAmount + calculatedTax);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        unitPrice: 0
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleItemChange = (id: string, field: 'description' | 'quantity' | 'unitPrice', val: any) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: val } : it))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (calculatedDiscount > 0 && (!discountReason || !discountReason.trim())) {
      addToast('Discount Justification Required', 'Please provide a valid clinic authorization reason for the discount.', 'warning');
      return;
    }

    const finalPatientId = resolvedPatient?.id || targetPatientId;
    if (!finalPatientId) {
      addToast('Error', 'Missing patient record to approve fees.', 'danger');
      return;
    }

    const finalVisitId =
      resolvedVisit?.id ||
      targetVisitId ||
      `vis-${finalPatientId}-${new Date().toISOString().split('T')[0]}`;

    setIsSubmitting(true);
    try {
      const result = await approveFee({
        visitId: finalVisitId,
        patientId: finalPatientId,
        patientName: resolvedPatient?.name || patientName || 'Customer 1',
        patientOpNumber: resolvedPatient?.opNumber || patient?.opNumber || 'OP-2026-00101',
        doctorId: resolvedVisit?.doctorId || patient?.assignedDoctorId || 'staff-1792653030970',
        doctorName: resolvedVisit?.doctorName || defaultDoctorName || patient?.assignedDoctorName || 'Dr. DOCTOR TEST',
        consultationFee: Number(consultationFee) || 0,
        items: items.filter((it) => it.description && it.description.trim()),
        discountType,
        discountValue: Number(discountValue) || 0,
        discountReason: discountReason.trim() || 'None',
        taxRate: Number(taxRate) || 0,
        feeApprovalId: mode === 'edit' ? existingFeeApproval?.id : undefined,
        isNewFee: mode === 'new'
      });

      addToast(
        mode === 'edit' ? 'Fee Updated 💳' : 'New Fee Authorized 💳',
        mode === 'edit'
          ? `Invoice #${result.invoice.id} updated in Billing & Invoices.`
          : `New invoice #${result.invoice.id} generated and sent to Billing & Invoices.`,
        'success'
      );

      if (onFeeApproved) {
        onFeeApproved(result.feeApproval, result.invoice);
      }
      onClose();
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to approve fees.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-200 max-h-[96vh] sm:max-h-[92vh] overflow-y-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Doctor Pricing Authorization
              </span>
              <span className="text-xs text-slate-400 font-bold">
                Doctor: {currentUser.name}
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Approve Treatment Fees & Discounts
            </h3>
            <p className="text-xs text-slate-500">
              Patient: <strong className="text-slate-800">{resolvedPatient?.name || patientName || 'Patient'}</strong> ({resolvedPatient?.opNumber || resolvedPatient?.id || targetPatientId || 'N/A'}) • Token: <strong className="text-sky-800 font-mono">{resolvedVisit?.tokenId || (tokens.find(t => t.patientId === targetPatientId)?.tokenNumber) || 'Active'}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isAlreadyApproved && existingFeeApproval && (
          <div className="space-y-2">
            {mode === 'new' ? (
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-blue-100 text-blue-800 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-blue-700" />
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Previous Fee (₹{Number(existingFeeApproval.finalPayable).toLocaleString()}) has already been sent to Billing &amp; Invoices (#{existingFeeApproval.invoiceId}).
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Add new procedures below to authorize an additional fee for this or next visit.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('edit')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs shrink-0 cursor-pointer shadow-2xs self-start sm:self-auto"
                >
                  Edit Previous Invoice #{existingFeeApproval.invoiceId}
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                  </span>
                  <div>
                    <span className="font-bold text-amber-950 block">
                      Editing Existing Fee &amp; Invoice #{existingFeeApproval.invoiceId}
                    </span>
                    <span className="text-[11px] text-amber-800 font-medium">
                      Changes here will update the existing invoice in Billing &amp; Invoices.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('new')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-xs hover:bg-amber-100 shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  ← Switch to Add New / Next Fee
                </button>
              </div>
            )}
          </div>
        )}

        {!isAlreadyApproved && resolvedPatient?.invoices && resolvedPatient.invoices.some((inv) => inv.status === 'Paid') && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </span>
              <div>
                <span className="font-bold text-emerald-950 block">
                  Previous Treatment Fee is Paid &amp; Settled (₹{resolvedPatient.invoices.filter((i) => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0).toLocaleString()}).
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  Add new procedures below if authorizing additional fees for this visit.
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full shrink-0">
              Paid ✓
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Consultation Fee */}
          <div className="p-3 sm:p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <span className="font-bold text-slate-800 block text-xs">Specialist Doctor Consultation Fee</span>
              <span className="text-[11px] text-slate-500">Oral examination, diagnostics & treatment planning</span>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <button
                type="button"
                onClick={() => setConsultationFee(500)}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 text-[11px] font-bold text-slate-600 hover:text-emerald-800 cursor-pointer shadow-2xs"
                title="Click to set standard ₹500 fee"
              >
                + ₹500 Standard
              </button>
              <div className="w-28">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(Number(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Procedure Items Table */}
          <div className="space-y-2">
            <datalist id="common-dental-procedures">
              <option value="Composite Tooth Filling / Restoration" />
              <option value="Ultrasonic Scaling & Polishing" />
              <option value="Root Canal Treatment (RCT)" />
              <option value="Tooth Extraction / Exodontia" />
              <option value="Dental X-Ray (IOPA / Bitewing)" />
              <option value="Ceramic / Zirconia Crown" />
              <option value="Gingival Curettage / Deep Cleaning" />
              <option value="Orthodontic Consultation & Alignment" />
              <option value="Teeth Whitening / Bleaching" />
              <option value="Fluoride Application / Pit & Fissure Sealant" />
            </datalist>

            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Treatment & Procedure Items ({items.length})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[11px] hover:bg-emerald-100 flex items-center gap-1 border border-emerald-200 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add Procedure</span>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 text-center space-y-1">
                <p className="text-xs font-bold text-slate-600">
                  No procedure items added (Consultation only)
                </p>
                <p className="text-[11px] text-slate-400">
                  If any dental procedure or treatment was performed, click <strong className="text-emerald-700 font-semibold">+ Add Procedure</strong> above to record it.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((item, idx) => (
                  <div key={item.id}>
                    {/* Mobile Card Layout (<640px) */}
                    <div className="sm:hidden p-3 bg-white rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-xs w-4 text-center shrink-0">{idx + 1}.</span>
                        <input
                          type="text"
                          required
                          list="common-dental-procedures"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          placeholder="Procedure description..."
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium text-xs focus:ring-1 focus:ring-emerald-500 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors shrink-0"
                          title="Remove procedure item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-3 pl-6">
                        <div className="w-20">
                          <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Qty</span>
                          <input
                            type="number"
                            min="1"
                            required
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-center font-bold text-xs bg-white"
                          />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Price</span>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="100"
                              required
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                              className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-xs bg-white"
                            />
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Total</span>
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            ₹{(item.quantity * item.unitPrice).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Single Row (>=640px) */}
                    <div className="hidden sm:flex p-2.5 bg-white rounded-xl border border-slate-200 items-center gap-2">
                      <span className="text-slate-400 font-mono text-xs w-4 text-center">{idx + 1}.</span>
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          list="common-dental-procedures"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          placeholder="Type or select procedure name..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium text-xs focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="w-16">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                          placeholder="Qty"
                          title="Quantity"
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-center font-bold text-xs"
                        />
                      </div>
                      <div className="w-24 relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                          placeholder="Price"
                          className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-xs"
                        />
                      </div>
                      <div className="w-20 text-right font-mono font-bold text-slate-900 pr-1">
                        ₹{(item.quantity * item.unitPrice).toLocaleString()}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                        title="Remove procedure item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discounts & Authorizations */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
              Doctor-Authorized Discount & Concession
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Discount Mode</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold"
                >
                  <option value="amount">Fixed Amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Discount Value {discountType === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max={discountType === 'percentage' ? 100 : grossSubtotal}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Calculated Concession</label>
                <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-mono font-black text-emerald-700">
                  - ₹{calculatedDiscount.toLocaleString()}
                </div>
              </div>
            </div>

            {calculatedDiscount > 0 && (
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Authorizing Justification Reason <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  placeholder="e.g. Senior citizen concession approved by Consulting Doctor, Family dental package"
                  className="w-full px-3 py-1.5 rounded-xl border border-emerald-300 bg-white font-medium"
                />
              </div>
            )}
          </div>

          {/* Calculation Ledger Summary */}
          <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Gross Subtotal (Consultation + Procedures):</span>
              <span className="font-mono font-bold">₹{grossSubtotal.toLocaleString()}</span>
            </div>

            {calculatedDiscount > 0 && (
              <div className="flex justify-between text-emerald-800 font-semibold">
                <span>Authorized Discount ({discountReason || 'Pending reason'}):</span>
                <span className="font-mono font-bold">- ₹{calculatedDiscount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-emerald-200 text-sm font-black text-emerald-950">
              <span>Final Approved Amount to Bill:</span>
              <span className="font-mono text-base text-emerald-900">₹{finalPayable.toLocaleString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 sm:py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold cursor-pointer text-center text-xs"
            >
              Cancel
            </button>

            <ClayButton
              variant="mint"
              type="submit"
              disabled={isSubmitting || (calculatedDiscount > 0 && !discountReason.trim())}
              icon={<CheckCircle2 className="w-4 h-4" />}
              className="w-full sm:w-auto justify-center py-2.5 sm:py-2 text-xs"
            >
              {isSubmitting
                ? 'Processing...'
                : mode === 'edit'
                  ? `Update Existing Invoice (₹${finalPayable.toLocaleString()})`
                  : isAlreadyApproved
                    ? `Authorize & Issue Next Fee (₹${finalPayable.toLocaleString()})`
                    : `Authorize & Approve Fee (₹${finalPayable.toLocaleString()})`}
            </ClayButton>
          </div>
        </form>
      </div>
    </div>
  );
};
