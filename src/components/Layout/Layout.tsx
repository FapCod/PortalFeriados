import React from 'react';
import { Header } from './Header';
import './Layout.css';

interface LayoutProps {
    children: React.ReactNode;
}

/**
 * Main layout component
 * Provides consistent structure across the application
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="layout">
            <Header />
            <main className="main-content">
                <div className="container">
                    {children}
                </div>
            </main>
            <footer className="footer">
                <div className="container">
                    <p className="footer-text">
                        © {new Date().getFullYear()} Portal de Feriados. Información actualizada de días festivos en Latinoamérica.
                    </p>
                </div>
            </footer>
        </div>
    );
};
