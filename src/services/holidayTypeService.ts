/**
 * Holiday Type Service
 * Manages custom holiday types with CRUD operations
 */

export interface HolidayTypeDefinition {
    id: string;
    name: string;
    color: string;
    isPredefined: boolean;
}

const STORAGE_KEY = 'holiday_types';

// Predefined types that cannot be deleted
const PREDEFINED_TYPES: HolidayTypeDefinition[] = [
    { id: 'public', name: 'Público', color: '#dc2626', isPredefined: true },
    { id: 'bank', name: 'Bancario', color: '#2563eb', isPredefined: true },
    { id: 'school', name: 'Escolar', color: '#059669', isPredefined: true },
    { id: 'optional', name: 'Opcional', color: '#d97706', isPredefined: true },
    { id: 'observance', name: 'Conmemoración', color: '#7c3aed', isPredefined: true },
];

class HolidayTypeService {
    /**
     * Get all holiday types (predefined + custom)
     */
    getAllTypes(): HolidayTypeDefinition[] {
        const customTypes = this.getCustomTypes();
        return [...PREDEFINED_TYPES, ...customTypes];
    }

    /**
     * Get only custom types
     */
    getCustomTypes(): HolidayTypeDefinition[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading custom holiday types:', error);
            return [];
        }
    }

    /**
     * Add a new custom holiday type
     */
    addType(name: string, color: string): HolidayTypeDefinition {
        // Validation
        if (!name || name.trim().length === 0) {
            throw new Error('El nombre del tipo es requerido');
        }

        if (!color || !color.match(/^#[0-9A-Fa-f]{6}$/)) {
            throw new Error('Color inválido (debe ser formato hex #RRGGBB)');
        }

        const trimmedName = name.trim();

        // Check for duplicate names (case insensitive)
        const allTypes = this.getAllTypes();
        const duplicate = allTypes.find(
            t => t.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (duplicate) {
            throw new Error(`Ya existe un tipo con el nombre "${trimmedName}"`);
        }

        // Create new type
        const newType: HolidayTypeDefinition = {
            id: `custom_${Date.now()}`,
            name: trimmedName,
            color: color.toUpperCase(),
            isPredefined: false,
        };

        // Save
        const customTypes = this.getCustomTypes();
        customTypes.push(newType);
        this.saveCustomTypes(customTypes);

        return newType;
    }

    /**
     * Update an existing custom type
     */
    updateType(id: string, name: string, color: string): HolidayTypeDefinition {
        const customTypes = this.getCustomTypes();
        const index = customTypes.findIndex(t => t.id === id);

        if (index === -1) {
            throw new Error('Tipo de feriado no encontrado');
        }

        // Check if it's predefined (shouldn't be in custom list but extra safety)
        if (customTypes[index].isPredefined) {
            throw new Error('No se pueden modificar tipos predefinidos');
        }

        // Validation
        if (!name || name.trim().length === 0) {
            throw new Error('El nombre del tipo es requerido');
        }

        if (!color || !color.match(/^#[0-9A-Fa-f]{6}$/)) {
            throw new Error('Color inválido (debe ser formato hex #RRGGBB)');
        }

        const trimmedName = name.trim();

        // Check for duplicate names (excluding current)
        const allTypes = this.getAllTypes();
        const duplicate = allTypes.find(
            t => t.id !== id && t.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (duplicate) {
            throw new Error(`Ya existe un tipo con el nombre "${trimmedName}"`);
        }

        // Update
        customTypes[index] = {
            ...customTypes[index],
            name: trimmedName,
            color: color.toUpperCase(),
        };

        this.saveCustomTypes(customTypes);
        return customTypes[index];
    }

    /**
     * Delete a custom holiday type
     */
    deleteType(id: string): void {
        // Check if it's predefined
        const predefined = PREDEFINED_TYPES.find(t => t.id === id);
        if (predefined) {
            throw new Error('No se pueden eliminar tipos predefinidos');
        }

        const customTypes = this.getCustomTypes();
        const filtered = customTypes.filter(t => t.id !== id);

        if (filtered.length === customTypes.length) {
            throw new Error('Tipo de feriado no encontrado');
        }

        this.saveCustomTypes(filtered);
    }

    /**
     * Get type by ID
     */
    getTypeById(id: string): HolidayTypeDefinition | undefined {
        return this.getAllTypes().find(t => t.id === id);
    }

    /**
     * Get color for a type ID
     */
    getColorForType(typeId: string): string {
        const type = this.getTypeById(typeId);
        return type?.color || '#6b7280'; // Default gray
    }

    /**
     * Save custom types to localStorage
     */
    private saveCustomTypes(types: HolidayTypeDefinition[]): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(types));
        } catch (error) {
            console.error('Error saving custom holiday types:', error);
            throw new Error('Error guardando tipos de feriado');
        }
    }
}

export const holidayTypeService = new HolidayTypeService();
