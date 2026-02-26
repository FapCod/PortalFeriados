import React, { useMemo } from 'react';
import { useHolidayStore } from '../../../../store/useHolidayStore';
import { holidayService } from '../../../../services/holidayService';
import type { Holiday } from '../../../../services/holidayService';
import type { CustomHoliday } from '../../../../services/customHolidayService';
import { HolidayCard } from './HolidayCard';
import { AlertCircle, PartyPopper } from 'lucide-react';
import './HolidayList.css';

/**
 * List view component for displaying holidays
 * Groups holidays by month and merges custom holidays with official ones
 */
export const HolidayList: React.FC = () => {
    const { selectedCountry, selectedYear, filterType, customHolidays } = useHolidayStore();

    // Merge official and custom holidays
    const holidays = useMemo(() => {
        if (!selectedCountry) return [];

        const officialHolidays = holidayService.getHolidays(selectedCountry.code, selectedYear);
        const filteredOfficial = holidayService.filterByType(officialHolidays, filterType);

        // Merge and sort by date
        const allHolidays: Array<{ holiday: Holiday | CustomHoliday; isCustom: boolean }> = [
            ...filteredOfficial.map((h: Holiday) => ({ holiday: h, isCustom: false })),
            ...customHolidays.map((h: CustomHoliday) => ({ holiday: h, isCustom: true })),
        ];

        return allHolidays.sort((a, b) =>
            new Date(a.holiday.start).getTime() - new Date(b.holiday.start).getTime()
        );
    }, [selectedCountry, selectedYear, filterType, customHolidays]);

    const groupedHolidays = useMemo(() => {
        const groups: Record<string, typeof holidays> = {};

        holidays.forEach(({ holiday, isCustom }) => {
            const month = new Date(holiday.start).toLocaleString('es', { month: 'long' });
            const monthKey = month.charAt(0).toUpperCase() + month.slice(1);

            if (!groups[monthKey]) {
                groups[monthKey] = [];
            }
            groups[monthKey].push({ holiday, isCustom });
        });

        return groups;
    }, [holidays]);

    if (!selectedCountry) {
        return (
            <div className="holiday-list-empty">
                <AlertCircle size={48} className="empty-icon" />
                <h3 className="empty-title">Selecciona un país</h3>
                <p className="empty-description">
                    Elige un país de la lista para ver sus feriados
                </p>
            </div>
        );
    }

    if (holidays.length === 0) {
        return (
            <div className="holiday-list-empty">
                <PartyPopper size={48} className="empty-icon" />
                <h3 className="empty-title">No hay feriados</h3>
                <p className="empty-description">
                    No se encontraron feriados para los filtros seleccionados
                </p>
            </div>
        );
    }

    return (
        <div className="holiday-list">
            <div className="holiday-list-header">
                <h2 className="holiday-list-title">
                    Feriados en {selectedCountry.name} - {selectedYear}
                </h2>
                <span className="holiday-count">{holidays.length} feriados</span>
            </div>

            {Object.entries(groupedHolidays).map(([month, monthHolidays]) => (
                <div key={month} className="holiday-month-group">
                    <h3 className="month-title">{month}</h3>
                    <div className="holiday-grid">
                        {monthHolidays.map(({ holiday, isCustom }, index) => (
                            <HolidayCard
                                key={isCustom && 'id' in holiday ? holiday.id : `${holiday.date}-${index}`}
                                holiday={holiday}
                                isCustom={isCustom}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
