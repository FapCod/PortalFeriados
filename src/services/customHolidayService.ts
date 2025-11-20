import type { Holiday } from './holidayService';

/**
 * Custom holiday with additional metadata
 */
export interface CustomHoliday extends Omit<Holiday, 'date'> {
    id: string;
    date: string;
    name: string;
    start: Date;
    end: Date;
    type: string;
    countryCode: string;
    region?: string;
    rule: string;
    isCustom: true;
}

/**
 * Form data for creating/editing custom holidays
 */
export interface CustomHolidayFormData {
    name: string;
    date: string;
    countryCode: string;
    region?: string;
    type: string;
}

const STORAGE_KEY = 'portal_feriados_custom_holidays';

/**
 * Service for managing custom holidays in localStorage
 * Implements input validation and XSS prevention
 */
class CustomHolidayService {
    /**
     * Sanitizes input string to prevent XSS attacks
     */
    private sanitizeInput(input: string): string {
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .trim();
    }

    /**
     * Generates a unique ID for custom holidays
     */
    private generateId(): string {
        return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Validates custom holiday data
     */
    private validateHolidayData(data: CustomHolidayFormData): {
        valid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        // Name validation
        if (!data.name || data.name.trim().length === 0) {
            errors.push('El nombre del feriado es requerido');
        } else if (data.name.length > 100) {
            errors.push('El nombre no puede exceder 100 caracteres');
        }

        // Date validation
        if (!data.date) {
            errors.push('La fecha es requerida');
        } else {
            const date = new Date(data.date);
            if (isNaN(date.getTime())) {
                errors.push('Fecha inválida');
            }
        }

        // Country code validation
        if (!data.countryCode || data.countryCode.length !== 2) {
            errors.push('Código de país inválido');
        }

        // Type validation
        const validTypes = ['public', 'bank', 'school', 'optional', 'observance'];
        if (!data.type || !validTypes.includes(data.type)) {
            errors.push('Tipo de feriado inválido');
        }

        // Region validation (optional but must be valid if provided)
        if (data.region && data.region.length > 100) {
            errors.push('La región no puede exceder 100 caracteres');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Loads custom holidays from localStorage
     */
    private loadFromStorage(): CustomHoliday[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return [];

            const parsed = JSON.parse(stored);
            if (!Array.isArray(parsed)) return [];

            // Validate and reconstruct Date objects
            return parsed
                .map((holiday: unknown) => {
                    const h = holiday as Record<string, unknown>;
                    return {
                        ...h,
                        start: new Date(h.start as string),
                        end: new Date(h.end as string),
                        isCustom: true,
                    };
                })
                .filter((h: unknown) => {
                    const holiday = h as CustomHoliday;
                    return (
                        holiday.id &&
                        holiday.name &&
                        holiday.countryCode &&
                        !isNaN(holiday.start.getTime())
                    );
                }) as CustomHoliday[];
        } catch (error) {
            console.error('Error loading custom holidays:', error);
            return [];
        }
    }

    /**
     * Saves custom holidays to localStorage
     */
    private saveToStorage(holidays: CustomHoliday[]): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(holidays));
        } catch (error) {
            console.error('Error saving custom holidays:', error);
            throw new Error(
                'No se pudo guardar el feriado. Espacio de almacenamiento insuficiente.'
            );
        }
    }

    /**
     * Retrieves all custom holidays, optionally filtered by country and year
     */
    getCustomHolidays(countryCode?: string, year?: number): CustomHoliday[] {
        let holidays = this.loadFromStorage();

        if (countryCode) {
            holidays = holidays.filter((h) => h.countryCode === countryCode);
        }

        if (year !== undefined) {
            holidays = holidays.filter((h) => h.start.getFullYear() === year);
        }

        return holidays.sort((a, b) => a.start.getTime() - b.start.getTime());
    }

    /**
     * Checks if a custom holiday already exists
     */
    isDuplicate(data: CustomHolidayFormData, excludeId?: string): boolean {
        const holidays = this.loadFromStorage();
        return holidays.some(
            (h) =>
                h.id !== excludeId &&
                h.countryCode === data.countryCode &&
                h.date === data.date &&
                h.name.toLowerCase() === data.name.toLowerCase()
        );
    }

    /**
     * Adds a new custom holiday
     */
    addCustomHoliday(data: CustomHolidayFormData): {
        success: boolean;
        holiday?: CustomHoliday;
        errors?: string[];
    } {
        // Validate input
        const validation = this.validateHolidayData(data);
        if (!validation.valid) {
            return { success: false, errors: validation.errors };
        }

        // Check for duplicates
        if (this.isDuplicate(data)) {
            return {
                success: false,
                errors: [
                    'Ya existe un feriado con el mismo nombre y fecha para este país',
                ],
            };
        }

        // Sanitize inputs
        const sanitizedData = {
            name: this.sanitizeInput(data.name),
            countryCode: data.countryCode.toUpperCase(),
            region: data.region ? this.sanitizeInput(data.region) : undefined,
            type: data.type,
            date: data.date,
        };

        // Create holiday object with local timezone
        // Parse date as local timezone to avoid timezone conversion issues
        const [year, month, day] = sanitizedData.date.split('-').map(Number);
        const holidayDate = new Date(year, month - 1, day); // month is 0-indexed
        const customHoliday: CustomHoliday = {
            id: this.generateId(),
            date: sanitizedData.date,
            start: holidayDate,
            end: new Date(year, month - 1, day + 1),
            name: sanitizedData.name,
            type: sanitizedData.type,
            countryCode: sanitizedData.countryCode,
            region: sanitizedData.region,
            rule: 'custom',
            isCustom: true,
        };

        // Save to storage
        const holidays = this.loadFromStorage();
        holidays.push(customHoliday);
        this.saveToStorage(holidays);

        return { success: true, holiday: customHoliday };
    }

    /**
     * Updates an existing custom holiday
     */
    updateCustomHoliday(
        id: string,
        data: CustomHolidayFormData
    ): {
        success: boolean;
        holiday?: CustomHoliday;
        errors?: string[];
    } {
        // Validate input
        const validation = this.validateHolidayData(data);
        if (!validation.valid) {
            return { success: false, errors: validation.errors };
        }

        // Check for duplicates (excluding current holiday)
        if (this.isDuplicate(data, id)) {
            return {
                success: false,
                errors: [
                    'Ya existe un feriado con el mismo nombre y fecha para este país',
                ],
            };
        }

        const holidays = this.loadFromStorage();
        const index = holidays.findIndex((h) => h.id === id);

        if (index === -1) {
            return { success: false, errors: ['Feriado no encontrado'] };
        }

        // Sanitize inputs
        const sanitizedData = {
            name: this.sanitizeInput(data.name),
            countryCode: data.countryCode.toUpperCase(),
            region: data.region ? this.sanitizeInput(data.region) : undefined,
            type: data.type,
            date: data.date,
        };

        // Update holiday with local timezone
        const [year, month, day] = sanitizedData.date.split('-').map(Number);
        const holidayDate = new Date(year, month - 1, day);
        const updatedHoliday: CustomHoliday = {
            ...holidays[index],
            date: sanitizedData.date,
            start: holidayDate,
            end: new Date(year, month - 1, day + 1),
            name: sanitizedData.name,
            type: sanitizedData.type,
            countryCode: sanitizedData.countryCode,
            region: sanitizedData.region,
        };

        holidays[index] = updatedHoliday;
        this.saveToStorage(holidays);

        return { success: true, holiday: updatedHoliday };
    }

    /**
     * Deletes a custom holiday
     */
    deleteCustomHoliday(id: string): boolean {
        const holidays = this.loadFromStorage();
        const filtered = holidays.filter((h) => h.id !== id);

        if (filtered.length === holidays.length) {
            return false; // Holiday not found
        }

        this.saveToStorage(filtered);
        return true;
    }

    /**
     * Clears all custom holidays (for testing/debugging)
     */
    clearAll(): void {
        localStorage.removeItem(STORAGE_KEY);
    }
}

export const customHolidayService = new CustomHolidayService();
