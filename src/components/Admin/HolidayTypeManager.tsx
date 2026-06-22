import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Edit2, Save, RotateCcw } from 'lucide-react';
import { holidayTypeService } from '../../services/holidayTypeService';
import type { HolidayTypeDefinition } from '../../services/holidayTypeService';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './HolidayTypeManager.css';

interface HolidayTypeManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HolidayTypeManager: React.FC<HolidayTypeManagerProps> = ({ isOpen, onClose }) => {
    const [types, setTypes] = useState<HolidayTypeDefinition[]>([]);
    const [newTypeName, setNewTypeName] = useState('');
    const [newTypeColor, setNewTypeColor] = useState('#10B981');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');
    const [error, setError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // GSAP animations for modal entry using Timeline
    useGSAP(() => {
        if (isOpen) {
            const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
            
            tl.fromTo(containerRef.current,
                { backgroundColor: 'rgba(0, 0, 0, 0)' },
                { backgroundColor: 'rgba(0, 0, 0, 0.5)', duration: 0.25 }
            )
            .fromTo('.holiday-type-modal',
                { scale: 0.9, opacity: 0, y: 30 },
                { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.2)', clearProps: 'transform,opacity' },
                '-=0.15'
            );
        }
    }, { dependencies: [isOpen], scope: containerRef });

    const loadTypes = async () => {
        const data = await holidayTypeService.getAllTypes();
        setTypes(data);
    };

    useEffect(() => {
        if (isOpen) {
            loadTypes();
        }
    }, [isOpen]);

    const handleAddType = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await holidayTypeService.addType(newTypeName, newTypeColor);
            setNewTypeName('');
            setNewTypeColor('#10B981');
            await loadTypes();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al agregar tipo');
        }
    };

    const handleDeleteType = async (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar este tipo de feriado?')) {
            try {
                await holidayTypeService.deleteType(id);
                await loadTypes();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al eliminar tipo');
            }
        }
    };

    const startEditing = (type: HolidayTypeDefinition) => {
        setEditingId(type.id);
        setEditName(type.name);
        setEditColor(type.color);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName('');
        setEditColor('');
        setError(null);
    };

    const handleUpdateType = async (id: string) => {
        try {
            await holidayTypeService.updateType(id, editName, editColor);
            setEditingId(null);
            await loadTypes();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al actualizar tipo');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="holiday-type-overlay" ref={containerRef}>
            <div className="holiday-type-modal">
                <div className="holiday-type-header">
                    <h2 className="holiday-type-title">Gestionar Tipos de Feriado</h2>
                    <button onClick={onClose} className="holiday-type-close">
                        <X size={24} />
                    </button>
                </div>

                <div className="holiday-type-content">
                    {error && <div className="holiday-type-error">{error}</div>}

                    <form onSubmit={handleAddType} className="holiday-type-form">
                        <div className="form-group">
                            <input
                                type="text"
                                value={newTypeName}
                                onChange={(e) => setNewTypeName(e.target.value)}
                                placeholder="Nombre del nuevo tipo"
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="color"
                                value={newTypeColor}
                                onChange={(e) => setNewTypeColor(e.target.value)}
                                className="form-color-input"
                                title="Seleccionar color"
                            />
                        </div>
                        <button type="submit" className="add-type-btn">
                            <Plus size={20} />
                            Agregar
                        </button>
                    </form>

                    <div className="types-list">
                        {types.map((type) => (
                            <div key={type.id} className={`type-item ${type.isPredefined ? 'predefined' : ''}`}>
                                {editingId === type.id ? (
                                    <div className="type-edit-form">
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
                                            <button onClick={() => handleUpdateType(type.id)} className="save-btn" title="Guardar">
                                                <Save size={18} />
                                            </button>
                                            <button onClick={cancelEditing} className="cancel-btn" title="Cancelar">
                                                <RotateCcw size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="type-info">
                                            <span className="type-color-indicator" style={{ backgroundColor: type.color }}></span>
                                            <span className="type-name">{type.name}</span>
                                            {type.isPredefined && <span className="badge-predefined">Predefinido</span>}
                                        </div>
                                        {!type.isPredefined && (
                                            <div className="type-actions">
                                                <button onClick={() => startEditing(type)} className="edit-btn" title="Editar">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteType(type.id)} className="delete-btn" title="Eliminar">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
