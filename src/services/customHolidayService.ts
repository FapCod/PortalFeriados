import { supabase } from './supabaseClient';
import type { Holiday } from './holidayService';
import { holidayTypeService } from './holidayTypeService';

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

/**
 * Service for managing custom holidays in Supabase database
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
     * Validates custom holiday data
     */
    private async validateHolidayData(data: CustomHolidayFormData): Promise<{
        valid: boolean;
        errors: string[];
    }> {
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
        const allTypes = await holidayTypeService.getAllTypes();
        const validTypes = allTypes.map(t => t.id);

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
     * Retrieves all custom holidays, filtered by country and year from Supabase
     */
    async getCustomHolidays(countryCode?: string, year?: number): Promise<CustomHoliday[]> {
        try {
            let query = supabase
                .from('custom_holidays')
                .select('*, holiday_types(code)');

            if (countryCode) {
                query = query.eq('country_code', countryCode.toUpperCase());
            }

            if (year !== undefined) {
                // Query within date range for speed
                query = query
                    .gte('date', `${year}-01-01`)
                    .lte('date', `${year}-12-31`);
            }

            const { data, error } = await query;

            if (error) throw error;

            const mapped = (data || []).map((row) => {
                const [yr, mo, dy] = row.date.split('-').map(Number);
                return {
                    id: row.id,
                    name: row.name,
                    date: row.date,
                    start: new Date(yr, mo - 1, dy),
                    end: new Date(yr, mo - 1, dy + 1),
                    type: row.holiday_types?.code || 'public',
                    countryCode: row.country_code,
                    region: row.region || undefined,
                    rule: row.rule || 'custom',
                    isCustom: true as const,
                };
            });

            // Sort by start date ascending
            return mapped.sort((a, b) => a.start.getTime() - b.start.getTime());
        } catch (error) {
            console.error('Error loading custom holidays from Supabase:', error);
            return [];
        }
    }

    /**
     * Checks if a custom holiday already exists in the database
     */
    async isDuplicate(data: CustomHolidayFormData, excludeId?: string): Promise<boolean> {
        try {
            let query = supabase
                .from('custom_holidays')
                .select('id')
                .eq('country_code', data.countryCode.toUpperCase())
                .eq('date', data.date)
                .ilike('name', data.name.trim());

            if (excludeId) {
                query = query.neq('id', excludeId);
            }

            const { data: matches, error } = await query;

            if (error) throw error;
            return (matches || []).length > 0;
        } catch (error) {
            console.error('Error checking duplicate custom holidays:', error);
            return false;
        }
    }

    /**
     * Adds a new custom holiday to Supabase
     */
    async addCustomHoliday(data: CustomHolidayFormData): Promise<{
        success: boolean;
        holiday?: CustomHoliday;
        errors?: string[];
    }> {
        try {
            // Validate input
            const validation = await this.validateHolidayData(data);
            if (!validation.valid) {
                return { success: false, errors: validation.errors };
            }

            // Check for duplicates
            const isDup = await this.isDuplicate(data);
            if (isDup) {
                return {
                    success: false,
                    errors: [
                        'Ya existe un feriado con el mismo nombre y fecha para este país',
                    ],
                };
            }

            // Get type UUID from cache
            const typeDef = holidayTypeService.getTypeById(data.type);
            if (!typeDef || !typeDef.uuid) {
                return { success: false, errors: ['Tipo de feriado inválido'] };
            }

            // Get current user session
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id || null;

            // Sanitize inputs
            const sanitizedName = this.sanitizeInput(data.name);
            const sanitizedRegion = data.region ? this.sanitizeInput(data.region) : null;

            // Setup Dates (local timezone split)
            const [year, month, day] = data.date.split('-').map(Number);
            const start = new Date(year, month - 1, day);
            const end = new Date(year, month - 1, day + 1);

            const { data: inserted, error: insertError } = await supabase
                .from('custom_holidays')
                .insert([{
                    name: sanitizedName,
                    date: data.date,
                    start_date: start.toISOString(),
                    end_date: end.toISOString(),
                    type_id: typeDef.uuid,
                    country_code: data.countryCode.toUpperCase(),
                    region: sanitizedRegion,
                    rule: 'custom',
                    is_custom: true,
                    created_by: userId,
                }])
                .select('*, holiday_types(code)')
                .single();

            if (insertError) throw insertError;

            const [yr, mo, dy] = inserted.date.split('-').map(Number);
            const holiday: CustomHoliday = {
                id: inserted.id,
                name: inserted.name,
                date: inserted.date,
                start: new Date(yr, mo - 1, dy),
                end: new Date(yr, mo - 1, dy + 1),
                type: inserted.holiday_types?.code || 'public',
                countryCode: inserted.country_code,
                region: inserted.region || undefined,
                rule: inserted.rule || 'custom',
                isCustom: true as const,
            };

            return { success: true, holiday };
        } catch (error) {
            console.error('Error adding custom holiday to Supabase:', error);
            return { success: false, errors: ['Error de red o base de datos al guardar el feriado'] };
        }
    }

    /**
     * Updates an existing custom holiday in Supabase
     */
    async updateCustomHoliday(
        id: string,
        data: CustomHolidayFormData
    ): Promise<{
        success: boolean;
        holiday?: CustomHoliday;
        errors?: string[];
    }> {
        try {
            // Validate input
            const validation = await this.validateHolidayData(data);
            if (!validation.valid) {
                return { success: false, errors: validation.errors };
            }

            // Check for duplicates (excluding current holiday)
            const isDup = await this.isDuplicate(data, id);
            if (isDup) {
                return {
                    success: false,
                    errors: [
                        'Ya existe un feriado con el mismo nombre y fecha para este país',
                    ],
                };
            }

            // Get type UUID from cache
            const typeDef = holidayTypeService.getTypeById(data.type);
            if (!typeDef || !typeDef.uuid) {
                return { success: false, errors: ['Tipo de feriado inválido'] };
            }

            // Sanitize inputs
            const sanitizedName = this.sanitizeInput(data.name);
            const sanitizedRegion = data.region ? this.sanitizeInput(data.region) : null;

            // Setup Dates
            const [year, month, day] = data.date.split('-').map(Number);
            const start = new Date(year, month - 1, day);
            const end = new Date(year, month - 1, day + 1);

            const { data: updated, error: updateError } = await supabase
                .from('custom_holidays')
                .update({
                    name: sanitizedName,
                    date: data.date,
                    start_date: start.toISOString(),
                    end_date: end.toISOString(),
                    type_id: typeDef.uuid,
                    country_code: data.countryCode.toUpperCase(),
                    region: sanitizedRegion,
                })
                .eq('id', id)
                .select('*, holiday_types(code)')
                .single();

            if (updateError) throw updateError;

            const [yr, mo, dy] = updated.date.split('-').map(Number);
            const holiday: CustomHoliday = {
                id: updated.id,
                name: updated.name,
                date: updated.date,
                start: new Date(yr, mo - 1, dy),
                end: new Date(yr, mo - 1, dy + 1),
                type: updated.holiday_types?.code || 'public',
                countryCode: updated.country_code,
                region: updated.region || undefined,
                rule: updated.rule || 'custom',
                isCustom: true as const,
            };

            return { success: true, holiday };
        } catch (error) {
            console.error('Error updating custom holiday in Supabase:', error);
            return { success: false, errors: ['Error de red o base de datos al actualizar el feriado'] };
        }
    }

    /**
     * Deletes a custom holiday from Supabase
     */
    async deleteCustomHoliday(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('custom_holidays')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting custom holiday from Supabase:', error);
            return false;
        }
    }
}

export const customHolidayService = new CustomHolidayService();
