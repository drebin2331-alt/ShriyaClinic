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

// Core clinic administrator account
export const DEFAULT_ACCOUNTS: AuthUser[] = [
  {
    id: 'usr-admin-01',
    email: 'admin@clinic.com',
    name: 'ADMIN',
    role: 'admin',
    title: 'Clinic Managing Director & Chief Administrator',
    avatar: '👨‍⚕️'
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
        // Avoid legacy mock or deleted accounts from localStorage
        if (
          parsed.email === 'doctor@gmail.com' ||
          parsed.email === 'desk@gmail.com' ||
          parsed.email === 'doctor@clinic.com' ||
          parsed.email === 'reception@clinic.com' ||
          parsed.name === 'DOCTOR TEST' ||
          parsed.name === 'TEST DESK' ||
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

  // Validate active session against live Supabase database
  useEffect(() => {
    const validateSessionWithDatabase = async () => {
      if (!currentUser || currentUser.id === 'guest' || !currentUser.email) return;
      if (currentUser.email === 'admin@clinic.com') return; // Master administrator

      if (isSupabaseAvailable()) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, email, status')
            .ilike('email', currentUser.email)
            .maybeSingle();

          if (!profile) {
            console.warn(`User ${currentUser.email} has been deleted from clinic database. Logging out.`);
            localStorage.removeItem('smilecare_auth_user');
            setCurrentUser(GUEST_USER);
          }
        } catch (e) {
          console.warn('Session database validation check error:', e);
        }
      }
    };

    validateSessionWithDatabase();
  }, [currentUser?.email]);

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

  // Direct login verifying strictly against Supabase database profiles
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

    const lookupKey = cleanEmail === 'admin' ? 'admin@clinic.com' : cleanEmail;

    // PRIMARY: Authenticate directly against Supabase database profiles table
    if (isSupabaseAvailable() && inputPass) {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`email.ilike.${lookupKey},phone.eq.${cleanEmail}`)
          .limit(1);

        const profile = profiles && profiles.length > 0 ? profiles[0] : null;

        if (error && isSupabaseBillingError(error)) {
          markSupabaseRestricted(error.message);
        } else if (profile) {
          const expectedPassword = (profile.password || 'Password@123').trim();
          if (inputPass === expectedPassword) {
            const user: AuthUser = {
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role as UserRole,
              title: profile.title || (profile.role === 'admin' ? 'Clinic Administrator' : profile.role === 'doctor' ? 'Dental Surgeon' : profile.role === 'customer' ? 'Patient Portal' : profile.role.toUpperCase()),
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
        } else {
          // Profile NOT found in database: REJECT LOGIN!
          setIsLoading(false);
          return {
            success: false,
            error: 'User account not found in database. Please contact your Clinic Administrator.'
          };
        }
      } catch (err: any) {
        console.warn('Database login check note:', err);
      }
    }

    // EMERGENCY RECOVERY ONLY: If database is completely unreachable and trying to login as admin
    if ((cleanEmail === 'admin@clinic.com' || cleanEmail === 'admin') && inputPass === 'Password@123') {
      const adminUser: AuthUser = {
        id: 'usr-admin-01',
        email: 'admin@clinic.com',
        name: 'ADMIN',
        role: 'admin',
        title: 'Clinic Managing Director & Chief Administrator',
        avatar: '👨‍⚕️'
      };
      setCurrentUser(adminUser);
      setIsDemoModalOpen(false);
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return {
      success: false,
      error: 'Account not found in clinic database or invalid credentials.'
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
