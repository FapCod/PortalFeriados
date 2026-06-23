import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Tag, Star, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import gsap from 'gsap';
import type { Holiday } from '../../../../services/holidayService';
import type { CustomHoliday } from '../../../../services/customHolidayService';
import { holidayTypeService } from '../../../../services/holidayTypeService';
import './HolidayDetailModal.css';

interface HolidayDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    holiday: Holiday | CustomHoliday;
    isCustom: boolean;
}

export const HolidayDetailModal: React.FC<HolidayDetailModalProps> = ({
    isOpen,
    onClose,
    holiday,
    isCustom
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && modalRef.current && overlayRef.current) {
            gsap.fromTo(overlayRef.current, 
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
            
            gsap.fromTo(modalRef.current,
                { opacity: 0, y: 20, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.2)' }
            );
        }
    }, [isOpen]);

    const handleClose = () => {
        if (modalRef.current && overlayRef.current) {
            const tl = gsap.timeline({
                onComplete: onClose
            });
            
            tl.to(modalRef.current, { opacity: 0, y: 20, scale: 0.95, duration: 0.2, ease: 'power2.in' })
              .to(overlayRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in' }, '-=0.1');
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    const getTypeLabel = (type: string): string => {
        const typeDef = holidayTypeService.getTypeById(type);
        return typeDef ? typeDef.name : type;
    };

    const getTypeColor = (type: string): string => {
        return holidayTypeService.getColorForType(type);
    };

    const customHoliday = isCustom && 'id' in holiday ? (holiday as CustomHoliday) : null;

    return createPortal(
        <div className="holiday-detail-overlay" ref={overlayRef} onClick={handleClose}>
            <div 
                className={`holiday-detail-modal glass-panel ${isCustom ? 'custom' : ''}`} 
                ref={modalRef} 
                onClick={e => e.stopPropagation()}
            >
                <button className="close-btn" onClick={handleClose} aria-label="Cerrar modal">
                    <X size={20} />
                </button>

                <div className="modal-header">
                    <div 
                        className="modal-type-badge"
                        style={{ backgroundColor: getTypeColor(holiday.type) }}
                    >
                        <Tag size={16} />
                        <span>{getTypeLabel(holiday.type)}</span>
                    </div>
                </div>

                <div className="modal-body">
                    <div className="modal-title-wrapper">
                        {isCustom && <Star size={24} className="modal-custom-icon" fill="currentColor" />}
                        <h2 className="modal-title">{holiday.name}</h2>
                    </div>

                    <div className="modal-info-list">
                        <div className="modal-info-item">
                            <div className="info-icon-wrapper">
                                <Calendar size={20} />
                            </div>
                            <div className="info-content">
                                <span className="info-label">Fecha</span>
                                <span className="info-value">
                                    {format(holiday.start, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                                </span>
                            </div>
                        </div>

                        {customHoliday?.region && (
                            <div className="modal-info-item">
                                <div className="info-icon-wrapper">
                                    <MapPin size={20} />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">Región</span>
                                    <span className="info-value">{customHoliday.region}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
