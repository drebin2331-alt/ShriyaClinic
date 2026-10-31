import React from 'react';
import { PrescriptionRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Printer, Download, Stethoscope } from 'lucide-react';
import { ClinicPrescriptionSheet, ClinicPrescriptionData, printPrescriptionElement } from './ClinicPrescriptionSheet';

interface PrintablePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription?: PrescriptionRecord | null;
}

export const PrintablePrescriptionModal: React.FC<PrintablePrescriptionModalProps> = ({
  isOpen,
  onClose,
  prescription
}) => {
  const { patients, addToast } = useApp();

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

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-transform active:scale-95"
              title="Print on paper or physical letterhead"
            >
              <Printer className="w-4 h-4" />
              <span>Print Prescription 🖨️</span>
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
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

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
