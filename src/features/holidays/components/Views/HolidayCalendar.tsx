import React, { useMemo, useRef } from 'react';
import { useHolidayStore } from '../../../../store/useHolidayStore';
import { holidayService } from '../../../../services/holidayService';
import type { Holiday } from '../../../../services/holidayService';
import type { CustomHoliday } from '../../../../services/customHolidayService';
import { holidayTypeService } from '../../../../services/holidayTypeService';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './HolidayCalendar.css';

/**
 * Calendar view component for displaying holidays
 */
export const HolidayCalendar: React.FC = () => {
    const { selectedCountry, selectedYear, filterType, customHolidays } = useHolidayStore();
    const containerRef = useRef<HTMLDivElement>(null);

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
        return Array.from({ length: 12 }, (_, i) => {
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
    }, [selectedYear]);

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

    const getTypeColor = (type: string): string => {
        return holidayTypeService.getColorForType(type);
    };

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
            <div className="calendar-header">
                <h2 className="calendar-title">
                    Calendario de Feriados - {selectedCountry.name} {selectedYear}
                </h2>
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
                                    const isWeekend = getDay(day) === 0 || getDay(day) === 6;
                                    const hasHolidays = dayHolidays.length > 0;

                                    return (
                                        <div
                                            key={dayIndex}
                                            className={`calendar-day ${isWeekend ? 'weekend' : ''} ${hasHolidays ? 'has-holiday' : ''
                                                }`}
                                            style={
                                                hasHolidays
                                                    ? { backgroundColor: `${getTypeColor(dayHolidays[0].type)}15` }
                                                    : undefined
                                            }
                                            title={hasHolidays ? dayHolidays.map(h => h.name).join(', ') : undefined}
                                        >
                                            <span className="calendar-day-number">{format(day, 'd')}</span>
                                            {hasHolidays && (
                                                <div className="calendar-day-indicators">
                                                    {dayHolidays.slice(0, 3).map((holiday, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="calendar-day-indicator"
                                                            style={{ backgroundColor: getTypeColor(holiday.type) }}
                                                            title={holiday.name}
                                                        />
                                                    ))}
                                                    {dayHolidays.length > 3 && (
                                                        <span className="calendar-day-more">+{dayHolidays.length - 3}</span>
                                                    )}
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
        </div>
    );
};
