import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useHolidayStore } from '../../../../store/useHolidayStore';
import { holidayService } from '../../../../services/holidayService';
import type { Country } from '../../../../services/holidayService';
import type { CustomHolidayFormData } from '../../../../services/customHolidayService';
import { X, Calendar, Globe, MapPin, Tag, AlertCircle } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './AddHolidayForm.css';

interface AddHolidayFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    editHolidayId?: string;
    initialData?: CustomHolidayFormData;
}

/**
 * Modal form for adding/editing custom holidays
 */
export const AddHolidayForm: React.FC<AddHolidayFormProps> = ({
    isOpen,
    onClose,
    onSuccess,
    editHolidayId,
    initialData,
}) => {
    const { selectedCountry, addCustomHoliday, updateCustomHoliday, holidayTypes: storeTypes } = useHolidayStore();
    const countries = holidayService.getSupportedCountries();
    const containerRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState<CustomHolidayFormData>(
        initialData || {
            name: '',
            date: '',
            countryCode: selectedCountry?.code || '',
            region: '',
            type: 'public',
        }
    );

    const [errors, setErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // GSAP animations for modal entry using Timeline
    useGSAP(() => {
        if (isOpen) {
            const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
            
            tl.fromTo(containerRef.current,
                { backgroundColor: 'rgba(0, 0, 0, 0)' },
                { backgroundColor: 'rgba(0, 0, 0, 0.5)', duration: 0.25 }
            )
            .fromTo('.modal-content',
                { scale: 0.9, opacity: 0, y: 30 },
                { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.2)', clearProps: 'transform,opacity' },
                '-=0.15'
            );
        }
    }, { dependencies: [isOpen], scope: containerRef });

    const holidayTypes = storeTypes.map((t) => ({
        value: t.id,
        label: t.name
    }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);
        setIsSubmitting(true);

        const result = editHolidayId
            ? await updateCustomHoliday(editHolidayId, formData)
            : await addCustomHoliday(formData);

        setIsSubmitting(false);

        if (result.success) {
            onClose();
            if (onSuccess) onSuccess();
            // Reset form
            setFormData({
                name: '',
                date: '',
                countryCode: selectedCountry?.code || '',
                region: '',
                type: 'public',
            });
        } else {
            setErrors(result.errors || ['Error al guardar el feriado']);
        }
    };

    const handleChange = (
        field: keyof CustomHolidayFormData,
        value: string
    ) => {
        setFormData((prev: CustomHolidayFormData) => ({ ...prev, [field]: value }));
        setErrors([]); // Clear errors on input change
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" ref={containerRef} onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {editHolidayId ? 'Editar Feriado' : 'Agregar Feriado Personalizado'}
                    </h2>
                    <button className="modal-close" onClick={onClose} aria-label="Cerrar">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="holiday-form">
                    {errors.length > 0 && (
                        <div className="form-errors">
                            <AlertCircle size={20} />
                            <div>
                                {errors.map((error, index) => (
                                    <p key={index} className="error-message">
                                        {error}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            <Tag size={16} />
                            Nombre del Feriado *
                        </label>
                        <input
                            type="text"
                            id="name"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="ej. Día de la Independencia"
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="date" className="form-label">
                            <Calendar size={16} />
                            Fecha *
                        </label>
                        <input
                            type="date"
                            id="date"
                            className="form-input"
                            value={formData.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="country" className="form-label">
                            <Globe size={16} />
                            País *
                        </label>
                        <select
                            id="country"
                            className="form-select"
                            value={formData.countryCode}
                            onChange={(e) => handleChange('countryCode', e.target.value)}
                            required
                        >
                            <option value="">Selecciona un país</option>
                            {countries.map((country: Country) => (
                                <option key={country.code} value={country.code}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="region" className="form-label">
                            <MapPin size={16} />
                            Región o Provincia (opcional)
                        </label>
                        <input
                            type="text"
                            id="region"
                            className="form-input"
                            value={formData.region || ''}
                            onChange={(e) => handleChange('region', e.target.value)}
                            placeholder="ej. Ciudad de México"
                            maxLength={100}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="type" className="form-label">
                            <Tag size={16} />
                            Tipo de Feriado *
                        </label>
                        <select
                            id="type"
                            className="form-select"
                            value={formData.type}
                            onChange={(e) => handleChange('type', e.target.value)}
                            required
                        >
                            {holidayTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Guardando...' : editHolidayId ? 'Actualizar' : 'Agregar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};
