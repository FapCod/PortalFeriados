import bcrypt from 'bcryptjs';

/**
 * User model
 */
export interface User {
    id: string;
    username: string;
    passwordHash: string;
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

const USERS_KEY = 'portal_feriados_users';
const SESSION_KEY = 'portal_feriados_session';
const SALT_ROUNDS = 10;

/**
 * Authentication service for user management and session handling
 */
class AuthService {
    /**
     * Initialize default admin user if no users exist
     */
    private initializeDefaultUsers(): void {
        const users = this.loadUsers();
        if (users.length === 0) {
            const defaultAdmin: User = {
                id: 'admin_1',
                username: 'admin',
                passwordHash: bcrypt.hashSync('admin123', SALT_ROUNDS),
                role: 'administrator',
                createdAt: new Date(),
            };
            this.saveUsers([defaultAdmin]);
        }
    }

    /**
     * Load users from localStorage
     */
    private loadUsers(): User[] {
        try {
            const stored = localStorage.getItem(USERS_KEY);
            if (!stored) return [];

            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed.map(u => ({
                ...u,
                createdAt: new Date(u.createdAt)
            })) : [];
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    }

    /**
     * Save users to localStorage
     */
    private saveUsers(users: User[]): void {
        try {
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
        } catch (error) {
            console.error('Error saving users:', error);
        }
    }

    /**
     * Generate a unique user ID
     */
    private generateUserId(): string {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate a session token
     */
    private generateToken(): string {
        return `token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    }

    /**
     * Login user with credentials async to prevent UI blocking
     */
    async login(credentials: LoginCredentials): Promise<{ success: boolean; session?: Session; error?: string }> {
        this.initializeDefaultUsers();

        const { username, password } = credentials;

        // Validate input
        if (!username || !password) {
            return { success: false, error: 'Usuario y contraseña son requeridos' };
        }

        // Find user
        const users = this.loadUsers();
        const user = users.find(u => u.username === username);

        if (!user) {
            return { success: false, error: 'Usuario o contraseña incorrectos' };
        }

        // Verify password using Promises to yield to main thread 
        // Note: Realistically, in a browser this should be a Web Worker, but this prevents synchronous blocking
        const isValidPassword = await new Promise<boolean>((resolve) => {
            setTimeout(() => {
                resolve(bcrypt.compareSync(password, user.passwordHash));
            }, 0);
        });

        if (!isValidPassword) {
            return { success: false, error: 'Usuario o contraseña incorrectos' };
        }

        // Create session
        const session: Session = {
            userId: user.id,
            username: user.username,
            role: user.role,
            token: this.generateToken(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        };

        // Save session
        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        } catch (error) {
            console.error('Error saving session:', error);
            return { success: false, error: 'Error al crear sesión' };
        }

        return { success: true, session };
    }

    /**
     * Logout current user
     */
    logout(): void {
        localStorage.removeItem(SESSION_KEY);
    }

    /**
     * Get current session
     */
    getSession(): Session | null {
        try {
            const stored = localStorage.getItem(SESSION_KEY);
            if (!stored) return null;

            const session: Session = JSON.parse(stored);
            session.expiresAt = new Date(session.expiresAt);

            // Check if session is expired
            if (session.expiresAt < new Date()) {
                this.logout();
                return null;
            }

            return session;
        } catch (error) {
            console.error('Error loading session:', error);
            return null;
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return this.getSession() !== null;
    }

    /**
     * Check if current user is admin
     */
    isAdmin(): boolean {
        const session = this.getSession();
        return session?.role === 'administrator';
    }

    /**
     * Get current user role
     */
    getCurrentRole(): UserRole | null {
        const session = this.getSession();
        return session?.role || null;
    }

    /**
     * Create a new user (admin only)
     */
    createUser(username: string, password: string, role: UserRole): { success: boolean; error?: string } {
        if (!this.isAdmin()) {
            return { success: false, error: 'No tienes permisos para crear usuarios' };
        }

        // Validate input
        if (!username || username.length < 3) {
            return { success: false, error: 'El nombre de usuario debe tener al menos 3 caracteres' };
        }

        if (!password || password.length < 6) {
            return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
        }

        // Check if user exists
        const users = this.loadUsers();
        if (users.some(u => u.username === username)) {
            return { success: false, error: 'El nombre de usuario ya existe' };
        }

        // Create new user
        const newUser: User = {
            id: this.generateUserId(),
            username,
            passwordHash: bcrypt.hashSync(password, SALT_ROUNDS),
            role,
            createdAt: new Date(),
        };

        users.push(newUser);
        this.saveUsers(users);

        return { success: true };
    }
}

export const authService = new AuthService();
