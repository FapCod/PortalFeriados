import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';
import './LoginForm.css';

interface LoginFormProps {
    onClose: () => void;
}

/**
 * Login form component
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onClose }) => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login({ username, password });

        if (result.success) {
            onClose();
        } else {
            setError(result.error || 'Error al iniciar sesión');
        }

        setLoading(false);
    };

    return (
        <div className="login-modal-overlay" onClick={onClose}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
                <button className="login-modal-close" onClick={onClose} aria-label="Cerrar">
                    <X size={24} />
                </button>

                <h2 className="login-modal-title">Iniciar Sesión</h2>
                <p className="login-modal-subtitle">Accede como administrador</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-form-group">
                        <label htmlFor="username" className="login-label">
                            Usuario
                        </label>
                        <input
                            id="username"
                            type="text"
                            className="login-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="login-form-group">
                        <label htmlFor="password" className="login-label">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <div className="login-hint">
                        <strong>Usuario de prueba:</strong>
                        <br />
                        Usuario: <code>admin</code> | Contraseña: <code>admin123</code>
                    </div>

                    <button type="submit" className="login-submit-btn" disabled={loading}>
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
};
