-- 002_rls_policies.sql
-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_holidays ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- Políticas para users
-- Cada usuario puede ver y actualizar su propio registro (incluyendo su tema)
-- -------------------------------------------------------------
CREATE POLICY "Usuarios pueden ver su propio perfil" 
ON users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- -------------------------------------------------------------
-- Políticas para holiday_types
-- Guest: Solo lectura. Admin: CRUD completo.
-- -------------------------------------------------------------
CREATE POLICY "Cualquiera puede ver tipos de feriados (Guest y Admin)" 
ON holiday_types FOR SELECT 
TO authenticated, anon 
USING (true);

CREATE POLICY "Admin puede insertar tipos de feriados" 
ON holiday_types FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'administrator'));

CREATE POLICY "Admin puede actualizar tipos de feriados" 
ON holiday_types FOR UPDATE 
TO authenticated 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'administrator'));

CREATE POLICY "Admin puede eliminar tipos de feriados" 
ON holiday_types FOR DELETE 
TO authenticated 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'administrator'));

-- -------------------------------------------------------------
-- Políticas para custom_holidays
-- Guest: Solo lectura. Admin: CRUD completo.
-- -------------------------------------------------------------
CREATE POLICY "Cualquiera puede ver feriados personalizados (Guest y Admin)" 
ON custom_holidays FOR SELECT 
TO authenticated, anon 
USING (true);

CREATE POLICY "Admin puede insertar feriados personalizados" 
ON custom_holidays FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'administrator'));

CREATE POLICY "Admin puede actualizar feriados personalizados" 
ON custom_holidays FOR UPDATE 
TO authenticated 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'administrator'));

CREATE POLICY "Admin puede eliminar feriados personalizados" 
ON custom_holidays FOR DELETE 
TO authenticated 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'administrator'));
