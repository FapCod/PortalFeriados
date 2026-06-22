-- 004_auth_trigger_and_indexes.sql

-- 1. Eliminar trigger y función previos para evitar bloqueos y asegurar consistencia
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Crear la función del trigger para crear perfiles automáticamente en public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username VARCHAR(100);
  v_role public.user_role;
BEGIN
  -- Extraer username de la metadata del usuario o usar la parte local del correo electrónico
  v_username := COALESCE(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );

  -- Determinar el rol: intentar obtener de metadata, de lo contrario asignar 'guest' por defecto
  v_role := COALESCE(
    (new.raw_user_meta_data->>'role')::public.user_role,
    'guest'::public.user_role
  );

  -- Insertar el perfil del usuario en la tabla pública
  INSERT INTO public.users (id, username, role, theme)
  VALUES (
    new.id,
    v_username,
    v_role,
    'light'
  )
  ON CONFLICT (id) DO UPDATE
  SET username = EXCLUDED.username,
      role = EXCLUDED.role;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear el trigger en auth.users que ejecute la función tras la inserción
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Crear índices de rendimiento recomendados en claves foráneas de custom_holidays
CREATE INDEX IF NOT EXISTS idx_custom_holidays_type_id ON public.custom_holidays(type_id);
CREATE INDEX IF NOT EXISTS idx_custom_holidays_created_by ON public.custom_holidays(created_by);
