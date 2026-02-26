import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { AddHolidayForm } from './AddHolidayForm';
import './AddHolidayButton.css';

/**
 * Floating action button to add custom holidays
 * Only visible for administrators
 */
export const AddHolidayButton: React.FC = () => {
    const { isAdmin } = useAuth();
    const [showForm, setShowForm] = useState(false);

    // Don't render button for non-admin users
    if (!isAdmin) {
        return null;
    }

    return (
        <>
            <button
                className="add-holiday-fab"
                onClick={() => setShowForm(true)}
                title="Agregar feriado personalizado"
                aria-label="Agregar feriado"
            >
                <Plus size={24} />
            </button>

            {showForm && (
                <AddHolidayForm
                    isOpen={showForm}
                    onClose={() => setShowForm(false)}
                />
            )}
        </>
    );
};
