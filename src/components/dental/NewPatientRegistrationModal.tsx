import { ModalLayer } from '../common/ModalLayer';
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PatientRecord, Doctor } from '../../types';
import { ClayButton } from '../common/ClayButton';
import { 
  X, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export interface InitialPatientData {
  name?: string;
  phone?: string;
  email?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  currentComplaint?: string;
  assignedDoctorId?: string;
  assignedDoctorName?: string;
}

interface NewPatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterPatient?: (patient: PatientRecord) => void;
  initialData?: InitialPatientData | null;
  existingPatientCount?: number;
}

export const NewPatientRegistrationModal: React.FC<NewPatientRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegisterPatient,
  initialData = null,
  existingPatientCount
}) => {
  const { patients, doctors, registerNewPatient, checkInPatient, setSelectedPatientForDetail, setActiveView, setShouldOpenCaseSheetOnProfile, addToast } = useApp();
  const { currentUser } = useAuth();

  const [submitting, setSubmitting] = useState(false);

  // Fallback doctors list ensuring there is always at least one valid doctor
  const availableDoctors: Doctor[] = useMemo(() => {
    if (doctors && doctors.length > 0) {
      return doctors;
    }
    if (currentUser && (currentUser.role === 'doctor' || currentUser.role === 'admin')) {
      const docName = currentUser.name.startsWith('Dr.') ? currentUser.name : `Dr. ${currentUser.name}`;
      return [{
        id: currentUser.doctorId || currentUser.id || 'doc-1',
        name: docName,
        title: currentUser.title || 'Dental Surgeon',
        qualification: 'BDS, MDS',
        specialization: currentUser.title || 'General Dentistry',
        experience: '5+ Years',
        rating: 5.0,
        reviewsCount: 0,
        avatar: currentUser.avatar || '',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
        bio: `${docName} — Consulting Dental Surgeon`,
        roomNumber: 'Cabin 1'
      }];
    }
    return [{
      id: 'doc-1',
      name: 'Duty Dental Surgeon',
      title: 'Consulting Dental Surgeon',
      qualification: 'BDS',
      specialization: 'General Dentistry',
      experience: '5+ Years',
      rating: 5.0,
      reviewsCount: 0,
      avatar: '',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
      bio: 'Duty Dental Surgeon',
      roomNumber: 'Cabin 1'
    }];
  }, [doctors, currentUser]);

  // Identity & Demographics (Front Desk Personal Details Only)
  const [name, setName] = useState(initialData?.name || '');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<number | string>(initialData?.age || 30);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(initialData?.gender || 'Male');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [email, setEmail] = useState(initialData?.email || '');
  const [address, setAddress] = useState('');
  const [referralSource, setReferralSource] = useState('');

  const initialDoctorId = initialData?.assignedDoctorId ||
    (currentUser?.role === 'doctor' ? (currentUser.doctorId || currentUser.id) : undefined) ||
    availableDoctors[0]?.id ||
    'doc-1';
  const [assignedDoctorId, setAssignedDoctorId] = useState(initialDoctorId);
  const [initialReason, setInitialReason] = useState(initialData?.currentComplaint || 'New Patient Examination & Consultation');

  // Emergency contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Family');

  // Duplicate warning override
  const [ignoreDuplicateWarning, setIgnoreDuplicateWarning] = useState(false);

  // Success dialog state showing generated OP Number & Queue Token
  const [registeredResult, setRegisteredResult] = useState<{ 
    patient: PatientRecord; 
    opNumber: string; 
    tokenNumber?: string;
    doctorName?: string;
    isSentToDoctor?: boolean;
  } | null>(null);

  useEffect(() => {
    if (initialData) {
      if (initialData.name) setName(initialData.name);
      if (initialData.phone) setPhone(initialData.phone);
      if (initialData.email) setEmail(initialData.email);
      if (initialData.age) setAge(initialData.age);
      if (initialData.gender) setGender(initialData.gender);
      if (initialData.currentComplaint) setInitialReason(initialData.currentComplaint);
      if (initialData.assignedDoctorId) setAssignedDoctorId(initialData.assignedDoctorId);
    } else if (currentUser?.role === 'doctor') {
      setAssignedDoctorId(currentUser.doctorId || currentUser.id || availableDoctors[0]?.id || 'doc-1');
    } else if (availableDoctors.length > 0 && !assignedDoctorId) {
      setAssignedDoctorId(availableDoctors[0].id);
    }
  }, [initialData, currentUser, availableDoctors]);

  // Sync Age and DOB
  const handleDobChange = (newDob: string) => {
    setDob(newDob);
    if (newDob) {
      const birthYear = new Date(newDob).getFullYear();
      const currentYear = new Date().getFullYear();
      if (!isNaN(birthYear) && birthYear <= currentYear) {
        setAge(currentYear - birthYear);
      }
    }
  };

  const handleAgeChange = (newAge: number) => {
    setAge(newAge);
    if (newAge > 0 && newAge < 120) {
      const estimatedYear = new Date().getFullYear() - newAge;
      setDob(`${estimatedYear}-01-01`);
    }
  };

  // Live duplicate detection
  const potentialDuplicate = useMemo(() => {
    if (!phone.trim()) return null;
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 7) return null;

    return patients.find((p) => {
      const pClean = p.phone.replace(/\D/g, '');
      return pClean === clean || (pClean.length >= 10 && clean.length >= 10 && (pClean.endsWith(clean) || clean.endsWith(pClean)));
    });
  }, [phone, patients]);

  if (!isOpen) return null;

  const handleSelectExistingPatient = (existing: PatientRecord) => {
    setSelectedPatientForDetail(existing);
    setActiveView('patient-detail');
    onClose();
    addToast('Existing Record Selected', `Loaded existing patient profile for ${existing.name} (${existing.opNumber || existing.id}).`, 'info');
  };

  // Unified Registration Handler (Personal details only)
  const handleRegister = async (autoCheckInAndQueue: boolean = true) => {
    if (!name.trim()) {
      addToast('Validation Error', 'Patient full legal name is required.', 'danger');
      return;
    }

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 8) {
      addToast('Validation Error', 'A valid primary phone number (at least 8-10 digits) is required.', 'danger');
      return;
    }

    if (potentialDuplicate && !ignoreDuplicateWarning) {
      addToast('Duplicate Phone Detected', 'Please review the existing patient record or confirm as distinct patient.', 'warning');
      return;
    }

    setSubmitting(true);

    try {
      const selectedDoctor = availableDoctors.find((d) => d.id === assignedDoctorId) || availableDoctors[0] || {
        id: assignedDoctorId || 'doc-1',
        name: currentUser?.role === 'doctor' ? (currentUser.name.startsWith('Dr.') ? currentUser.name : `Dr. ${currentUser.name}`) : 'Duty Dental Surgeon',
        specialization: 'General Dentistry'
      };

      const doctorIdToUse = selectedDoctor.id || 'doc-1';
      const doctorNameToUse = selectedDoctor.name || 'Duty Dental Surgeon';

      // Front desk registration (personal info & OP generation)
      const result = await registerNewPatient({
        name: name.trim(),
        phone: cleanPhone,
        secondaryPhone: secondaryPhone.trim() || undefined,
        email: email.trim() || undefined,
        gender,
        dateOfBirth: dob || undefined,
        age: Number(age) || 30,
        address: address.trim() || undefined,
        referralSource: referralSource.trim() || undefined,
        emergencyContact: emergencyName.trim() ? {
          name: emergencyName.trim(),
          phone: emergencyPhone.trim(),
          relation: emergencyRelation.trim()
        } : undefined,
        assignedDoctorId: doctorIdToUse,
        assignedDoctorName: doctorNameToUse,
        reasonForVisit: initialReason.trim() || 'New Patient Examination',
        allowDuplicate: ignoreDuplicateWarning
      });

      // Automatically issue Queue Token and place in Doctor's queue
      let tokenNumber = '';
      if (autoCheckInAndQueue) {
        try {
          const checkInRes = await checkInPatient({
            patientId: result.patient.id,
            doctorId: doctorIdToUse,
            reasonForVisit: initialReason.trim() || 'New Patient Examination',
            isWalkIn: true
          });
          tokenNumber = checkInRes.token.tokenNumber;
        } catch (checkInErr) {
          console.warn('Auto check-in error:', checkInErr);
        }
      }

      if (onRegisterPatient) {
        onRegisterPatient(result.patient);
      }

      setRegisteredResult({
        patient: result.patient,
        opNumber: result.opNumber,
        tokenNumber: tokenNumber || (autoCheckInAndQueue ? 'Assigned in Queue' : undefined),
        doctorName: doctorNameToUse,
        isSentToDoctor: autoCheckInAndQueue
      });

      if (autoCheckInAndQueue) {
        addToast(
          'Patient Sent to Doctor! 🎟️',
          `${name.trim()} queued with ${doctorNameToUse}. Queue Token: ${tokenNumber || 'Active'}. Detailed clinical intake will be conducted inside the Doctor cabin.`,
          'success'
        );
      } else {
        addToast(
          'Patient Registered! 🎉',
          `${name.trim()} registered with OP: ${result.opNumber}.`,
          'success'
        );
      }
    } catch (err: any) {
      addToast('Registration Error', err.message || 'Could not register patient.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishAndOpenProfile = (openIntakeSheet = false) => {
    if (registeredResult) {
      setSelectedPatientForDetail(registeredResult.patient);
      if (openIntakeSheet) {
        setShouldOpenCaseSheetOnProfile(true);
      }
      setActiveView('patient-detail');
    }
    onClose();
  };

  return (
    <ModalLayer onDismiss={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="clay-card w-full max-w-2xl my-6 bg-white rounded-3xl p-6 shadow-2xl border border-white max-h-[92vh] overflow-y-auto">
        
        {/* SUCCESS DIALOG WHEN REGISTERED */}
        {registeredResult ? (
          <div className="py-8 px-4 text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {registeredResult.isSentToDoctor ? 'Patient Registered & Sent to Doctor Queue 🎟️' : 'Patient Registered Successfully 🎉'}
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                {registeredResult.patient.name}
              </h2>
              <div className="text-xs text-slate-500 mt-1">
                Primary Phone: <strong className="text-slate-800">{registeredResult.patient.phone}</strong> • Gender: <strong className="text-slate-800">{registeredResult.patient.gender}</strong> • Age: <strong className="text-slate-800">{registeredResult.patient.age} yrs</strong>
              </div>
            </div>

            {/* OP Number Card */}
            <div className={`grid ${registeredResult.tokenNumber ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3 max-w-md mx-auto text-left`}>
              <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-300 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 block">
                  Official OP Number
                </span>
                <div className="text-2xl font-black font-mono text-sky-950 mt-1">
                  {registeredResult.opNumber}
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Master outpatient ledger ID
                </span>
              </div>

              {registeredResult.tokenNumber && (
                <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                    Queue Token Issued
                  </span>
                  <div className="text-2xl font-black font-mono text-emerald-950 mt-1">
                    {registeredResult.tokenNumber}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-1 truncate">
                    Doctor: {registeredResult.doctorName || 'Assigned Cabin'}
                  </span>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-amber-50/90 rounded-2xl border border-amber-200 text-xs text-amber-900 text-left max-w-md mx-auto">
              <div className="flex items-start gap-2">
                <span className="text-base shrink-0">🌟</span>
                <p className="leading-snug">
                  <strong>First Visit Intake Required:</strong> Please complete the Clinical Intake & History Case Sheet (Chief Complaint, HOPI, Medical & Dental History, Drug Allergies) before treatment begins.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <ClayButton
                variant="primary"
                size="md"
                onClick={() => handleFinishAndOpenProfile(true)}
                icon={<Sparkles className="w-4 h-4 text-amber-200" />}
              >
                Open & Fill First Visit Intake Form 📋
              </ClayButton>

              <ClayButton
                variant="secondary"
                size="md"
                onClick={() => handleFinishAndOpenProfile(false)}
                icon={<ArrowRight className="w-4 h-4 text-slate-700" />}
              >
                View EMR
              </ClayButton>

              <ClayButton
                variant="ghost"
                size="md"
                onClick={onClose}
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-700" />}
              >
                Done
              </ClayButton>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  New Outpatient Registration
                </h3>
              </div>
              <button aria-label="Close dialog"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DUPLICATE WARNING BANNER */}
            {potentialDuplicate && (
              <div className="my-3 p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2 text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Possible Existing Patient Match!</strong>
                    <div className="text-slate-700 mt-0.5">
                      <strong>{potentialDuplicate.name}</strong> ({potentialDuplicate.opNumber || potentialDuplicate.id}) is already registered with phone {potentialDuplicate.phone}.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleSelectExistingPatient(potentialDuplicate)}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs cursor-pointer shadow-2xs"
                  >
                    Select & Check In
                  </button>
                  <button
                    type="button"
                    onClick={() => setIgnoreDuplicateWarning(true)}
                    className="px-2 py-1.5 text-slate-600 hover:text-slate-900 font-semibold text-xs cursor-pointer hover:underline"
                  >
                    Distinct Patient
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleRegister(false); }}>
              {/* PATIENT PERSONAL & CONTACT DETAILS */}
              <div className="space-y-3.5 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Patient Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Anand Mahindra"
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Primary Mobile Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Secondary Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={secondaryPhone}
                      onChange={(e) => setSecondaryPhone(e.target.value)}
                      placeholder="+91 80 2345 6789"
                      className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Gender <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-300"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => handleDobChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Age (Years) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="125"
                      value={age}
                      onChange={(e) => handleAgeChange(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Leave blank if patient does not use email"
                      className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Referral Source / Referred By (Optional)
                    </label>
                    <input
                      type="text"
                      value={referralSource}
                      onChange={(e) => setReferralSource(e.target.value)}
                      placeholder="e.g. Google Maps, Dr. Sen, Friend"
                      className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Assigned Consulting Doctor <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={assignedDoctorId}
                      onChange={(e) => setAssignedDoctorId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-300"
                    >
                      {availableDoctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} — {d.specialization}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Initial Reason for Visit <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={initialReason}
                      onChange={(e) => setInitialReason(e.target.value)}
                      placeholder="e.g. Toothache, routine dental check-up, cleaning"
                      className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Residential Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Door / Apartment, Street, Locality, City"
                    className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 border border-slate-300"
                  />
                </div>

                {/* Emergency Contact */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold uppercase text-slate-500 block mb-1.5">
                    Emergency Contact Person (Optional)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-xs bg-white border border-slate-300 font-medium"
                    />
                    <input
                      type="tel"
                      placeholder="Emergency Phone"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-xs bg-white border border-slate-300 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Relation (e.g. Spouse, Parent)"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-xs bg-white border border-slate-300 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation & Submission Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <ClayButton
                    variant="primary"
                    type="submit"
                    disabled={submitting}
                    icon={<User className="w-4 h-4" />}
                  >
                    {submitting ? 'Registering Patient...' : 'Register Patient'}
                  </ClayButton>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </ModalLayer>
  );
};
