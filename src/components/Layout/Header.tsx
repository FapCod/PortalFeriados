import { useState, useRef, useEffect } from 'react';
import { Calendar, User, LogOut, Plus, Settings, Sun, Moon, Menu, X as CloseIcon, Users, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { AddHolidayForm } from '../../features/holidays/components/Controls/AddHolidayForm';
import { HolidayTypeManager } from '../Admin/HolidayTypeManager';
import { PersonManager } from '../Admin/PersonManager';
import { LoginForm } from '../Auth/LoginForm';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './Header.css';

export const Header = () => {
    const { session, logout, isAdmin } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    const [isTypeManagerOpen, setIsTypeManagerOpen] = useState(false);
    const [isPersonManagerOpen, setIsPersonManagerOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Animate header entry on load
    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.fromTo('.header-brand',
            { y: -35, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, clearProps: 'all' }
        )
        .fromTo('.header-auth > *',
            { y: -25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, clearProps: 'all' },
            '-=0.35'
        );
    }, { scope: containerRef });

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

    // Animate theme button icon on change (UI/UX Pro Max)
    useGSAP(() => {
        // Skip initial animation if possible, but in useGSAP we can animate it on theme change
        gsap.fromTo('.header-theme-btn svg',
            { rotation: -90, scale: 0.5, opacity: 0 },
            { rotation: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)', clearProps: 'transform,opacity' }
        );
    }, { dependencies: [theme], scope: containerRef });

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) && !userMenuRef.current?.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        if (isMobileMenuOpen || isUserMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen, isUserMenuOpen]);

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
        const veil = document.getElementById('theme-veil');
        if (!veil) {
            toggleTheme();
            closeMobileMenu();
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const nextTheme = theme === 'light' ? 'dark' : 'light';
        const nextBgColor = nextTheme === 'light' ? '#f8fafc' : '#0f172a';

        // Prepare the circular veil overlay at the button position
        gsap.set(veil, {
            backgroundColor: nextBgColor,
            clipPath: `circle(0% at ${x}px ${y}px)`,
            opacity: 1, // Ensure opacity is reset to 1
            display: 'block',
            pointerEvents: 'all'
        });

        // Animate the circle clipPath to cover the full viewport
        gsap.to(veil, {
            clipPath: `circle(150% at ${x}px ${y}px)`,
            duration: 0.85,
            ease: 'power3.inOut',
            onComplete: () => {
                // Switch theme and close mobile menu while screen is covered
                toggleTheme();
                closeMobileMenu();
                
                // Fade out the veil smoothly to reveal the new theme gently
                gsap.to(veil, {
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    onComplete: () => {
                        // Reset the veil states for the next toggle
                        gsap.set(veil, {
                            display: 'none',
                            opacity: 1,
                            pointerEvents: 'none'
                        });
                    }
                });
            }
        });
    };

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
                            onClick={handleThemeToggle}
                            title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
                        >
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                            <span className="mobile-only-text">Tema {theme === 'light' ? 'Oscuro' : 'Claro'}</span>
                        </button>

                        {session ? (
                            <>
                                <div className="user-menu-container" ref={userMenuRef}>
                                    <button 
                                        className="header-user-btn" 
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    >
                                        <User size={18} />
                                        <span className="header-username">{session.username}</span>
                                        <span className="header-role">{isAdmin ? 'Admin' : 'Invitado'}</span>
                                        <ChevronDown size={16} className={`user-menu-chevron ${isUserMenuOpen ? 'open' : ''}`} />
                                    </button>

                                    {isUserMenuOpen && (
                                        <div className="user-dropdown-menu">
                                            {isAdmin && (
                                                <>
                                                    <button
                                                        className="dropdown-item"
                                                        onClick={() => { setIsTypeManagerOpen(true); setIsUserMenuOpen(false); closeMobileMenu(); }}
                                                    >
                                                        <Settings size={16} />
                                                        <span>Tipos</span>
                                                    </button>
                                                    <button
                                                        className="dropdown-item"
                                                        onClick={() => { setIsAddFormOpen(true); setIsUserMenuOpen(false); closeMobileMenu(); }}
                                                    >
                                                        <Plus size={16} />
                                                        <span>Agregar Feriado</span>
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                className="dropdown-item"
                                                onClick={() => { setIsPersonManagerOpen(true); setIsUserMenuOpen(false); closeMobileMenu(); }}
                                            >
                                                <Users size={16} />
                                                <span>Personas</span>
                                            </button>

                                            <div className="dropdown-divider"></div>

                                            <button 
                                                onClick={() => { logout(); setIsUserMenuOpen(false); closeMobileMenu(); }} 
                                                className="dropdown-item text-danger"
                                            >
                                                <LogOut size={16} />
                                                <span>Salir</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
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

            <PersonManager
                isOpen={isPersonManagerOpen}
                onClose={() => setIsPersonManagerOpen(false)}
            />

            {isLoginOpen && (
                <LoginForm onClose={() => setIsLoginOpen(false)} />
            )}
        </header>
    );
};
