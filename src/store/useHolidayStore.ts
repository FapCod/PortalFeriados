import { create } from 'zustand';
import type { ViewMode } from '../context/HolidayContext';
import { HolidayType } from '../services/holidayService';
import type { Country } from '../services/holidayService';
import { customHolidayService } from '../services/customHolidayService';
import type { CustomHoliday, CustomHolidayFormData } from '../services/customHolidayService';
import { holidayTypeService } from '../services/holidayTypeService';
import type { HolidayTypeDefinition } from '../services/holidayTypeService';

interface HolidayState {
    selectedCountry: Country | null;
    selectedYear: number;
    viewMode: ViewMode;
    filterType: HolidayType;
    customHolidays: CustomHoliday[];
    holidayTypes: HolidayTypeDefinition[];

    // Actions
    setSelectedCountry: (country: Country | null) => void;
    setSelectedYear: (year: number) => void;
    setViewMode: (mode: ViewMode) => void;
    setFilterType: (type: HolidayType) => void;
    loadHolidayTypes: () => Promise<void>;

    // Custom Holiday Actions
    refreshCustomHolidays: () => Promise<void>;
    addCustomHoliday: (data: CustomHolidayFormData) => Promise<{ success: boolean; errors?: string[] }>;
    updateCustomHoliday: (id: string, data: CustomHolidayFormData) => Promise<{ success: boolean; errors?: string[] }>;
    deleteCustomHoliday: (id: string) => Promise<boolean>;
}

const currentYear = new Date().getFullYear();

export const useHolidayStore = create<HolidayState>((set, get) => ({
    // Initial State
    selectedCountry: null,
    selectedYear: currentYear,
    viewMode: 'list',
    filterType: HolidayType.ALL,
    customHolidays: [],
    holidayTypes: [],

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

    // Fetch Holiday Types from Supabase
    loadHolidayTypes: async () => {
        const types = await holidayTypeService.getAllTypes();
        set({ holidayTypes: types });
    },

    // Thunks/Actions integration with Supabase
    refreshCustomHolidays: async () => {
        const state = get();
        const holidays = await customHolidayService.getCustomHolidays(state.selectedCountry?.code, state.selectedYear);
        set({ customHolidays: holidays });
    },

    addCustomHoliday: async (data) => {
        const result = await customHolidayService.addCustomHoliday(data);
        if (result.success) await get().refreshCustomHolidays();
        return result;
    },

    updateCustomHoliday: async (id, data) => {
        const result = await customHolidayService.updateCustomHoliday(id, data);
        if (result.success) await get().refreshCustomHolidays();
        return result;
    },

    deleteCustomHoliday: async (id) => {
        const success = await customHolidayService.deleteCustomHoliday(id);
        if (success) await get().refreshCustomHolidays();
        return success;
    }
}));
