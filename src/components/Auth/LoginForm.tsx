import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Eye, EyeOff } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './LoginForm.css';

interface LoginFormProps {
    onClose?: () => void;
    allowClose?: boolean;
}

/**
 * Login form component
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onClose, allowClose = true }) => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.fromTo('.login-modal',
            { scale: 0.85, opacity: 0, y: 20 },
            { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.5)' }
        );
        gsap.fromTo(containerRef.current,
            { backgroundColor: 'rgba(0, 0, 0, 0)' },
            { backgroundColor: 'rgba(0, 0, 0, 0.5)', duration: 0.3 }
        );
    }, { scope: containerRef });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login({ username, password });

        if (result.success) {
            if (onClose) onClose();
        } else {
            setError(result.error || 'Error al iniciar sesión');
        }

        setLoading(false);
    };

    return (
        <div className="login-modal-overlay" ref={containerRef} onClick={() => allowClose && onClose && onClose()}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
                {allowClose && onClose && (
                    <button className="login-modal-close" onClick={onClose} aria-label="Cerrar">
                        <X size={24} />
                    </button>
                )}

                <h2 className="login-modal-title">Iniciar Sesión</h2>
                <p className="login-modal-subtitle">Accede como administrador</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-form-group">
                        <label htmlFor="username" className="login-label">
                            Usuario o Email
                        </label>
                        <input
                            id="username"
                            type="text"
                            className="login-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin@portalferiados.com"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="login-form-group">
                        <label htmlFor="password" className="login-label">
                            Contraseña
                        </label>
                        <div className="login-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                className="login-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <button type="submit" className="login-submit-btn" disabled={loading}>
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>

                    <a
                        href="https://wa.me/51964972584?text=Hola%2C%20necesito%20ayuda%20con%20portalFeriados%20en%20el%20inicio%20de%20sesi%C3%B3n%20o%20para%20crear%20un%20nuevo%20usuario."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="login-support-link"
                    >
                        ¿Necesitas ayuda o un nuevo usuario? Contactar a soporte
                    </a>
                </form>
            </div>
        </div>
    );
};
