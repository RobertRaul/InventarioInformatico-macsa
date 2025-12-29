-- ============================================================================
-- EJECUTAR ESTE SCRIPT EN EL SQL EDITOR DE SUPABASE
-- ============================================================================
-- Este script crea la tabla tipos_equipos_custom si no existe
-- ============================================================================

-- Crear la tabla tipos_equipos_custom
CREATE TABLE IF NOT EXISTS tipos_equipos_custom (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  campos_adicionales JSONB DEFAULT '[]',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modificar tabla equipos para permitir tipos personalizados (si no existe la columna)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'equipos' AND column_name = 'tipo_custom_id'
    ) THEN
        ALTER TABLE equipos ADD COLUMN tipo_custom_id UUID REFERENCES tipos_equipos_custom(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Índice para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_equipos_tipo_custom ON equipos(tipo_custom_id);

-- Crear función update_updated_at_column si no existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_tipos_equipos_custom_updated_at ON tipos_equipos_custom;
CREATE TRIGGER update_tipos_equipos_custom_updated_at
    BEFORE UPDATE ON tipos_equipos_custom
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE tipos_equipos_custom ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Permitir lectura de tipos custom a todos" ON tipos_equipos_custom;
DROP POLICY IF EXISTS "Permitir inserción de tipos custom a todos" ON tipos_equipos_custom;
DROP POLICY IF EXISTS "Permitir actualización de tipos custom a todos" ON tipos_equipos_custom;
DROP POLICY IF EXISTS "Permitir eliminación de tipos custom a todos" ON tipos_equipos_custom;

-- Crear políticas RLS
CREATE POLICY "Permitir lectura de tipos custom a todos" ON tipos_equipos_custom
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de tipos custom a todos" ON tipos_equipos_custom
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización de tipos custom a todos" ON tipos_equipos_custom
  FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminación de tipos custom a todos" ON tipos_equipos_custom
  FOR DELETE USING (true);

-- Comentarios en las tablas
COMMENT ON TABLE tipos_equipos_custom IS 'Tipos de equipos personalizados creados por el usuario';
COMMENT ON COLUMN tipos_equipos_custom.campos_adicionales IS 'Array JSON con definición de campos personalizados para el formulario';

-- Verificar que todo se creó correctamente
SELECT 'Tabla tipos_equipos_custom creada exitosamente' AS status;
