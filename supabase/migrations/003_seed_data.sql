-- 003_seed_data.sql
-- Insertar Tipos de Feriados Predefinidos en la base de datos

INSERT INTO holiday_types (id, code, name, color, is_predefined)
VALUES
  ('11111111-0000-0000-0000-000000000001'::uuid, 'public', 'Público', '#dc2626', true),
  ('11111111-0000-0000-0000-000000000002'::uuid, 'bank', 'Bancario', '#2563eb', true),
  ('11111111-0000-0000-0000-000000000003'::uuid, 'school', 'Escolar', '#059669', true),
  ('11111111-0000-0000-0000-000000000004'::uuid, 'optional', 'Opcional', '#d97706', true),
  ('11111111-0000-0000-0000-000000000005'::uuid, 'observance', 'Conmemoración', '#7c3aed', true)
ON CONFLICT (code) DO NOTHING;
