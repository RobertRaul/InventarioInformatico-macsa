-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Pisos
CREATE TABLE pisos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  orden INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Áreas
CREATE TABLE areas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  piso_id UUID NOT NULL REFERENCES pisos(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Usuarios
CREATE TABLE usuarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  nombre VARCHAR(200) NOT NULL,
  cargo VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tipo de equipo enum
CREATE TYPE tipo_equipo AS ENUM ('computadora', 'monitor', 'impresora', 'scanner', 'anexo');

-- Estado de equipo enum
CREATE TYPE estado_equipo AS ENUM ('activo', 'mantenimiento', 'baja', 'disponible');

-- Tabla de Equipos
CREATE TABLE equipos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tipo tipo_equipo NOT NULL,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  codigo_barra VARCHAR(50) UNIQUE,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  specs JSONB DEFAULT '{}',
  estado estado_equipo DEFAULT 'activo',
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Periféricos
CREATE TABLE perifericos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  equipo_id UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  cantidad INTEGER DEFAULT 1,
  descripcion VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX idx_areas_piso ON areas(piso_id);
CREATE INDEX idx_usuarios_area ON usuarios(area_id);
CREATE INDEX idx_equipos_usuario ON equipos(usuario_id);
CREATE INDEX idx_equipos_tipo ON equipos(tipo);
CREATE INDEX idx_equipos_codigo ON equipos(codigo_barra);
CREATE INDEX idx_perifericos_equipo ON perifericos(equipo_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pisos_updated_at BEFORE UPDATE ON pisos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipos_updated_at BEFORE UPDATE ON equipos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Datos iniciales de ejemplo
INSERT INTO pisos (nombre, orden) VALUES
  ('9no Piso', 9),
  ('8vo Piso', 8),
  ('7mo Piso', 7);

INSERT INTO areas (piso_id, nombre) VALUES
  ((SELECT id FROM pisos WHERE nombre = '9no Piso'), 'Contabilidad'),
  ((SELECT id FROM pisos WHERE nombre = '9no Piso'), 'Mantenimiento'),
  ((SELECT id FROM pisos WHERE nombre = '8vo Piso'), 'Recursos Humanos'),
  ((SELECT id FROM pisos WHERE nombre = '7mo Piso'), 'Sistemas');
