import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Holiday } from '../../../../services/holidayService';
import type { CustomHoliday } from '../../../../services/customHolidayService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Tag, Edit2, Trash2, Star } from 'lucide-react';
import { useHolidayStore } from '../../../../store/useHolidayStore';
import { useAuth } from '../../../../context/AuthContext';
import { AddHolidayForm } from '../Controls/AddHolidayForm';
import { holidayTypeService } from '../../../../services/holidayTypeService';
import './HolidayCard.css';

interface HolidayCardProps {
    holiday: Holiday | CustomHoliday;
    isCustom?: boolean;
}

export const HolidayCard: React.FC<HolidayCardProps> = ({ holiday, isCustom = false }) => {
    const { deleteCustomHoliday } = useHolidayStore();
    const { isAdmin } = useAuth();
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const getTypeLabel = (type: string): string => {
        const typeDef = holidayTypeService.getTypeById(type);
        return typeDef ? typeDef.name : type;
    };

    const getTypeColor = (type: string): string => {
        return holidayTypeService.getColorForType(type);
    };

    const handleDelete = async () => {
        if (isCustom && 'id' in holiday) {
            await deleteCustomHoliday(holiday.id);
            setShowDeleteConfirm(false);
        }
    };

    const customHoliday = isCustom && 'id' in holiday ? (holiday as CustomHoliday) : null;

    return (
        <>
            <div className={`holiday-card glass-panel ${isCustom ? 'custom-holiday' : ''}`}>
                <div className="holiday-card-header">
                    <div className="holiday-date">
                        <Calendar size={20} className="holiday-icon" />
                        <div className="holiday-date-text">
                            <span className="holiday-day">
                                {format(holiday.start, 'd', { locale: es })}
                            </span>
                            <span className="holiday-month">
                                {format(holiday.start, 'MMM', { locale: es })}
                            </span>
                        </div>
                    </div>
                    <div
                        className="holiday-type"
                        style={{ backgroundColor: getTypeColor(holiday.type) }}
                    >
                        <Tag size={14} />
                        <span>{getTypeLabel(holiday.type)}</span>
                    </div>
                </div>

                <div className="holiday-content">
                    <div className="holiday-name-wrapper">
                        {isCustom && (
                            <Star size={16} className="custom-icon" fill="currentColor" />
                        )}
                        <h3 className="holiday-name">{holiday.name}</h3>
                    </div>

                    <p className="holiday-full-date">
                        {format(holiday.start, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>

                    {customHoliday?.region && (
                        <p className="holiday-region">📍 {customHoliday.region}</p>
                    )}
                </div>

                {isCustom && customHoliday && isAdmin && (
                    <div className="holiday-actions">
                        <button
                            className="action-btn edit-btn"
                            onClick={() => setShowEditForm(true)}
                            aria-label="Editar feriado"
                        >
                            <Edit2 size={16} />
                            <span>Editar</span>
                        </button>
                        <button
                            className="action-btn delete-btn"
                            onClick={() => setShowDeleteConfirm(true)}
                            aria-label="Eliminar feriado"
                        >
                            <Trash2 size={16} />
                            <span>Eliminar</span>
                        </button>
                    </div>
                )}
            </div>

            {showEditForm && customHoliday && (
                <AddHolidayForm
                    isOpen={showEditForm}
                    onClose={() => setShowEditForm(false)}
                    editHolidayId={customHoliday.id}
                    initialData={{
                        name: customHoliday.name,
                        date: customHoliday.date,
                        countryCode: customHoliday.countryCode,
                        region: customHoliday.region,
                        type: customHoliday.type,
                    }}
                />
            )}

            {showDeleteConfirm && createPortal(
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                        <h3 className="confirm-title">¿Eliminar feriado?</h3>
                        <p className="confirm-message">
                            ¿Estás seguro de que deseas eliminar "{holiday.name}"? Esta acción no se puede deshacer.
                        </p>
                        <div className="confirm-actions">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-delete"
                                onClick={handleDelete}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
