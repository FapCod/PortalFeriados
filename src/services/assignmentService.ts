import { supabase } from './supabaseClient';
import type { Person } from './personService';

export interface Assignment {
    id: string;
    personId: string;
    person?: Person;
    countryCode: string;
    startDate: string;
    endDate: string;
}

export interface AssignmentFormData {
    personId: string;
    countryCode: string;
    startDate: string;
    endDate: string;
}

class AssignmentService {
    async getAssignments(countryCode: string, year: number): Promise<Assignment[]> {
        const { data, error } = await supabase
            .from('assignments')
            .select(`
                id,
                person_id,
                country_code,
                start_date,
                end_date,
                persons (id, name, color)
            `)
            .eq('country_code', countryCode)
            .gte('start_date', `${year}-01-01`)
            .lte('end_date', `${year}-12-31`);

        if (error) {
            console.error('Error fetching assignments:', error);
            return [];
        }

        return (data || []).map(row => ({
            id: row.id,
            personId: row.person_id,
            countryCode: row.country_code,
            startDate: row.start_date,
            endDate: row.end_date,
            person: Array.isArray(row.persons) ? row.persons[0] : row.persons
        }));
    }

    async addAssignment(data: AssignmentFormData): Promise<{ success: boolean, assignment?: Assignment, error?: string }> {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;

        const { data: inserted, error } = await supabase
            .from('assignments')
            .insert([{
                person_id: data.personId,
                country_code: data.countryCode,
                start_date: data.startDate,
                end_date: data.endDate,
                created_by: userId
            }])
            .select(`
                id,
                person_id,
                country_code,
                start_date,
                end_date,
                persons (id, name, color)
            `)
            .single();

        if (error) {
            console.error('Error adding assignment:', error);
            return { success: false, error: 'Error al agregar asignación' };
        }

        return { 
            success: true, 
            assignment: {
                id: inserted.id,
                personId: inserted.person_id,
                countryCode: inserted.country_code,
                startDate: inserted.start_date,
                endDate: inserted.end_date,
                person: Array.isArray(inserted.persons) ? inserted.persons[0] : inserted.persons
            } 
        };
    }

    async updateAssignment(id: string, data: AssignmentFormData): Promise<{ success: boolean, assignment?: Assignment, error?: string }> {
        const { data: updated, error } = await supabase
            .from('assignments')
            .update({
                person_id: data.personId,
                country_code: data.countryCode,
                start_date: data.startDate,
                end_date: data.endDate
            })
            .eq('id', id)
            .select(`
                id,
                person_id,
                country_code,
                start_date,
                end_date,
                persons (id, name, color)
            `)
            .single();

        if (error) {
            console.error('Error updating assignment:', error);
            return { success: false, error: 'Error al actualizar asignación' };
        }

        return { 
            success: true, 
            assignment: {
                id: updated.id,
                personId: updated.person_id,
                countryCode: updated.country_code,
                startDate: updated.start_date,
                endDate: updated.end_date,
                person: Array.isArray(updated.persons) ? updated.persons[0] : updated.persons
            } 
        };
    }

    async deleteAssignment(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('assignments')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting assignment:', error);
            return false;
        }
        return true;
    }
}

export const assignmentService = new AssignmentService();
