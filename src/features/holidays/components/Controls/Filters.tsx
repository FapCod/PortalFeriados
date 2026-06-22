import React from 'react';
import { useHolidayStore } from '../../../../store/useHolidayStore';
import { holidayService, HolidayType } from '../../../../services/holidayService';
import type { Country } from '../../../../services/holidayService';
import { Calendar as CalendarIcon, List, Filter } from 'lucide-react';
import './Filters.css';

/**
 * Filters component for country, year, and view mode selection
 */
export const Filters: React.FC = () => {
    const {
        selectedCountry,
        selectedYear,
        viewMode,
        filterType,
        setSelectedCountry,
        setSelectedYear,
        setViewMode,
        setFilterType,
        holidayTypes: storeTypes,
    } = useHolidayStore();

    const countries = holidayService.getSupportedCountries();
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    const holidayTypes = [
        { value: HolidayType.ALL, label: 'Todos' },
        ...storeTypes.map((t: { id: string; name: string }) => ({
            value: t.id,
            label: t.name
        }))
    ];

    return (
        <div className="filters glass-panel">
            <div className="filters-header">
                <Filter size={20} />
                <h2 className="filters-title">Filtros</h2>
            </div>

            <div className="filters-grid">
                {/* Country Selection */}
                <div className="filter-group">
                    <label htmlFor="country-select" className="filter-label">
                        País
                    </label>
                    <select
                        id="country-select"
                        className="filter-select"
                        value={selectedCountry?.code || ''}
                        onChange={(e) => {
                            const country = countries.find((c: Country) => c.code === e.target.value);
                            setSelectedCountry(country || null);
                        }}
                    >
                        <option value="">Selecciona un país</option>
                        {countries.map((country: Country) => (
                            <option key={country.code} value={country.code}>
                                {country.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Year Selection */}
                <div className="filter-group">
                    <label htmlFor="year-select" className="filter-label">
                        Año
                    </label>
                    <select
                        id="year-select"
                        className="filter-select"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Holiday Type Filter */}
                <div className="filter-group">
                    <label htmlFor="type-select" className="filter-label">
                        Tipo de Feriado
                    </label>
                    <select
                        id="type-select"
                        className="filter-select"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as HolidayType)}
                    >
                        {holidayTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* View Mode Toggle */}
                <div className="filter-group">
                    <label className="filter-label">Vista</label>
                    <div className="view-toggle">
                        <button
                            className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            aria-label="Vista de lista"
                        >
                            <List size={18} />
                            <span>Lista</span>
                        </button>
                        <button
                            className={`view-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                            onClick={() => setViewMode('calendar')}
                            aria-label="Vista de calendario"
                        >
                            <CalendarIcon size={18} />
                            <span>Calendario</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
