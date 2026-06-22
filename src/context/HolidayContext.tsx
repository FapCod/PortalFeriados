import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { HolidayType } from '../services/holidayService';
import type { Country } from '../services/holidayService';
import { customHolidayService } from '../services/customHolidayService';
import type { CustomHoliday, CustomHolidayFormData } from '../services/customHolidayService';

export type ViewMode = 'list' | 'calendar';

interface HolidayContextState {
    selectedCountry: Country | null;
    selectedYear: number;
    viewMode: ViewMode;
    filterType: HolidayType;
    customHolidays: CustomHoliday[];
    setSelectedCountry: (country: Country | null) => void;
    setSelectedYear: (year: number) => void;
    setViewMode: (mode: ViewMode) => void;
    setFilterType: (type: HolidayType) => void;
    addCustomHoliday: (data: CustomHolidayFormData) => Promise<{ success: boolean; errors?: string[] }>;
    updateCustomHoliday: (id: string, data: CustomHolidayFormData) => Promise<{ success: boolean; errors?: string[] }>;
    deleteCustomHoliday: (id: string) => Promise<boolean>;
    refreshCustomHolidays: () => Promise<void>;
}

const HolidayContext = createContext<HolidayContextState | undefined>(undefined);

interface HolidayProviderProps {
    children: ReactNode;
}

export const HolidayProvider: React.FC<HolidayProviderProps> = ({ children }) => {
    const currentYear = new Date().getFullYear();

    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [filterType, setFilterType] = useState<HolidayType>(HolidayType.ALL);
    const [customHolidays, setCustomHolidays] = useState<CustomHoliday[]>([]);

    const refreshCustomHolidays = useCallback(async () => {
        const holidays = await customHolidayService.getCustomHolidays(selectedCountry?.code, selectedYear);
        setCustomHolidays(holidays);
    }, [selectedCountry, selectedYear]);

    useEffect(() => {
        refreshCustomHolidays();
    }, [selectedCountry, selectedYear, refreshCustomHolidays]);

    const addCustomHoliday = useCallback(async (data: CustomHolidayFormData) => {
        const result = await customHolidayService.addCustomHoliday(data);
        if (result.success) refreshCustomHolidays();
        return result;
    }, [refreshCustomHolidays]);

    const updateCustomHoliday = useCallback(async (id: string, data: CustomHolidayFormData) => {
        const result = await customHolidayService.updateCustomHoliday(id, data);
        if (result.success) refreshCustomHolidays();
        return result;
    }, [refreshCustomHolidays]);

    const deleteCustomHoliday = useCallback(async (id: string) => {
        const success = await customHolidayService.deleteCustomHoliday(id);
        if (success) refreshCustomHolidays();
        return success;
    }, [refreshCustomHolidays]);

    const value = useMemo(() => ({
        selectedCountry, selectedYear, viewMode, filterType, customHolidays,
        setSelectedCountry, setSelectedYear, setViewMode, setFilterType,
        addCustomHoliday, updateCustomHoliday, deleteCustomHoliday, refreshCustomHolidays,
    }), [selectedCountry, selectedYear, viewMode, filterType, customHolidays, addCustomHoliday, updateCustomHoliday, deleteCustomHoliday, refreshCustomHolidays]);

    return <HolidayContext.Provider value={value}>{children}</HolidayContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHolidayContext = (): HolidayContextState => {
    const context = useContext(HolidayContext);
    if (!context) throw new Error('useHolidayContext must be used within a HolidayProvider');
    return context;
};
