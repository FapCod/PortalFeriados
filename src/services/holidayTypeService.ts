import { supabase } from './supabaseClient';

/**
 * Holiday Type Definition
 */
export interface HolidayTypeDefinition {
    id: string; // Used in frontend (corresponds to 'code' in DB)
    uuid?: string; // DB UUID
    name: string;
    color: string;
    isPredefined: boolean;
}

// Predefined types fallback
const PREDEFINED_TYPES: HolidayTypeDefinition[] = [
    { id: 'public', name: 'Público', color: '#dc2626', isPredefined: true },
    { id: 'bank', name: 'Bancario', color: '#2563eb', isPredefined: true },
    { id: 'school', name: 'Escolar', color: '#059669', isPredefined: true },
    { id: 'optional', name: 'Opcional', color: '#d97706', isPredefined: true },
    { id: 'observance', name: 'Conmemoración', color: '#7c3aed', isPredefined: true },
];

/**
 * Service for managing holiday types using Supabase
 */
class HolidayTypeService {
    private cache: HolidayTypeDefinition[] = [...PREDEFINED_TYPES];

    /**
     * Get all holiday types from Supabase and cache them locally
     */
    async getAllTypes(): Promise<HolidayTypeDefinition[]> {
        try {
            const { data, error } = await supabase
                .from('holiday_types')
                .select('*')
                .order('is_predefined', { ascending: false })
                .order('name');

            if (error) throw error;

            const mapped = (data || []).map((row) => ({
                id: row.code,
                uuid: row.id,
                name: row.name,
                color: row.color,
                isPredefined: row.is_predefined,
            }));

            this.cache = mapped;
            return mapped;
        } catch (error) {
            console.error('Error loading holiday types from Supabase, returning cache:', error);
            return this.cache;
        }
    }

    /**
     * Get only custom types
     */
    async getCustomTypes(): Promise<HolidayTypeDefinition[]> {
        const allTypes = await this.getAllTypes();
        return allTypes.filter((t) => !t.isPredefined);
    }

    /**
     * Add a new custom holiday type to Supabase
     */
    async addType(name: string, color: string): Promise<HolidayTypeDefinition> {
        // Validation
        if (!name || name.trim().length === 0) {
            throw new Error('El nombre del tipo es requerido');
        }

        if (!color || !color.match(/^#[0-9A-Fa-f]{6}$/)) {
            throw new Error('Color inválido (debe ser formato hex #RRGGBB)');
        }

        const trimmedName = name.trim();

        // Check for duplicate names locally (case insensitive)
        const duplicate = this.cache.find(
            (t) => t.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (duplicate) {
            throw new Error(`Ya existe un tipo con el nombre "${trimmedName}"`);
        }

        const code = `custom_${Date.now()}`;

        const { data, error } = await supabase
            .from('holiday_types')
            .insert([{
                code,
                name: trimmedName,
                color: color.toUpperCase(),
                is_predefined: false,
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding holiday type to Supabase:', error);
            throw new Error('No se pudo crear el tipo de feriado en la base de datos');
        }

        const newType: HolidayTypeDefinition = {
            id: data.code,
            uuid: data.id,
            name: data.name,
            color: data.color,
            isPredefined: data.is_predefined,
        };

        // Update local cache
        this.cache.push(newType);
        return newType;
    }

    /**
     * Update an existing custom type in Supabase
     */
    async updateType(id: string, name: string, color: string): Promise<HolidayTypeDefinition> {
        const trimmedName = name.trim();

        // Find locally first
        const existing = this.cache.find((t) => t.id === id);
        if (!existing) {
            throw new Error('Tipo de feriado no encontrado');
        }

        if (existing.isPredefined) {
            throw new Error('No se pueden modificar tipos predefinidos');
        }

        // Validation
        if (!name || trimmedName.length === 0) {
            throw new Error('El nombre del tipo es requerido');
        }

        if (!color || !color.match(/^#[0-9A-Fa-f]{6}$/)) {
            throw new Error('Color inválido (debe ser formato hex #RRGGBB)');
        }

        // Check duplicates excluding current
        const duplicate = this.cache.find(
            (t) => t.id !== id && t.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (duplicate) {
            throw new Error(`Ya existe un tipo con el nombre "${trimmedName}"`);
        }

        const { data, error } = await supabase
            .from('holiday_types')
            .update({
                name: trimmedName,
                color: color.toUpperCase(),
            })
            .eq('code', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating holiday type in Supabase:', error);
            throw new Error('No se pudo actualizar el tipo de feriado en la base de datos');
        }

        const updatedType: HolidayTypeDefinition = {
            id: data.code,
            uuid: data.id,
            name: data.name,
            color: data.color,
            isPredefined: data.is_predefined,
        };

        // Update local cache
        const index = this.cache.findIndex((t) => t.id === id);
        if (index !== -1) {
            this.cache[index] = updatedType;
        }

        return updatedType;
    }

    /**
     * Delete a custom holiday type from Supabase
     */
    async deleteType(id: string): Promise<void> {
        const existing = this.cache.find((t) => t.id === id);
        if (!existing) {
            throw new Error('Tipo de feriado no encontrado');
        }

        if (existing.isPredefined) {
            throw new Error('No se pueden eliminar tipos predefinidos');
        }

        const { error } = await supabase
            .from('holiday_types')
            .delete()
            .eq('code', id);

        if (error) {
            console.error('Error deleting holiday type from Supabase:', error);
            throw new Error('No se pudo eliminar el tipo de feriado. Verifique si está en uso por algún feriado personalizado.');
        }

        // Update local cache
        this.cache = this.cache.filter((t) => t.id !== id);
    }

    /**
     * Get type by ID (synchronous from cache)
     */
    getTypeById(id: string): HolidayTypeDefinition | undefined {
        return this.cache.find((t) => t.id === id);
    }

    /**
     * Get color for a type ID (synchronous from cache)
     */
    getColorForType(typeId: string): string {
        const type = this.getTypeById(typeId);
        return type?.color || '#6b7280'; // Default gray
    }
}

export const holidayTypeService = new HolidayTypeService();
