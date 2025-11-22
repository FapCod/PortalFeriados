import { useState } from 'react';
import { Calendar, User, LogOut, Plus, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AddHolidayForm } from '../Controls/AddHolidayForm';
import { HolidayTypeManager } from '../Admin/HolidayTypeManager';
import { LoginForm } from '../Auth/LoginForm';
import './Header.css';

export const Header = () => {
    const { session, logout, isAdmin } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    const [isTypeManagerOpen, setIsTypeManagerOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-brand">
                    <Calendar className="header-icon" size={32} />
                    <h1 className="header-title">Portal de Feriados</h1>
                </div>

                <div className="header-auth">
                    <button
                        className="header-theme-btn"
                        onClick={toggleTheme}
                        title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>

                    {session ? (
                        <>
                            <div className="header-user">
                                <User size={18} />
                                <span className="header-username">{session.username}</span>
                                <span className="header-role">{isAdmin ? 'Admin' : 'Invitado'}</span>
                            </div>

                            {isAdmin && (
                                <>
                                    <button
                                        className="header-types-btn"
                                        onClick={() => setIsTypeManagerOpen(true)}
                                        title="Gestionar Tipos de Feriado"
                                    >
                                        <Settings size={18} />
                                        <span>Tipos</span>
                                    </button>
                                    <button
                                        className="header-add-btn"
                                        onClick={() => setIsAddFormOpen(true)}
                                    >
                                        <Plus size={18} />
                                        <span>Agregar Feriado</span>
                                    </button>
                                </>
                            )}

                            <button onClick={logout} className="header-logout-btn" title="Cerrar Sesión">
                                <LogOut size={18} />
                                <span>Salir</span>
                            </button>
                        </>
                    ) : (
                        <button
                            className="header-login-btn"
                            onClick={() => setIsLoginOpen(true)}
                        >
                            <User size={18} />
                            <span>Iniciar Sesión</span>
                        </button>
                    )}
                </div>
            </div>

            {isAddFormOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button
                            className="modal-close"
                            onClick={() => setIsAddFormOpen(false)}
                        >
                            ×
                        </button>
                        <AddHolidayForm onSuccess={() => setIsAddFormOpen(false)} isOpen={isAddFormOpen} onClose={() => setIsAddFormOpen(false)} />
                    </div>
                </div>
            )}

            <HolidayTypeManager
                isOpen={isTypeManagerOpen}
                onClose={() => setIsTypeManagerOpen(false)}
            />

            {isLoginOpen && (
                <LoginForm onClose={() => setIsLoginOpen(false)} />
            )}
        </header>
    );
};
