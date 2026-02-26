import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { Session, LoginCredentials, UserRole } from '../services/authService';

/**
 * Auth context state
 */
interface AuthContextState {
    session: Session | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    role: UserRole | null;
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Auth provider component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Load session on mount
    useEffect(() => {
        const currentSession = authService.getSession();
        setSession(currentSession);
        setLoading(false);
    }, []);

    // Login function
    const login = useCallback(async (credentials: LoginCredentials) => {
        const result = await authService.login(credentials);

        if (result.success && result.session) {
            setSession(result.session);
            return { success: true };
        }

        return { success: false, error: result.error };
    }, []);

    // Logout function
    const logout = useCallback(() => {
        authService.logout();
        setSession(null);
    }, []);

    // Computed values
    const isAuthenticated = session !== null;
    const isAdmin = session?.role === 'administrator';
    const role = session?.role || null;

    const value = useMemo(
        () => ({
            session,
            isAuthenticated,
            isAdmin,
            role,
            login,
            logout,
            loading,
        }),
        [session, isAuthenticated, isAdmin, role, login, logout, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextState => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
