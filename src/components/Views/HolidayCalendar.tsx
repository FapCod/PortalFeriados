import React, { useMemo } from 'react';
import { useHolidayContext } from '../../context/HolidayContext';
import { holidayService } from '../../services/holidayService';
import type { Holiday } from '../../services/holidayService';
import type { CustomHoliday } from '../../services/customHolidayService';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle } from 'lucide-react';
import './HolidayCalendar.css';

/**
 * Calendar view component for displaying holidays
 */
export const HolidayCalendar: React.FC = () => {
    const { selectedCountry, selectedYear, filterType, customHolidays } = useHolidayContext();

    const holidays = useMemo(() => {
        if (!selectedCountry) return [];

        // Get official holidays
        const officialHolidays = holidayService.getHolidays(selectedCountry.code, selectedYear);
        const filteredOfficial = holidayService.filterByType(officialHolidays, filterType);

        // Get custom holidays for selected country/year
        const customForCountry = customHolidays.filter(
            h => h.countryCode === selectedCountry.code && new Date(h.date).getFullYear() === selectedYear
        );

        // Filter custom holidays by type
        const filteredCustom = filterType === 'all'
            ? customForCountry
            : customForCountry.filter(h => h.type === filterType);

        // Convert custom holidays to Holiday format and merge
        const customAsHolidays: Holiday[] = filteredCustom.map(ch => ({
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

    const getHolidayForDay = (day: Date): Holiday | undefined => {
        return holidays.find(holiday => isSameDay(new Date(holiday.start), day));
    };

    const getTypeColor = (type: string): string => {
        const colorMap: Record<string, string> = {
            public: '#dc2626',
            bank: '#2563eb',
            school: '#059669',
            optional: '#d97706',
            observance: '#7c3aed',
        };
        return colorMap[type] || '#4b5563';
    };

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
        <div className="holiday-calendar">
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
                                    const holiday = getHolidayForDay(day);
                                    const isWeekend = getDay(day) === 0 || getDay(day) === 6;

                                    return (
                                        <div
                                            key={dayIndex}
                                            className={`calendar-day ${isWeekend ? 'weekend' : ''} ${holiday ? 'has-holiday' : ''
                                                }`}
                                            style={
                                                holiday
                                                    ? { backgroundColor: `${getTypeColor(holiday.type)}15` }
                                                    : undefined
                                            }
                                            title={holiday ? holiday.name : undefined}
                                        >
                                            <span className="calendar-day-number">{format(day, 'd')}</span>
                                            {holiday && (
                                                <div
                                                    className="calendar-day-indicator"
                                                    style={{ backgroundColor: getTypeColor(holiday.type) }}
                                                />
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
                                    {type === 'public' ? 'Público' :
                                        type === 'bank' ? 'Bancario' :
                                            type === 'school' ? 'Escolar' :
                                                type === 'optional' ? 'Opcional' :
                                                    type === 'observance' ? 'Conmemoración' : type}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
