-- 003_seed_data.sql

-- NOTA: Supabase gestiona la autenticación en auth.users, pero asumiendo que migramos
-- temporalmente la tabla custom public.users, asignamos UUIDs para cruzar relaciones.

-- Hash bcrypt de "admin123" y "guest123" para replicar la lógica actual.
-- El bcrypt salt es 10 rounds: '$2a$10$...'
INSERT INTO users (id, username, password_hash, role, theme) 
VALUES 
  ('a1b2c3d4-0000-0000-0000-000000000001'::uuid, 'admin', '$2a$10$xLzDEx.OaB3T3vH1o1i4/.d82K4G2R3o4.g76/b0f2y8S9zO4H/C2', 'administrator', 'light'),
  ('a1b2c3d4-0000-0000-0000-000000000002'::uuid, 'guest', '$2a$10$xLzDEx.OaB3T3vH1o1i4/.d82K4G2R3o4.g76/b0f2y8S9zO4H/C2', 'guest', 'light')
ON CONFLICT (username) DO NOTHING;

-- Insertar Tipos de Feriados Predefinidos según el holidayTypeService.ts
INSERT INTO holiday_types (id, code, name, color, is_predefined)
VALUES
  ('11111111-0000-0000-0000-000000000001'::uuid, 'public', 'Público', '#dc2626', true),
  ('11111111-0000-0000-0000-000000000002'::uuid, 'bank', 'Bancario', '#2563eb', true),
  ('11111111-0000-0000-0000-000000000003'::uuid, 'school', 'Escolar', '#059669', true),
  ('11111111-0000-0000-0000-000000000004'::uuid, 'optional', 'Opcional', '#d97706', true),
  ('11111111-0000-0000-0000-000000000005'::uuid, 'observance', 'Conmemoración', '#7c3aed', true)
ON CONFLICT (code) DO NOTHING;
