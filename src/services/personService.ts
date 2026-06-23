import { supabase } from './supabaseClient';

export interface Person {
    id: string;
    name: string;
    color: string;
}

export interface PersonFormData {
    name: string;
    color?: string;
}

class PersonService {
    async getPersons(): Promise<Person[]> {
        const { data, error } = await supabase
            .from('persons')
            .select('*')
            .order('name');
            
        if (error) {
            console.error('Error fetching persons:', error);
            return [];
        }
        return data || [];
    }

    async addPerson(data: PersonFormData): Promise<{ success: boolean, person?: Person, error?: string }> {
        const { data: inserted, error } = await supabase
            .from('persons')
            .insert([{ name: data.name, color: data.color || '#3b82f6' }])
            .select()
            .single();

        if (error) {
            console.error('Error adding person:', error);
            return { success: false, error: 'Error al agregar persona' };
        }
        return { success: true, person: inserted };
    }

    async updatePerson(id: string, data: PersonFormData): Promise<{ success: boolean, person?: Person, error?: string }> {
        const { data: updated, error } = await supabase
            .from('persons')
            .update({ name: data.name, color: data.color })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating person:', error);
            return { success: false, error: 'Error al actualizar persona' };
        }
        return { success: true, person: updated };
    }

    async deletePerson(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('persons')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting person:', error);
            return false;
        }
        return true;
    }
}

export const personService = new PersonService();
