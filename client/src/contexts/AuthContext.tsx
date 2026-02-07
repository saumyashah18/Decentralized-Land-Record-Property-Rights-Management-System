import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    signOut,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult
} from 'firebase/auth';
import { auth } from '../config/firebase';

// Registrar session info from OIDC
export interface RegistrarSession {
    sessionToken: string;
    claims: {
        sub: string;
        name: string;
        email?: string;
        department?: string;
        designation: string;
        jurisdiction: string;
    };
    walletAddress?: string;
}

interface AuthContextType {
    // Citizen auth (phone)
    user: User | null;
    loading: boolean;
    signInWithPhone: (phoneNumber: string, recaptchaContainerId: string) => Promise<ConfirmationResult>;
    verifyOtp: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>;

    // Registrar auth (OIDC)
    registrarSession: RegistrarSession | null;
    setRegistrarSession: (session: RegistrarSession | null) => void;

    // Common
    logout: () => Promise<void>;
    userRole: 'citizen' | 'registrar' | null;
    isRegistrar: boolean;
    loginAsDemoCitizen: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<'citizen' | 'registrar' | null>(() => {
        return localStorage.getItem('userRole') as 'citizen' | 'registrar' | null;
    });
    const [registrarSession, setRegistrarSessionState] = useState<RegistrarSession | null>(() => {
        const stored = localStorage.getItem('registrarSession');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // If registrar session exists, set role to registrar
    useEffect(() => {
        if (registrarSession) {
            setUserRole('registrar');
            localStorage.setItem('userRole', 'registrar');
        }
    }, [registrarSession]);

    const setupRecaptcha = (containerId: string) => {
        if ((window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier.clear();
        }
        return new RecaptchaVerifier(auth, containerId, {
            size: 'invisible',
            callback: () => {
                console.log('Recaptcha resolved');
            }
        });
    };

    // Citizen phone auth
    const signInWithPhone = async (phoneNumber: string, recaptchaContainerId: string): Promise<ConfirmationResult> => {
        try {
            const verifier = setupRecaptcha(recaptchaContainerId);
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
            return confirmation;
        } catch (error) {
            console.error("Error sending OTP", error);
            throw error;
        }
    };

    // Citizen OTP verification - always sets role to 'citizen'
    const verifyOtp = async (confirmationResult: ConfirmationResult, otp: string) => {
        try {
            await confirmationResult.confirm(otp);
            setUserRole('citizen');
            localStorage.setItem('userRole', 'citizen');
        } catch (error) {
            console.error("Error verifying OTP", error);
            throw error;
        }
    };

    // Set registrar session (called after OIDC callback)
    const setRegistrarSession = (session: RegistrarSession | null) => {
        setRegistrarSessionState(session);
        if (session) {
            localStorage.setItem('registrarSession', JSON.stringify(session));
            localStorage.setItem('registrarSessionToken', session.sessionToken);
            setUserRole('registrar');
            localStorage.setItem('userRole', 'registrar');
        } else {
            localStorage.removeItem('registrarSession');
            localStorage.removeItem('registrarSessionToken');
        }
    };

    const logout = async () => {
        try {
            // Logout from Firebase (for citizens)
            if (user) {
                await signOut(auth);
            }

            // Clear registrar session
            setRegistrarSession(null);

            // Clear role
            setUserRole(null);
            localStorage.removeItem('userRole');
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    const loginAsDemoCitizen = async () => {
        // Mock Firebase User
        const mockUser: any = {
            uid: 'demo-citizen-123',
            phoneNumber: '+919876543210',
            email: 'demo@citizen.in',
            displayName: 'Demo Citizen',
            emailVerified: true,
            isAnonymous: false,
            metadata: {},
            providerData: [],
            refreshToken: '',
            tenantId: '',
            delete: async () => { },
            getIdToken: async () => 'mock-token',
            getIdTokenResult: async () => ({
                authTime: new Date().toISOString(),
                expirationTime: new Date(Date.now() + 3600000).toISOString(),
                issuedAtTime: new Date().toISOString(),
                signInProvider: 'phone',
                signInSecondFactor: null,
                token: 'mock-token',
                claims: {}
            }),
            reload: async () => { },
            toJSON: () => ({})
        };

        setUser(mockUser);
        setUserRole('citizen');
        localStorage.setItem('userRole', 'citizen');
    };

    const isRegistrar = userRole === 'registrar' && registrarSession !== null;

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signInWithPhone,
            verifyOtp,
            registrarSession,
            setRegistrarSession,
            logout,
            userRole,
            isRegistrar,
            loginAsDemoCitizen
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
