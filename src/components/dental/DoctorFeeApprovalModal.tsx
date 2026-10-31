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

  const [consultationFee, setConsultationFee] = useState<number>(500);
  const [items, setItems] = useState<Array<{ id: string; description: string; quantity: number; unitPrice: number }>>(() => {
    if (resolvedPatient?.treatmentPlans && resolvedPatient.treatmentPlans.length > 0) {
      return resolvedPatient.treatmentPlans.map((tp, idx) => ({
        id: `tp-item-${idx}`,
        description: tp.procedure,
        quantity: 1,
        unitPrice: tp.estimatedCost || 2000
      }));
    }
    return [
      { id: 'item-1', description: 'Dental Procedure & Treatment Service', quantity: 1, unitPrice: 2000 }
    ];
  });

  useEffect(() => {
    if (resolvedPatient?.treatmentPlans && resolvedPatient.treatmentPlans.length > 0) {
      setItems(resolvedPatient.treatmentPlans.map((tp, idx) => ({
        id: `tp-item-${idx}`,
        description: tp.procedure,
        quantity: 1,
        unitPrice: tp.estimatedCost || 2000
      })));
    }
  }, [resolvedPatient?.id]);

  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        description: 'Composite Filling / Restoration',
        quantity: 1,
        unitPrice: 1500
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
        items,
        discountType,
        discountValue: Number(discountValue) || 0,
        discountReason: discountReason.trim() || 'None',
        taxRate: Number(taxRate) || 0
      });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto space-y-4">
        
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Consultation Fee */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-slate-800 block text-xs">Specialist Doctor Consultation Fee</span>
              <span className="text-[11px] text-slate-500">Oral examination, diagnostics & treatment planning</span>
            </div>
            <div className="w-32">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Procedure Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Treatment & Procedure Items ({items.length})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[11px] hover:bg-emerald-100 flex items-center gap-1 border border-emerald-200 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Procedure</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      placeholder="Procedure name (e.g. Ultrasonic Scaling, RCT Tooth 36)"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium text-xs"
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
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
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
                  placeholder="e.g. Senior citizen concession approved by Dr. Priya Sharma, Family dental package"
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
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold cursor-pointer"
            >
              Cancel
            </button>

            <ClayButton
              variant="mint"
              type="submit"
              disabled={isSubmitting || (calculatedDiscount > 0 && !discountReason.trim())}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              {isSubmitting ? 'Approving...' : `Authorize & Approve Fee (₹${finalPayable.toLocaleString()})`}
            </ClayButton>
          </div>
        </form>
      </div>
    </div>
  );
};
