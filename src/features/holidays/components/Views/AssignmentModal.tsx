import React, { useState, useEffect } from 'react';
import { useAssignmentStore } from '../../../../store/useAssignmentStore';
import { useHolidayStore } from '../../../../store/useHolidayStore';
import { personService } from '../../../../services/personService';
import { X, UserPlus, Trash2, Save } from 'lucide-react';
import { format } from 'date-fns';
import './HolidayDetailModal.css';

interface AssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectionStart: Date | null;
    selectionEnd: Date | null;
    existingAssignmentId?: string | null;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({ 
    isOpen, onClose, selectionStart, selectionEnd, existingAssignmentId 
}) => {
    const { persons, assignments, addAssignment, updateAssignment, deleteAssignment, loadPersons, updatePerson } = useAssignmentStore();
    const { selectedCountry } = useHolidayStore();
    
    const [personId, setPersonId] = useState('');
    const [isCreatingPerson, setIsCreatingPerson] = useState(false);
    const [newPersonName, setNewPersonName] = useState('');
    const [newPersonColor, setNewPersonColor] = useState('#3b82f6');
    const [editPersonColor, setEditPersonColor] = useState('#3b82f6');
    
    const [startDateStr, setStartDateStr] = useState('');
    const [endDateStr, setEndDateStr] = useState('');
    
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (existingAssignmentId) {
            const assignment = assignments.find(a => a.id === existingAssignmentId);
            if (assignment) {
                setPersonId(assignment.personId);
            }
        } else {
            setPersonId('');
        }
        setIsCreatingPerson(false);
        setNewPersonName('');
    }, [existingAssignmentId, assignments, isOpen]);

    useEffect(() => {
        if (personId) {
            const p = persons.find(p => p.id === personId);
            if (p) setEditPersonColor(p.color);
        }
    }, [personId, persons]);

    useEffect(() => {
        if (selectionStart && selectionEnd) {
            setStartDateStr(format(selectionStart, "yyyy-MM-dd"));
            setEndDateStr(format(selectionEnd, "yyyy-MM-dd"));
        }
    }, [selectionStart, selectionEnd, isOpen]);

    if (!isOpen || !selectedCountry || !selectionStart || !selectionEnd) return null;

    const handleSave = async () => {
        if (!personId && !isCreatingPerson) return;
        if (isCreatingPerson && !newPersonName.trim()) return;
        if (!startDateStr || !endDateStr) {
            alert('Por favor selecciona un rango de fechas válido.');
            return;
        }
        if (startDateStr > endDateStr) {
            alert('La fecha de inicio no puede ser mayor que la fecha de fin.');
            return;
        }

        setLoading(true);
        try {
            let finalPersonId = personId;

            if (isCreatingPerson) {
                const res = await personService.addPerson({ name: newPersonName, color: newPersonColor });
                if (res.success && res.person) {
                    finalPersonId = res.person.id;
                    await loadPersons();
                } else {
                    alert('Error al crear persona');
                    setLoading(false);
                    return;
                }
            } else if (personId) {
                const originalPerson = persons.find(p => p.id === personId);
                if (originalPerson && originalPerson.color !== editPersonColor) {
                    await updatePerson(personId, { name: originalPerson.name, color: editPersonColor });
                }
            }

            if (existingAssignmentId) {
                await updateAssignment(existingAssignmentId, {
                    personId: finalPersonId,
                    countryCode: selectedCountry.code,
                    startDate: startDateStr,
                    endDate: endDateStr
                });
            } else {
                await addAssignment({
                    personId: finalPersonId,
                    countryCode: selectedCountry.code,
                    startDate: startDateStr,
                    endDate: endDateStr
                });
            }
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!existingAssignmentId) return;
        if (confirm('¿Estás seguro de eliminar esta asignación?')) {
            setLoading(true);
            await deleteAssignment(existingAssignmentId);
            setLoading(false);
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="modal-header">
                    <h3 className="modal-title">
                        {existingAssignmentId ? 'Editar Asignación' : 'Nueva Asignación'}
                    </h3>
                </div>

                <div className="modal-body">
                    <div className="modal-info-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <div className="info-icon-wrapper">
                                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>📅</span>
                            </div>
                            <span className="info-label">Rango Seleccionado</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', flexWrap: 'wrap' }}>
                            <input 
                                type="date" 
                                className="form-input"
                                value={startDateStr}
                                onChange={(e) => setStartDateStr(e.target.value)}
                                style={{ flex: '1 1 120px', minWidth: '120px', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                            />
                            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>al</span>
                            <input 
                                type="date" 
                                className="form-input"
                                value={endDateStr}
                                onChange={(e) => setEndDateStr(e.target.value)}
                                style={{ flex: '1 1 120px', minWidth: '120px', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>

                    <div className="modal-info-item" style={{ marginTop: '1rem', flexDirection: 'column', gap: '1rem' }}>
                        <div className="info-content" style={{ width: '100%' }}>
                            <span className="info-label">Persona Asignada</span>
                            
                            {!isCreatingPerson ? (
                                <div style={{ display: 'flex', width: '100%', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                    <select 
                                        className="form-input" 
                                        value={personId} 
                                        onChange={(e) => setPersonId(e.target.value)}
                                        style={{ flex: '1 1 180px', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '1rem', cursor: 'pointer' }}
                                    >
                                        <option value="">Seleccionar Persona...</option>
                                        {persons.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {personId && (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)', padding: '0 0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                                                <input 
                                                    type="color" 
                                                    value={editPersonColor}
                                                    onChange={(e) => setEditPersonColor(e.target.value)}
                                                    title="Editar color de la persona"
                                                    style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                                                />
                                            </div>
                                        )}
                                        
                                        <button 
                                            className="btn btn-secondary" 
                                            onClick={() => setIsCreatingPerson(true)}
                                            title="Nueva Persona"
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem', height: '100%', minHeight: '48px' }}
                                        >
                                            <UserPlus size={20} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '1rem', marginTop: '0.5rem' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Escribe el nombre de la persona..." 
                                        value={newPersonName}
                                        onChange={(e) => setNewPersonName(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '1rem' }}
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <label className="info-label">Color Distintivo:</label>
                                        <input 
                                            type="color" 
                                            value={newPersonColor}
                                            onChange={(e) => setNewPersonColor(e.target.value)}
                                            style={{ width: '48px', height: '36px', padding: 0, border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                                        />
                                    </div>
                                    <button 
                                        className="btn" 
                                        onClick={() => setIsCreatingPerson(false)}
                                        style={{ alignSelf: 'flex-start', fontSize: '0.875rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                                    >
                                        Volver a la lista
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                    {existingAssignmentId && (
                        <button 
                            className="btn" 
                            onClick={handleDelete}
                            disabled={loading}
                            style={{ marginRight: 'auto', backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600', flex: '1 1 100%' }}
                        >
                            <Trash2 size={18} /> Eliminar
                        </button>
                    )}
                    <div style={{ display: 'flex', gap: '0.75rem', width: existingAssignmentId ? '100%' : 'auto', justifyContent: 'flex-end', flex: '1 1 auto' }}>
                        <button className="btn btn-secondary" onClick={onClose} disabled={loading} style={{ padding: '0.5rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600' }}>
                            Cancelar
                        </button>
                        <button 
                            className="btn btn-primary" 
                            onClick={handleSave}
                            disabled={loading || (!personId && !isCreatingPerson) || (isCreatingPerson && !newPersonName.trim()) || !startDateStr || !endDateStr || startDateStr > endDateStr}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600' }}
                        >
                            <Save size={18} /> Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
