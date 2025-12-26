-- ============================================================================
-- MIGRACIÓN 003: TIPOS DE EQUIPOS PERSONALIZADOS
-- ============================================================================
-- Permite crear tipos de equipos personalizados además de los predefinidos
-- ============================================================================

-- Tabla de tipos de equipos personalizados
CREATE TABLE tipos_equipos_custom (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  campos_adicionales JSONB DEFAULT '[]',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modificar tabla equipos para permitir tipos personalizados
-- Primero, necesitamos una nueva columna para el tipo custom
ALTER TABLE equipos ADD COLUMN tipo_custom_id UUID REFERENCES tipos_equipos_custom(id) ON DELETE SET NULL;

-- Índice para mejorar búsquedas
CREATE INDEX idx_equipos_tipo_custom ON equipos(tipo_custom_id);

-- Trigger para updated_at
CREATE TRIGGER update_tipos_equipos_custom_updated_at BEFORE UPDATE ON tipos_equipos_custom
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS
ALTER TABLE tipos_equipos_custom ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de tipos custom a todos" ON tipos_equipos_custom
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de tipos custom a todos" ON tipos_equipos_custom
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización de tipos custom a todos" ON tipos_equipos_custom
  FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminación de tipos custom a todos" ON tipos_equipos_custom
  FOR DELETE USING (true);

-- Ejemplos de tipos personalizados (comentados, descomentar para usar)
-- INSERT INTO tipos_equipos_custom (nombre, descripcion, campos_adicionales) VALUES
--   (
--     'Tablet',
--     'Tabletas y dispositivos móviles',
--     '[
--       {"nombre": "sistema_operativo", "tipo": "text", "label": "Sistema Operativo"},
--       {"nombre": "tamaño_pantalla", "tipo": "text", "label": "Tamaño de Pantalla"},
--       {"nombre": "almacenamiento", "tipo": "text", "label": "Almacenamiento"}
--     ]'::jsonb
--   ),
--   (
--     'Proyector',
--     'Proyectores multimedia',
--     '[
--       {"nombre": "resolucion", "tipo": "text", "label": "Resolución"},
--       {"nombre": "lumenes", "tipo": "text", "label": "Lúmenes"}
--     ]'::jsonb
--   ),
--   (
--     'UPS',
--     'Sistema de alimentación ininterrumpida',
--     '[
--       {"nombre": "potencia", "tipo": "text", "label": "Potencia (VA)"},
--       {"nombre": "tiempo_respaldo", "tipo": "text", "label": "Tiempo de Respaldo"}
--     ]'::jsonb
--   );

-- Comentarios en las tablas
COMMENT ON TABLE tipos_equipos_custom IS 'Tipos de equipos personalizados creados por el usuario';
COMMENT ON COLUMN tipos_equipos_custom.campos_adicionales IS 'Array JSON con definición de campos personalizados para el formulario';
COMMENT ON COLUMN equipos.tipo_custom_id IS 'Referencia a tipo de equipo personalizado, si tipo es NULL';
