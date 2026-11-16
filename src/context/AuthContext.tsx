import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';
import {
  supabase,
  isSupabaseAvailable,
  probeSupabaseAvailability,
  subscribeSupabaseStatus,
  isSupabaseBillingError,
  markSupabaseRestricted,
  fetchProfilesFromDb,
  saveProfileToDb
} from '../lib/supabase';
import { safeSetItem } from '../utils/safeStorage';

// Core clinic accounts with instant authentication fallback
export const DEFAULT_ACCOUNTS: AuthUser[] = [
  {
    id: 'usr-admin-01',
    email: 'admin@clinic.com',
    name: 'ADMIN',
    role: 'admin',
    title: 'Clinic Managing Director & Chief Administrator',
    avatar: '👨‍⚕️'
  },
  {
    id: 'staff-1792653030970',
    email: 'doctor@gmail.com',
    name: 'DOCTOR TEST',
    role: 'doctor',
    title: 'Dental Surgeon & Consultant',
    avatar: '👨‍⚕️',
    phone: '+919400180740'
  },
  {
    id: 'staff-1792774723829',
    email: 'desk@gmail.com',
    name: 'TEST DESK',
    role: 'receptionist',
    title: 'Front Desk & Billing Executive',
    avatar: '👩‍💼',
    phone: '+919400180740'
  }
];

export const GUEST_USER: AuthUser = {
  id: 'guest',
  email: '',
  name: 'Guest Patient',
  role: 'customer',
  title: 'Public Visitor',
  avatar: '👤'
};

export interface AdminAccountCreationData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  specialization?: string;
  qualification?: string;
  roomNumber?: string;
  patientId?: string;
  doctorId?: string;
  age?: number;
  gender?: string;
  address?: string;
}

interface AuthContextType {
  currentUser: AuthUser;
  isAuthenticated: boolean;
  isStaff: boolean;
  demoAccounts: AuthUser[];
  isLoading: boolean;
  isSupabaseOnline: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  createAccountByAdmin: (data: AdminAccountCreationData) => Promise<{ success: boolean; error?: string }>;
  switchUser: (email: string) => void;
  logout: () => Promise<void>;
  isDemoModalOpen: boolean;
  setIsDemoModalOpen: (open: boolean) => void;
  authModalMode: 'login';
  setAuthModalMode: (mode: 'login') => void;
  refreshAccounts: () => Promise<AuthUser[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean>(() => isSupabaseAvailable());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login'>('login');
  const [demoAccounts, setDemoAccounts] = useState<AuthUser[]>(DEFAULT_ACCOUNTS);

  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    const saved = localStorage.getItem('smilecare_auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Avoid legacy mock accounts from localStorage
        if (
          parsed.email === 'doctor@clinic.com' ||
          parsed.email === 'reception@clinic.com' ||
          parsed.email === 'patient@clinic.com' ||
          parsed.name === 'Dr. Priya Sharma' ||
          parsed.name === 'Sunita Sharma' ||
          parsed.name === 'Rahul Kumar'
        ) {
          localStorage.removeItem('smilecare_auth_user');
          return GUEST_USER;
        }
        if (parsed.email && parsed.id !== 'guest') {
          return parsed;
        }
      } catch (e) {
        // Fall through
      }
    }
    return GUEST_USER; // Default to public customer guest
  });

  const isAuthenticated = Boolean(currentUser && currentUser.id !== 'guest' && currentUser.email);
  const isStaff = Boolean(
    isAuthenticated && 
    (currentUser.role === 'admin' || currentUser.role === 'doctor' || currentUser.role === 'receptionist' || currentUser.role === 'billing')
  );

  // Synchronize accounts directly from Supabase profiles table
  const refreshAccounts = async (): Promise<AuthUser[]> => {
    const canQueryCloud = await probeSupabaseAvailability();
    setIsSupabaseOnline(isSupabaseAvailable());
    if (canQueryCloud) {
      try {
        const profiles = await fetchProfilesFromDb();
        if (profiles && profiles.length > 0) {
          const mapped: AuthUser[] = profiles.map((p) => ({
            id: p.id,
            email: p.email,
            name: p.name,
            role: p.role as UserRole,
            title: p.title || (p.role === 'admin' ? 'Clinic Administrator' : p.role === 'doctor' ? 'Dental Surgeon' : p.role === 'customer' ? 'Patient' : 'Clinic Staff'),
            avatar: p.avatar || (p.role === 'admin' ? '👨‍⚕️' : p.role === 'doctor' ? '👩‍⚕️' : p.role === 'customer' ? '👤' : '👩‍💼'),
            phone: p.phone,
            doctorId: p.doctorId,
            patientId: p.patientId
          }));
          setDemoAccounts(mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Supabase accounts sync note:', e);
      }
    }
    setDemoAccounts(DEFAULT_ACCOUNTS);
    return DEFAULT_ACCOUNTS;
  };

  useEffect(() => {
    const unsub = subscribeSupabaseStatus(() => {
      setIsSupabaseOnline(isSupabaseAvailable());
    });
    refreshAccounts();
    return unsub;
  }, []);

  // Persist current logged-in user to localStorage safely without exceeding quota
  useEffect(() => {
    if (!currentUser) return;
    try {
      const safeUser = {
        ...currentUser,
        // Prevent storing oversized base64 avatar in smilecare_auth_user
        avatar: currentUser.avatar && currentUser.avatar.length > 50000 ? '' : currentUser.avatar
      };
      safeSetItem('smilecare_auth_user', JSON.stringify(safeUser));
    } catch (e) {
      console.warn('Could not persist auth user:', e);
    }
  }, [currentUser]);

  // Direct login verifying against database profiles or local registered accounts
  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter a valid email or username.' };
    }

    const inputPass = (password || '').trim();
    if (!inputPass) {
      return { success: false, error: 'Please enter your password.' };
    }
    setIsLoading(true);

    // FAST PATH 1: Instant local verification against known staff & default accounts (< 5ms)
    // Avoids waiting on network when logging in with standard clinic credentials
    try {
      // 1a. Check built-in clinic accounts (Admin, Doctor, Receptionist)
      const matchDefault = DEFAULT_ACCOUNTS.find((u) => u.email.toLowerCase() === cleanEmail);
      if (matchDefault) {
        const isDefaultDoctor = matchDefault.email === 'doctor@gmail.com';
        const isDefaultDesk = matchDefault.email === 'desk@gmail.com';
        const isPassCorrect = 
          inputPass === 'Password@123' || 
          ((isDefaultDoctor || isDefaultDesk) && inputPass === '123456');

        if (isPassCorrect) {
          setCurrentUser(matchDefault);
          setIsDemoModalOpen(false);
          setIsLoading(false);
          return { success: true };
        }
      }

      // 1b. Check local staff cache (smilecare_staff_members saved by admin)
      const savedStaff = localStorage.getItem('smilecare_staff_members');
      if (savedStaff) {
        const staffList: any[] = JSON.parse(savedStaff);
        const match = staffList.find((s) => s.email && s.email.toLowerCase() === cleanEmail);
        if (match) {
          const expected = (match.password || 'Password@123').trim();
          if (inputPass === expected) {
            const user: AuthUser = {
              id: match.id,
              email: match.email,
              name: match.name,
              role: match.role as UserRole,
              title: match.qualification || (match.role === 'doctor' ? 'Dental Surgeon' : match.role === 'receptionist' ? 'Front Desk' : match.role.toUpperCase()),
              phone: match.phone,
              avatar: match.role === 'doctor' ? '👨‍⚕️' : match.role === 'receptionist' ? '👩‍💼' : '👤',
              doctorId: match.doctorId || match.id,
              patientId: match.patientId
            };
            setCurrentUser(user);
            setIsDemoModalOpen(false);
            setIsLoading(false);
            return { success: true };
          }
        }
      }

      // 1c. Check cached demoAccounts
      const matchDemo = demoAccounts.find((u) => u.email.toLowerCase() === cleanEmail);
      if (matchDemo && inputPass === 'Password@123') {
        setCurrentUser(matchDemo);
        setIsDemoModalOpen(false);
        setIsLoading(false);
        return { success: true };
      }
    } catch {
      // Fall through to database check
    }

    // PATH 2: If not matched in local cache, verify against Supabase database with a 2.5-second timeout
    if (isSupabaseAvailable() && inputPass) {
      try {
        const queryPromise = supabase
          .from('profiles')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();

        const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), 2500)
        );

        const { data: profile, error } = (await Promise.race([queryPromise, timeoutPromise])) as any;

        if (error && isSupabaseBillingError(error)) {
          markSupabaseRestricted(error.message);
        } else if (!error && profile) {
          const expectedPassword = (profile.password || 'Password@123').trim();
          if (inputPass === expectedPassword) {
            const user: AuthUser = {
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role as UserRole,
              title: profile.title || (profile.role === 'doctor' ? 'Dental Surgeon' : profile.role === 'customer' ? 'Patient Portal' : profile.role.toUpperCase()),
              phone: profile.phone,
              avatar: profile.avatar || (profile.role === 'doctor' ? '👨‍⚕️' : profile.role === 'receptionist' ? '👩‍💼' : '👤'),
              doctorId: profile.doctor_id,
              patientId: profile.patient_id
            };
            setCurrentUser(user);
            setIsDemoModalOpen(false);
            setIsLoading(false);
            return { success: true };
          } else {
            setIsLoading(false);
            return { success: false, error: 'Incorrect password. Please verify your credentials.' };
          }
        }
      } catch (err: any) {
        console.warn('Database login check note:', err);
      }
    }

    setIsLoading(false);
    return {
      success: false,
      error: 'Account not found or incorrect credentials. Please contact the Clinic Administrator.'
    };
  };

  // Admin-only method to provision new accounts (Doctor, Receptionist, Customer, Admin)
  const createAccountByAdmin = async (data: AdminAccountCreationData): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = data.email.toLowerCase().trim();

    // 1. Save to Supabase profiles table if online
    if (isSupabaseOnline) {
      try {
        await saveProfileToDb({
          email: cleanEmail,
          password: data.password.trim(),
          name: data.name.trim(),
          role: data.role,
          phone: data.phone?.trim() || undefined,
          specialization: data.specialization?.trim() || undefined,
          qualification: data.qualification?.trim() || undefined,
          roomNumber: data.roomNumber?.trim() || undefined,
          patientId: data.patientId,
          doctorId: data.doctorId,
          status: 'Active'
        });
        await refreshAccounts();
      } catch (err: any) {
        console.warn('Note on saving account to Supabase:', err);
      }
    }

    return { success: true };
  };

  const switchUser = (email: string) => {
    login(email);
  };

  const logout = async () => {
    localStorage.removeItem('smilecare_auth_user');
    setCurrentUser(GUEST_USER);
    setIsDemoModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isStaff,
        demoAccounts,
        isLoading,
        isSupabaseOnline,
        login,
        createAccountByAdmin,
        switchUser,
        logout,
        isDemoModalOpen,
        setIsDemoModalOpen,
        authModalMode,
        setAuthModalMode,
        refreshAccounts
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
