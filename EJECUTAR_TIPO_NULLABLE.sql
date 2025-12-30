-- Permitir NULL en la columna tipo para soportar tipos personalizados
-- EJECUTAR ESTE SCRIPT EN SUPABASE SQL EDITOR

-- 1. Hacer la columna tipo nullable
ALTER TABLE equipos ALTER COLUMN tipo DROP NOT NULL;

-- 2. Agregar una constraint para asegurar que siempre haya tipo o tipo_custom_id
ALTER TABLE equipos
ADD CONSTRAINT check_tipo_or_custom
CHECK (
  (tipo IS NOT NULL AND tipo_custom_id IS NULL) OR
  (tipo IS NULL AND tipo_custom_id IS NOT NULL)
);

-- 3. Verificar que la estructura esté correcta
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'equipos'
AND column_name IN ('tipo', 'tipo_custom_id');
