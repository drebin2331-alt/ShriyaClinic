import { UserRole } from '../types';

export const canViewPatientRecords = (role: UserRole): boolean => {
  return ['doctor', 'admin', 'receptionist', 'dental_assistant', 'billing'].includes(role);
};

export const canRegisterPatient = (role: UserRole): boolean => {
  return ['receptionist', 'admin'].includes(role);
};

export const canPerformCheckIn = (role: UserRole): boolean => {
  return ['receptionist', 'admin', 'doctor'].includes(role);
};

export const canManageQueue = (role: UserRole): boolean => {
  return ['receptionist', 'doctor', 'admin', 'billing'].includes(role);
};

export const canCallToken = (role: UserRole): boolean => {
  return ['receptionist', 'doctor', 'admin'].includes(role);
};

export const canStartConsultation = (role: UserRole): boolean => {
  return ['doctor', 'admin'].includes(role);
};

export const canEditClinicalNotes = (role: UserRole): boolean => {
  return ['doctor', 'admin'].includes(role);
};

export const canEditDentalChart = (role: UserRole): boolean => {
  return ['doctor', 'admin'].includes(role);
};

export const canCreatePrescription = (role: UserRole): boolean => {
  return ['doctor', 'admin'].includes(role);
};

export const canApproveFees = (role: UserRole): boolean => {
  return ['doctor', 'admin'].includes(role);
};

export const canCompleteConsultation = (role: UserRole): boolean => {
  return ['doctor', 'admin'].includes(role);
};

export const canCollectPayment = (role: UserRole): boolean => {
  return ['receptionist', 'billing', 'admin'].includes(role);
};

export const canPrintReceipt = (role: UserRole): boolean => {
  return ['receptionist', 'billing', 'admin', 'doctor', 'customer'].includes(role);
};

export const canPrintPrescription = (role: UserRole): boolean => {
  return ['doctor', 'admin', 'receptionist', 'customer'].includes(role);
};

export const canCloseVisit = (role: UserRole): boolean => {
  return ['receptionist', 'billing', 'admin'].includes(role);
};

export const canManageStaff = (role: UserRole): boolean => {
  return ['admin'].includes(role);
};

export const canAccessAdminReports = (role: UserRole): boolean => {
  return ['doctor', 'admin'].includes(role);
};

export const canManageInventory = (role: UserRole): boolean => {
  return ['doctor', 'admin', 'receptionist', 'dental_assistant'].includes(role);
};

export const canViewDoctorNotes = (role: UserRole): boolean => {
  return ['doctor', 'admin'].includes(role);
};
