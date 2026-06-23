import React from 'react';
import { useToastStore } from '../../store/useToastStore';
import { ToastItem } from './ToastItem';
import './Toast.css';

/**
 * Global Toast Notifications Container
 * Positions toast alerts on the screen
 */
export const ToastContainer: React.FC = () => {
    const toasts = useToastStore((state) => state.toasts);

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    );
};
