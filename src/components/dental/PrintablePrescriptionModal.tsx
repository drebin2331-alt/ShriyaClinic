import React, { useState } from 'react';
import { PrescriptionRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Printer, Download, Stethoscope, Edit3, Trash2, AlertTriangle } from 'lucide-react';
import { ClinicPrescriptionSheet, ClinicPrescriptionData, printPrescriptionElement } from './ClinicPrescriptionSheet';

interface PrintablePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription?: PrescriptionRecord | null;
  onEdit?: (prescription: PrescriptionRecord) => void;
  onDelete?: (prescriptionId: string) => void;
}

export const PrintablePrescriptionModal: React.FC<PrintablePrescriptionModalProps> = ({
  isOpen,
  onClose,
  prescription,
  onEdit,
  onDelete
}) => {
  const { patients, addToast } = useApp();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !prescription) return null;

  const matchedPatient = patients.find(
    (p) => p.id === prescription.patientId || p.opNumber === prescription.patientOpNumber || p.name === prescription.patientName
  );

  const sheetData: ClinicPrescriptionData = {
    id: prescription.id,
    date: prescription.date,
    patientName: prescription.patientName,
    patientOpNumber: prescription.patientOpNumber || matchedPatient?.opNumber || matchedPatient?.id,
    patientAge: prescription.patientAge || matchedPatient?.age,
    patientGender: prescription.patientGender || matchedPatient?.gender,
    patientPhone: matchedPatient?.phone,
    doctorName: prescription.doctorName || 'Dr. EBIN BRITTO. M.',
    doctorDegree: 'BDS',
    doctorRegNo: '26719/KDC',
    diagnosis: prescription.diagnosis,
    medicalHistoryConditions: matchedPatient?.medicalHistory?.conditions || [],
    medicalHistoryNotes: matchedPatient?.medicalHistory?.otherNotes,
    allergies: matchedPatient?.medicalHistory?.allergies || matchedPatient?.allergies || [],
    currentMedications: matchedPatient?.medicalHistory?.currentMedications || [],
    items: prescription.items || [],
    doctorNotes: prescription.doctorNotes,
    followUpDate: prescription.followUpDate
  };

  const handlePrint = () => {
    printPrescriptionElement('printable-prescription-dialog-sheet', sheetData.patientName, sheetData.patientOpNumber);
    addToast('Print Dialog Ready', 'Printing prescription with official clinic header.', 'info');
  };

  const handleDownloadPdf = () => {
    printPrescriptionElement('printable-prescription-dialog-sheet', sheetData.patientName, sheetData.patientOpNumber);
    addToast('PDF Ready 📥', 'Select "Save as PDF" in the print destination to download.', 'success');
  };

  const handleDelete = () => {
    if (onDelete && prescription) {
      onDelete(prescription.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[96vh] overflow-y-auto space-y-4">
        
        {/* Top Action Bar (Hidden in print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-blue-50 text-blue-900 rounded-xl border border-blue-200 shrink-0">
              <Stethoscope className="w-5 h-5 text-blue-900" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Official Clinic Pad
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Rx #{prescription.id}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Shriya Multispeciality Dental Clinic — Prescription
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {onEdit && (
              <button
                onClick={() => onEdit(prescription)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300 transition-colors"
                title="Edit this prescription"
              >
                <Edit3 className="w-4 h-4 text-slate-600" />
                <span>Edit Rx ✏️</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Delete this prescription"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-transform active:scale-95"
              title="Print on paper or physical letterhead"
            >
              <Printer className="w-4 h-4" />
              <span>Print 🖨️</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-transform active:scale-95"
              title="Download as PDF file"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF 📥</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Box */}
        {showDeleteConfirm && (
          <div className="p-4 bg-rose-50 border-2 border-rose-400 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-black text-rose-950 text-sm">
                  Delete Prescription #{prescription.id}?
                </h4>
                <p className="text-xs text-rose-800 font-medium mt-0.5">
                  Are you sure you want to delete this prescription? This will remove it from the patient chart and visit records.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-200">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        )}

        {/* EXACT CLINIC LETTERHEAD PRESCRIPTION SHEET */}
        <div className="bg-slate-50 p-2 sm:p-4 rounded-2xl border border-slate-200 overflow-x-auto">
          <ClinicPrescriptionSheet 
            data={sheetData} 
            id="printable-prescription-dialog-sheet" 
          />
        </div>
      </div>
    </div>
  );
};
