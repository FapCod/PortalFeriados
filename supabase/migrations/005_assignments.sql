-- 005_assignments.sql

-- Tabla de Personas
CREATE TABLE persons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) DEFAULT '#3b82f6', -- Color para identificar a la persona en el calendario
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Asignaciones
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
    country_code VARCHAR(2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (start_date <= end_date)
);

-- Triggers para updated_at
CREATE TRIGGER update_persons_updated_at
    BEFORE UPDATE ON persons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Políticas para persons
-- Lectura: todos pueden ver
CREATE POLICY "Persons are viewable by everyone" ON persons FOR SELECT USING (true);
-- Escritura: solo usuarios autenticados
CREATE POLICY "Authenticated users can create persons" ON persons FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update persons" ON persons FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete persons" ON persons FOR DELETE TO authenticated USING (true);

-- Políticas para assignments
-- Lectura: todos pueden ver
CREATE POLICY "Assignments are viewable by everyone" ON assignments FOR SELECT USING (true);
-- Escritura: solo usuarios autenticados
CREATE POLICY "Authenticated users can create assignments" ON assignments FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update assignments" ON assignments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete assignments" ON assignments FOR DELETE TO authenticated USING (true);
