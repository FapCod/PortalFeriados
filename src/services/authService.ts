import { supabase } from './supabaseClient';

/**
 * User model
 */
export interface User {
    id: string;
    username: string;
    role: UserRole;
    createdAt: Date;
}

/**
 * User roles
 */
export type UserRole = 'administrator' | 'guest';

/**
 * Login credentials
 */
export interface LoginCredentials {
    username: string;
    password: string;
}

/**
 * Session information
 */
export interface Session {
    userId: string;
    username: string;
    role: UserRole;
    token: string;
    expiresAt: Date;
}

/**
 * Authentication service for user management and session handling using Supabase
 */
class AuthService {
    /**
     * Login user with credentials from Supabase Auth
     */
    async login(credentials: LoginCredentials): Promise<{ success: boolean; session?: Session; error?: string }> {
        const { username, password } = credentials;

        // Validate input
        if (!username || !password) {
            return { success: false, error: 'Usuario y contraseña son requeridos' };
        }

        // Map username/email to email format
        let email = username.trim();
        if (!email.includes('@')) {
            email = `${email.toLowerCase()}@portalferiados.com`;
        }

        // Direct sign in via Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { success: false, error: 'Usuario o contraseña incorrectos' };
        }

        if (!data.session || !data.user) {
            return { success: false, error: 'Error al iniciar sesión' };
        }

        // Get user role from public.users table
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            console.error('Error fetching public user profile:', profileError);
        }

        const role = (profile?.role as UserRole) || 'guest';

        const session: Session = {
            userId: data.user.id,
            username: username,
            role,
            token: data.session.access_token,
            expiresAt: new Date(data.session.expires_at! * 1000),
        };

        return { success: true, session };
    }

    /**
     * Logout current user
     */
    async logout(): Promise<void> {
        await supabase.auth.signOut();
    }

    /**
     * Get current session
     */
    async getSession(): Promise<Session | null> {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || !session.user) return null;

            // Check if expired
            const expiresAt = new Date(session.expires_at! * 1000);
            if (expiresAt < new Date()) {
                await this.logout();
                return null;
            }

            // Get profile role
            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single();

            const role = (profile?.role as UserRole) || 'guest';
            const username = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'guest';

            return {
                userId: session.user.id,
                username,
                role,
                token: session.access_token,
                expiresAt,
            };
        } catch (error) {
            console.error('Error loading session:', error);
            return null;
        }
    }
}

export const authService = new AuthService();
