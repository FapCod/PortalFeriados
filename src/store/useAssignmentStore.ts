import { create } from 'zustand';
import { personService } from '../services/personService';
import type { Person, PersonFormData } from '../services/personService';
import { assignmentService } from '../services/assignmentService';
import type { Assignment, AssignmentFormData } from '../services/assignmentService';

interface AssignmentState {
    persons: Person[];
    assignments: Assignment[];
    isAssignmentMode: boolean;

    // Actions
    setAssignmentMode: (mode: boolean) => void;
    
    // Persons
    loadPersons: () => Promise<void>;
    addPerson: (data: PersonFormData) => Promise<{ success: boolean; errors?: string[] }>;
    updatePerson: (id: string, data: PersonFormData) => Promise<{ success: boolean; errors?: string[] }>;
    deletePerson: (id: string) => Promise<boolean>;

    // Assignments
    loadAssignments: (countryCode: string, year: number) => Promise<void>;
    addAssignment: (data: AssignmentFormData) => Promise<{ success: boolean; errors?: string[] }>;
    updateAssignment: (id: string, data: AssignmentFormData) => Promise<{ success: boolean; errors?: string[] }>;
    deleteAssignment: (id: string) => Promise<boolean>;
}

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
    persons: [],
    assignments: [],
    isAssignmentMode: false,

    setAssignmentMode: (mode) => set({ isAssignmentMode: mode }),

    loadPersons: async () => {
        const persons = await personService.getPersons();
        set({ persons });
    },

    addPerson: async (data) => {
        const result = await personService.addPerson(data);
        if (result.success) await get().loadPersons();
        return { success: result.success, errors: result.error ? [result.error] : undefined };
    },

    updatePerson: async (id, data) => {
        const result = await personService.updatePerson(id, data);
        if (result.success) {
            await get().loadPersons();
            set((state) => ({
                assignments: state.assignments.map(a => 
                    a.personId === id 
                        ? { ...a, person: { ...a.person, ...data } } as any
                        : a
                )
            }));
        }
        return { success: result.success, errors: result.error ? [result.error] : undefined };
    },

    deletePerson: async (id) => {
        const success = await personService.deletePerson(id);
        if (success) {
            await get().loadPersons();
            set((state) => ({
                assignments: state.assignments.filter(a => a.personId !== id)
            }));
        }
        return success;
    },

    loadAssignments: async (countryCode, year) => {
        const assignments = await assignmentService.getAssignments(countryCode, year);
        set({ assignments });
    },

    addAssignment: async (data) => {
        const result = await assignmentService.addAssignment(data);
        if (result.success) {
            await get().loadAssignments(data.countryCode, parseInt(data.startDate.split('-')[0]));
        }
        return { success: result.success, errors: result.error ? [result.error] : undefined };
    },

    updateAssignment: async (id, data) => {
        const result = await assignmentService.updateAssignment(id, data);
        if (result.success) {
            await get().loadAssignments(data.countryCode, parseInt(data.startDate.split('-')[0]));
        }
        return { success: result.success, errors: result.error ? [result.error] : undefined };
    },

    deleteAssignment: async (id) => {
        const success = await assignmentService.deleteAssignment(id);
        if (success) {
            set((state) => ({
                assignments: state.assignments.filter((a) => a.id !== id)
            }));
        }
        return success;
    }
}));
