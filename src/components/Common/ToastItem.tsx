import React, { useRef } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useToastStore } from '../../store/useToastStore';
import type { Toast as ToastItemType } from '../../store/useToastStore';

interface ToastItemProps {
    toast: ToastItemType;
}

/**
 * Individual Toast Notification item
 * Animates in on mount and performs an exit animation before unmounting
 */
export const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
    const removeToast = useToastStore((state) => state.removeToast);
    const toastRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!toastRef.current) return;

        // Entrance animation
        gsap.fromTo(toastRef.current,
            { x: 120, opacity: 0, scale: 0.9 },
            { x: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.2)' }
        );

        // Auto close timer
        const timer = setTimeout(() => {
            handleClose();
        }, 3500);

        return () => clearTimeout(timer);
    }, { scope: toastRef });

    const handleClose = () => {
        if (!toastRef.current) {
            removeToast(toast.id);
            return;
        }

        // Exit animation before unmounting
        gsap.to(toastRef.current, {
            x: 100,
            opacity: 0,
            scale: 0.9,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                removeToast(toast.id);
            }
        });
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircle className="toast-icon success" size={20} />;
            case 'error':
                return <XCircle className="toast-icon error" size={20} />;
            case 'info':
            default:
                return <AlertCircle className="toast-icon info" size={20} />;
        }
    };

    return (
        <div ref={toastRef} className={`toast-item glass-panel ${toast.type}`}>
            <div className="toast-content-wrapper">
                {getIcon()}
                <p className="toast-message">{toast.message}</p>
            </div>
            <button className="toast-close-btn" onClick={handleClose} aria-label="Cerrar">
                <X size={16} />
            </button>
        </div>
    );
};
