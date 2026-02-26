import { create } from 'zustand';
import type { ViewMode } from '../context/HolidayContext';
import { HolidayType } from '../services/holidayService';
import type { Country } from '../services/holidayService';
import { customHolidayService } from '../services/customHolidayService';
import type { CustomHoliday, CustomHolidayFormData } from '../services/customHolidayService';

interface HolidayState {
    selectedCountry: Country | null;
    selectedYear: number;
    viewMode: ViewMode;
    filterType: HolidayType;
    customHolidays: CustomHoliday[];

    // Actions
    setSelectedCountry: (country: Country | null) => void;
    setSelectedYear: (year: number) => void;
    setViewMode: (mode: ViewMode) => void;
    setFilterType: (type: HolidayType) => void;

    // Custom Holiday Actions
    refreshCustomHolidays: () => void;
    addCustomHoliday: (data: CustomHolidayFormData) => { success: boolean; errors?: string[] };
    updateCustomHoliday: (id: string, data: CustomHolidayFormData) => { success: boolean; errors?: string[] };
    deleteCustomHoliday: (id: string) => boolean;
}

const currentYear = new Date().getFullYear();

export const useHolidayStore = create<HolidayState>((set, get) => ({
    // Initial State
    selectedCountry: null,
    selectedYear: currentYear,
    viewMode: 'list',
    filterType: HolidayType.ALL,
    customHolidays: [],

    // Selectors & Setters
    setSelectedCountry: (country) => {
        set({ selectedCountry: country });
        get().refreshCustomHolidays();
    },

    setSelectedYear: (year) => {
        set({ selectedYear: year });
        get().refreshCustomHolidays();
    },

    setViewMode: (mode) => set({ viewMode: mode }),
    setFilterType: (type) => set({ filterType: type }),

    // Thunks/Actions integration
    refreshCustomHolidays: () => {
        const state = get();
        const holidays = customHolidayService.getCustomHolidays(state.selectedCountry?.code, state.selectedYear);
        set({ customHolidays: holidays });
    },

    addCustomHoliday: (data) => {
        const result = customHolidayService.addCustomHoliday(data);
        if (result.success) get().refreshCustomHolidays();
        return result;
    },

    updateCustomHoliday: (id, data) => {
        const result = customHolidayService.updateCustomHoliday(id, data);
        if (result.success) get().refreshCustomHolidays();
        return result;
    },

    deleteCustomHoliday: (id) => {
        const success = customHolidayService.deleteCustomHoliday(id);
        if (success) get().refreshCustomHolidays();
        return success;
    }
}));
