import React, { useMemo, useRef } from 'react';
import { useHolidayStore } from '../../../../store/useHolidayStore';
import { holidayService } from '../../../../services/holidayService';
import type { Holiday } from '../../../../services/holidayService';
import type { CustomHoliday } from '../../../../services/customHolidayService';
import { holidayTypeService } from '../../../../services/holidayTypeService';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, getDay, isBefore, startOfDay, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle, MousePointerClick, User, X } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HolidayDetailModal } from './HolidayDetailModal';
import { AssignmentModal } from './AssignmentModal';
import { useAuth } from '../../../../context/AuthContext';
import { useAssignmentStore } from '../../../../store/useAssignmentStore';
import type { Assignment } from '../../../../services/assignmentService';
import './HolidayCalendar.css';

/**
 * Calendar view component for displaying holidays
 */
export const HolidayCalendar: React.FC = () => {
    const { selectedCountry, selectedYear, filterType, customHolidays } = useHolidayStore();
    const { isAuthenticated } = useAuth();
    const { 
        isAssignmentMode, setAssignmentMode, assignments, loadAssignments, loadPersons 
    } = useAssignmentStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedHoliday, setSelectedHoliday] = React.useState<Holiday | CustomHoliday | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    
    const [rangeStart, setRangeStart] = React.useState<Date | null>(null);
    const [rangeEnd, setRangeEnd] = React.useState<Date | null>(null);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = React.useState(false);
    const [selectedAssignmentId, setSelectedAssignmentId] = React.useState<string | null>(null);
    const [infoAssignments, setInfoAssignments] = React.useState<Assignment[]>([]);

    React.useEffect(() => {
        if (selectedCountry) {
            loadAssignments(selectedCountry.code, selectedYear);
            loadPersons();
        }
    }, [selectedCountry, selectedYear, loadAssignments, loadPersons]);
    
    React.useEffect(() => {
        if (!isAssignmentMode) {
            setRangeStart(null);
            setRangeEnd(null);
        }
    }, [isAssignmentMode]);

    const holidays = useMemo(() => {
        if (!selectedCountry) return [];

        // Get official holidays
        const officialHolidays = holidayService.getHolidays(selectedCountry.code, selectedYear);
        const filteredOfficial = holidayService.filterByType(officialHolidays, filterType);

        // Get custom holidays for selected country/year
        const customForCountry = customHolidays.filter(
            (h: CustomHoliday) => h.countryCode === selectedCountry.code && new Date(h.date).getFullYear() === selectedYear
        );

        // Filter custom holidays by type
        const filteredCustom = filterType === 'all'
            ? customForCountry
            : customForCountry.filter((h: CustomHoliday) => h.type === filterType);

        // Convert custom holidays to Holiday format and merge
        const customAsHolidays: Holiday[] = filteredCustom.map((ch: CustomHoliday) => ({
            name: ch.name,
            type: ch.type,
            start: new Date(ch.date),
            end: new Date(ch.date),
            date: ch.date,
            rule: `Custom holiday for ${ch.countryCode}`,
        }));

        return [...filteredOfficial, ...customAsHolidays];
    }, [selectedCountry, selectedYear, filterType, customHolidays]);

    const months = useMemo(() => {
        const allMonths = Array.from({ length: 12 }, (_, i) => {
            const date = new Date(selectedYear, i, 1);
            return {
                name: format(date, 'MMMM', { locale: es }),
                date,
                days: eachDayOfInterval({
                    start: startOfMonth(date),
                    end: endOfMonth(date),
                }),
            };
        });

        // Si el filtro no es 'all', mostramos solo los meses que tienen feriados que coinciden con el filtro
        if (filterType !== 'all') {
            return allMonths.filter((month) => {
                return holidays.some(holiday => {
                    if (!holiday.date) return false;
                    const dateParts = holiday.date.split(' ')[0]; // Obtiene la parte "YYYY-MM-DD"
                    const [, m] = dateParts.split('-').map(Number);
                    return m - 1 === month.date.getMonth();
                });
            });
        }

        return allMonths;
    }, [selectedYear, filterType, holidays]);

    const getHolidaysForDay = (day: Date): Holiday[] => {
        const dayHolidays = holidays.filter(holiday => {
            // Use the 'date' field which is in format "YYYY-MM-DD HH:MM:SS" (local time)
            // NOT the 'start' field which is ISO UTC and causes timezone issues
            if (!holiday.date) return false;
            const dateParts = holiday.date.split(' ')[0]; // Get "YYYY-MM-DD" part
            const [year, month, dayNum] = dateParts.split('-').map(Number);
            const holidayDate = new Date(year, month - 1, dayNum); // Create in local timezone
            return isSameDay(holidayDate, day);
        });
        return dayHolidays;
    };

    const getAssignmentsForDay = (day: Date) => {
        if (!selectedCountry) return [];
        return assignments.filter(a => {
            if (a.countryCode !== selectedCountry.code) return false;
            
            const startParts = a.startDate.split('-');
            const endParts = a.endDate.split('-');
            
            const start = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
            const end = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]));
            const current = startOfDay(day);
            
            return (isSameDay(current, start) || isSameDay(current, end) || (isBefore(start, current) && isBefore(current, end)));
        });
    };

    const isDayInSelectionRange = (day: Date) => {
        if (!rangeStart) return false;
        if (!rangeEnd) return isSameDay(day, rangeStart);
        return isWithinInterval(day, { start: rangeStart, end: rangeEnd }) || isSameDay(day, rangeStart) || isSameDay(day, rangeEnd);
    };

    const handleDayClick = (day: Date, hasHolidays: boolean, dayHolidays: Holiday[], hasAssignments: boolean, dayAssignments: Assignment[]) => {
        if (isAssignmentMode) {
            // Edit existing assignment
            if (dayAssignments.length > 0 && !rangeStart) {
                setSelectedAssignmentId(dayAssignments[0].id);
                // Important to fix timezones: ensure we get local start of day
                const startStr = dayAssignments[0].startDate;
                const endStr = dayAssignments[0].endDate;
                setRangeStart(new Date(parseInt(startStr.split('-')[0]), parseInt(startStr.split('-')[1]) - 1, parseInt(startStr.split('-')[2])));
                setRangeEnd(new Date(parseInt(endStr.split('-')[0]), parseInt(endStr.split('-')[1]) - 1, parseInt(endStr.split('-')[2])));
                setIsAssignmentModalOpen(true);
                return;
            }

            if (!rangeStart) {
                setRangeStart(day);
                setRangeEnd(null);
            } else if (!rangeEnd) {
                if (isBefore(day, rangeStart)) {
                    setRangeEnd(rangeStart);
                    setRangeStart(day);
                } else {
                    setRangeEnd(day);
                }
                setSelectedAssignmentId(null);
                setIsAssignmentModalOpen(true);
            } else {
                setRangeStart(day);
                setRangeEnd(null);
            }
        } else {
            if (hasHolidays) {
                setSelectedHoliday(dayHolidays[0]);
                setIsModalOpen(true);
            } else if (hasAssignments) {
                setInfoAssignments(dayAssignments);
            }
        }
    };

    const getTypeColor = (type: string): string => {
        return holidayTypeService.getColorForType(type);
    };

    const today = startOfDay(new Date());

    // Animate calendar months on scroll with ScrollTrigger.batch (UI/UX Pro Max)
    useGSAP(() => {
        if (selectedCountry) {
            // Set initial state
            gsap.set('.calendar-month', { opacity: 0, scale: 0.94, y: 25 });
            
            ScrollTrigger.batch('.calendar-month', {
                start: 'top 88%',
                once: true,
                onEnter: (batch) => {
                    gsap.to(batch, {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.06,
                        ease: 'power2.out',
                        clearProps: 'transform,opacity',
                        overwrite: 'auto'
                    });
                }
            });
        }
    }, { dependencies: [selectedCountry, selectedYear, filterType], scope: containerRef });

    if (!selectedCountry) {
        return (
            <div className="calendar-empty">
                <AlertCircle size={48} className="empty-icon" />
                <h3 className="empty-title">Selecciona un país</h3>
                <p className="empty-description">
                    Elige un país de la lista para ver el calendario de feriados
                </p>
            </div>
        );
    }

    return (
        <div className="holiday-calendar" ref={containerRef}>
            <div className="calendar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="calendar-title">
                    Calendario de Feriados - {selectedCountry.name} {selectedYear}
                </h2>
                {isAuthenticated && (
                    <button 
                        className={`btn ${isAssignmentMode ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setAssignmentMode(!isAssignmentMode)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}
                    >
                        <MousePointerClick size={18} />
                        {isAssignmentMode ? 'Salir Modo Asignación' : 'Modo Asignación'}
                    </button>
                )}
            </div>

            <div className="calendar-grid">
                {months.map((month, monthIndex) => {
                    const firstDayOfWeek = getDay(month.days[0]);
                    const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

                    return (
                        <div key={monthIndex} className="calendar-month glass-panel">
                            <h3 className="calendar-month-name">
                                {month.name.charAt(0).toUpperCase() + month.name.slice(1)}
                            </h3>

                            <div className="calendar-weekdays">
                                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                                    <div key={i} className="calendar-weekday">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="calendar-days">
                                {Array.from({ length: paddingDays }).map((_, i) => (
                                    <div key={`padding-${i}`} className="calendar-day-empty" />
                                ))}

                                {month.days.map((day, dayIndex) => {
                                    const dayHolidays = getHolidaysForDay(day);
                                    const dayAssignments = getAssignmentsForDay(day);
                                    const isWeekend = getDay(day) === 0 || getDay(day) === 6;
                                    const hasHolidays = dayHolidays.length > 0;
                                    const hasAssignments = dayAssignments.length > 0;
                                    const isPast = isBefore(day, today);
                                    const isInRange = isDayInSelectionRange(day);
                                    
                                    const isConflict = hasHolidays && hasAssignments;

                                    return (
                                        <div
                                            key={dayIndex}
                                            className={`calendar-day ${isWeekend ? 'weekend' : ''} ${hasHolidays ? 'has-holiday' : ''} ${isPast ? 'is-past' : ''} ${isInRange ? 'in-range' : ''} ${isConflict ? 'conflict' : ''} ${isAssignmentMode ? 'assignment-mode' : ''}`}
                                            style={{
                                                ...(hasHolidays && !hasAssignments ? { backgroundColor: `${getTypeColor(dayHolidays[0].type)}15` } : {}),
                                                ...(hasAssignments && !isConflict ? { backgroundColor: `${dayAssignments[0].person?.color}15`, borderBottom: `4px solid ${dayAssignments[0].person?.color}` } : {}),
                                                ...(isConflict ? { backgroundColor: '#fef08a', borderBottom: `4px solid ${dayAssignments[0].person?.color}`, boxShadow: 'inset 0 0 0 2px #ef4444' } : {}),
                                                ...(isInRange ? { backgroundColor: '#e0e7ff', border: '2px dashed #4f46e5' } : {}),
                                                cursor: (hasHolidays || isAssignmentMode) ? 'pointer' : 'default',
                                                justifyContent: (hasAssignments || hasHolidays) ? 'space-between' : 'center',
                                                padding: (hasAssignments || hasHolidays) ? '4px 0 2px 0' : '0'
                                            }}
                                            title={
                                                (hasHolidays ? dayHolidays.map(h => h.name).join(', ') : '') + 
                                                (hasHolidays && hasAssignments ? ' | ' : '') +
                                                (hasAssignments ? `Asignado a: ${dayAssignments.map(a => a.person?.name).join(', ')}` : '')
                                            }
                                            onClick={() => handleDayClick(day, hasHolidays, dayHolidays, hasAssignments, dayAssignments)}
                                        >
                                            <span className="calendar-day-number" style={{ lineHeight: 1 }}>{format(day, 'd')}</span>
                                            
                                            {hasHolidays && (
                                                <div className="calendar-day-indicators" style={{ margin: 'auto 0' }}>
                                                    {dayHolidays.slice(0, 3).map((holiday, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="calendar-day-indicator"
                                                            style={{ backgroundColor: getTypeColor(holiday.type) }}
                                                        />
                                                    ))}
                                                    {dayHolidays.length > 3 && (
                                                        <span className="calendar-day-more">+{dayHolidays.length - 3}</span>
                                                    )}
                                                </div>
                                            )}

                                            {hasAssignments && (
                                                <div className="assignment-label" style={{ color: dayAssignments[0].person?.color || '#333', margin: 0, lineHeight: 1 }}>
                                                    {(() => {
                                                        const name = dayAssignments[0].person?.name || '';
                                                        const parts = name.split(' ').filter(p => p.trim() !== '');
                                                        if (parts.length === 0) return '';
                                                        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
                                                        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {holidays.length > 0 && (
                <div className="calendar-legend glass-panel">
                    <h4 className="legend-title">Tipos de Feriados</h4>
                    <div className="legend-items">
                        {Array.from(new Set(holidays.map(h => h.type))).map(type => (
                            <div key={type} className="legend-item">
                                <div
                                    className="legend-color"
                                    style={{ backgroundColor: getTypeColor(type) }}
                                />
                                <span className="legend-label">
                                    {holidayTypeService.getTypeById(type)?.name || type}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedHoliday && !isAssignmentMode && (
                <HolidayDetailModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    holiday={selectedHoliday}
                    isCustom={'isCustom' in selectedHoliday ? (selectedHoliday as CustomHoliday).isCustom : false}
                />
            )}

            <AssignmentModal
                isOpen={isAssignmentModalOpen}
                onClose={() => {
                    setIsAssignmentModalOpen(false);
                    setRangeStart(null);
                    setRangeEnd(null);
                    setSelectedAssignmentId(null);
                }}
                selectionStart={rangeStart}
                selectionEnd={rangeEnd}
                existingAssignmentId={selectedAssignmentId}
            />

            {infoAssignments.length > 0 && !isAssignmentMode && (
                <div className="holiday-detail-overlay" onClick={() => setInfoAssignments([])} style={{ zIndex: 1100 }}>
                    <div className="holiday-detail-modal glass-panel" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
                        <button className="close-btn" onClick={() => setInfoAssignments([])}><X size={20} /></button>
                        <div className="modal-header" style={{ padding: '0 0 1.5rem 0' }}>
                            <div className="modal-type-badge" style={{ backgroundColor: infoAssignments[0].person?.color || '#3b82f6', color: 'white' }}>
                                <User size={16} />
                                <span>Persona Asignada</span>
                            </div>
                        </div>
                        <div className="modal-body" style={{ padding: '0' }}>
                            <h2 className="modal-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                                {infoAssignments.map(a => a.person?.name).join(', ')}
                            </h2>
                            <p style={{ margin: '0', color: 'var(--text-main)', fontSize: '1rem' }}>
                                <strong>Rango:</strong> {format(new Date(parseInt(infoAssignments[0].startDate.split('-')[0]), parseInt(infoAssignments[0].startDate.split('-')[1]) - 1, parseInt(infoAssignments[0].startDate.split('-')[2])), "d 'de' MMMM, yyyy", { locale: es })} al {format(new Date(parseInt(infoAssignments[0].endDate.split('-')[0]), parseInt(infoAssignments[0].endDate.split('-')[1]) - 1, parseInt(infoAssignments[0].endDate.split('-')[2])), "d 'de' MMMM, yyyy", { locale: es })}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
