import React, { useState } from 'react';
import { Calendar, LogIn, LogOut, Shield, User, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LoginForm } from '../Auth/LoginForm';
import { AddHolidayForm } from '../Controls/AddHolidayForm';
import './Header.css';

/**
 * Application header component
 */
export const Header: React.FC = () => {
    const { isAuthenticated, isAdmin, session, logout } = useAuth();
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [showAddHolidayForm, setShowAddHolidayForm] = useState(false);

    const handleLogout = () => {
        logout();
    };

    return (
        <>
            <header className="header">
                <div className="header-content">
                    <div className="header-brand">
                        <Calendar className="header-icon" size={28} />
                        <span className="header-title">Portal de Feriados</span>
                    </div>

                    <div className="header-auth">
                        {isAdmin && (
                            <button
                                onClick={() => setShowAddHolidayForm(true)}
                                className="header-add-btn"
                                title="Agregar feriado"
                            >
                                <Plus size={18} />
                                <span>Agregar Feriado</span>
                            </button>
                        )}

                        {isAuthenticated ? (
                            <>
                                <div className="header-user">
                                    {isAdmin ? <Shield size={18} /> : <User size={18} />}
                                    <span className="header-username">{session?.username}</span>
                                    <span className="header-role">
                                        {isAdmin ? 'Admin' : 'Invitado'}
                                    </span>
                                </div>
                                <button onClick={handleLogout} className="header-logout-btn" title="Cerrar sesión">
                                    <LogOut size={18} />
                                    <span>Salir</span>
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setShowLoginForm(true)} className="header-login-btn" title="Iniciar sesión">
                                <LogIn size={18} />
                                <span>Iniciar Sesión</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {showLoginForm && <LoginForm onClose={() => setShowLoginForm(false)} />}
            {showAddHolidayForm && (
                <AddHolidayForm
                    isOpen={showAddHolidayForm}
                    onClose={() => setShowAddHolidayForm(false)}
                />
            )}
        </>
    );
};
