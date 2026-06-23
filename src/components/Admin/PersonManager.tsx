import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Edit2, Save, RotateCcw } from 'lucide-react';
import type { Person } from '../../services/personService';
import { useAssignmentStore } from '../../store/useAssignmentStore';
import { useToastStore } from '../../store/useToastStore';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './PersonManager.css';

interface PersonManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PersonManager: React.FC<PersonManagerProps> = ({ isOpen, onClose }) => {
    const { persons, loadPersons, addPerson, updatePerson, deletePerson } = useAssignmentStore();
    const addToast = useToastStore((state) => state.addToast);
    
    const [newPersonName, setNewPersonName] = useState('');
    const [newPersonColor, setNewPersonColor] = useState('#3b82f6');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [personToDelete, setPersonToDelete] = useState<{ id: string, name: string } | null>(null);
    
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (isOpen) {
            const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
            
            tl.fromTo(containerRef.current,
                { backgroundColor: 'rgba(0, 0, 0, 0)' },
                { backgroundColor: 'rgba(0, 0, 0, 0.5)', duration: 0.25 }
            )
            .fromTo('.person-manager-modal',
                { scale: 0.9, opacity: 0, y: 30 },
                { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.2)', clearProps: 'transform,opacity' },
                '-=0.15'
            );
        }
    }, { dependencies: [isOpen], scope: containerRef });

    useEffect(() => {
        if (isOpen) {
            setError(null);
            setNewPersonName('');
            setNewPersonColor('#3b82f6');
            setEditingId(null);
            setEditName('');
            setEditColor('');
            setPersonToDelete(null);
            loadPersons();
        }
    }, [isOpen, loadPersons]);

    const handleAddPerson = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!newPersonName.trim()) return;
        
        try {
            const result = await addPerson({ name: newPersonName.trim(), color: newPersonColor });
            if (result.success) {
                setNewPersonName('');
                setNewPersonColor('#3b82f6');
                addToast('Persona agregada con éxito', 'success');
            } else {
                const errorMsg = result.errors?.[0] || 'Error al agregar persona';
                setError(errorMsg);
                addToast(errorMsg, 'error');
            }
        } catch (err) {
            setError('Error de conexión');
        }
    };

    const handleConfirmDelete = async () => {
        if (!personToDelete) return;
        const id = personToDelete.id;
        const name = personToDelete.name;
        
        setPersonToDelete(null);
        setError(null);
        
        try {
            const success = await deletePerson(id);
            if (success) {
                addToast(`Persona "${name}" eliminada con éxito`, 'success');
            } else {
                setError('No se pudo eliminar la persona. Es posible que tenga asignaciones activas.');
                addToast('Error al eliminar persona', 'error');
            }
        } catch (err) {
            setError('Error de conexión');
        }
    };

    const startEditing = (person: Person) => {
        setEditingId(person.id);
        setEditName(person.name);
        setEditColor(person.color);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName('');
        setEditColor('');
        setError(null);
    };

    const handleUpdatePerson = async (id: string) => {
        if (!editName.trim()) return;
        try {
            const result = await updatePerson(id, { name: editName.trim(), color: editColor });
            if (result.success) {
                setEditingId(null);
                addToast('Persona actualizada con éxito', 'success');
            } else {
                const errorMsg = result.errors?.[0] || 'Error al actualizar persona';
                setError(errorMsg);
                addToast(errorMsg, 'error');
            }
        } catch (err) {
            setError('Error de conexión');
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <>
            <div className="person-manager-overlay" ref={containerRef}>
                <div className="person-manager-modal">
                    <div className="person-manager-header">
                        <h2 className="person-manager-title">Gestionar Personas</h2>
                        <button onClick={onClose} className="person-manager-close">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="person-manager-content">
                        {error && <div className="person-manager-error">{error}</div>}

                        <form onSubmit={handleAddPerson} className="person-manager-form">
                            <div className="form-group">
                                <input
                                    type="text"
                                    value={newPersonName}
                                    onChange={(e) => setNewPersonName(e.target.value)}
                                    placeholder="Nombre de la nueva persona"
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ flex: '0 0 auto' }}>
                                <input
                                    type="color"
                                    value={newPersonColor}
                                    onChange={(e) => setNewPersonColor(e.target.value)}
                                    className="form-color-input"
                                    title="Seleccionar color"
                                />
                            </div>
                            <button type="submit" className="add-person-btn btn-primary">
                                <Plus size={20} />
                                Agregar
                            </button>
                        </form>

                        <div className="persons-list">
                            {persons.map((person) => (
                                <div key={person.id} className="person-item">
                                    {editingId === person.id ? (
                                        <div className="person-edit-form">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="edit-input"
                                                required
                                            />
                                            <input
                                                type="color"
                                                value={editColor}
                                                onChange={(e) => setEditColor(e.target.value)}
                                                className="edit-color"
                                            />
                                            <div className="edit-actions">
                                                <button onClick={() => handleUpdatePerson(person.id)} className="save-btn btn-primary" title="Guardar">
                                                    <Save size={18} />
                                                </button>
                                                <button onClick={cancelEditing} className="cancel-btn" title="Cancelar">
                                                    <RotateCcw size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="person-info">
                                                <span className="person-color-indicator" style={{ backgroundColor: person.color }}></span>
                                                <span className="person-name">{person.name}</span>
                                            </div>
                                            <div className="person-actions">
                                                <button onClick={() => startEditing(person)} className="edit-btn" title="Editar">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => setPersonToDelete({ id: person.id, name: person.name })} className="delete-btn" title="Eliminar">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                            {persons.length === 0 && (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                                    No hay personas registradas
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {personToDelete && (
                <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setPersonToDelete(null)}>
                    <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                        <h3 className="confirm-title">¿Eliminar persona?</h3>
                        <p className="confirm-message">
                            ¿Estás seguro de que deseas eliminar a "{personToDelete.name}"? Esta acción no se puede deshacer y borrará permanentemente sus asignaciones.
                        </p>
                        <div className="confirm-actions">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setPersonToDelete(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-delete"
                                onClick={handleConfirmDelete}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>,
        document.body
    );
};
