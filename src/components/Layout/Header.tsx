import { useState, useRef, useEffect } from 'react';
import { Calendar, User, LogOut, Plus, Settings, Sun, Moon, Menu, X as CloseIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AddHolidayForm } from '../../features/holidays/components/Controls/AddHolidayForm';
import { HolidayTypeManager } from '../Admin/HolidayTypeManager';
import { LoginForm } from '../Auth/LoginForm';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './Header.css';

// Register GSAP React plugin
gsap.registerPlugin(useGSAP);

export const Header = () => {
    const { session, logout, isAdmin } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    const [isTypeManagerOpen, setIsTypeManagerOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Animate mobile menu entry using GSAP
    useGSAP(() => {
        if (isMobileMenuOpen) {
            gsap.fromTo('.header-nav.mobile-open',
                { x: '100%', opacity: 0 },
                { x: '0%', opacity: 1, duration: 0.3, ease: 'power3.out' }
            );
            gsap.fromTo('.mobile-menu-overlay',
                { opacity: 0 },
                { opacity: 1, duration: 0.3 }
            );
        }
    }, { dependencies: [isMobileMenuOpen], scope: containerRef });

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen]);

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <header className="header" ref={containerRef}>
            <div className="header-content">
                <div className="header-brand">
                    <Calendar className="header-icon" size={32} />
                    <h1 className="header-title">Portal de Feriados</h1>
                </div>

                {/* Mobile Menu Toggle Button */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
                </button>

                {/* Navigation Menu (Desktop & Mobile Panel) */}
                <div className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`} ref={menuRef}>
                    <button className="mobile-menu-close" onClick={closeMobileMenu} aria-label="Close menu">
                        <CloseIcon size={24} />
                    </button>
                    <div className="header-auth">
                        <button
                            className="header-theme-btn"
                            onClick={() => { toggleTheme(); closeMobileMenu(); }}
                            title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
                        >
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                            <span className="mobile-only-text">Tema {theme === 'light' ? 'Oscuro' : 'Claro'}</span>
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
                                            onClick={() => { setIsTypeManagerOpen(true); closeMobileMenu(); }}
                                            title="Gestionar Tipos de Feriado"
                                        >
                                            <Settings size={18} />
                                            <span>Tipos</span>
                                        </button>
                                        <button
                                            className="header-add-btn"
                                            onClick={() => { setIsAddFormOpen(true); closeMobileMenu(); }}
                                        >
                                            <Plus size={18} />
                                            <span>Agregar Feriado</span>
                                        </button>
                                    </>
                                )}

                                <button onClick={() => { logout(); closeMobileMenu(); }} className="header-logout-btn" title="Cerrar Sesión">
                                    <LogOut size={18} />
                                    <span>Salir</span>
                                </button>
                            </>
                        ) : (
                            <button
                                className="header-login-btn"
                                onClick={() => { setIsLoginOpen(true); closeMobileMenu(); }}
                            >
                                <User size={18} />
                                <span>Iniciar Sesión</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Overlays for Mobile Menu blur effect */}
            {isMobileMenuOpen && <div className="mobile-menu-overlay" onClick={closeMobileMenu} />}

            {isAddFormOpen && (
                <AddHolidayForm onSuccess={() => setIsAddFormOpen(false)} isOpen={isAddFormOpen} onClose={() => setIsAddFormOpen(false)} />
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
