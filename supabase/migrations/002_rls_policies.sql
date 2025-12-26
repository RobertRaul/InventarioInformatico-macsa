-- Habilitar Row Level Security en todas las tablas
ALTER TABLE pisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE perifericos ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir lectura a todos (anon y authenticated)
CREATE POLICY "Permitir lectura de pisos a todos" ON pisos
  FOR SELECT USING (true);

CREATE POLICY "Permitir lectura de areas a todos" ON areas
  FOR SELECT USING (true);

CREATE POLICY "Permitir lectura de usuarios a todos" ON usuarios
  FOR SELECT USING (true);

CREATE POLICY "Permitir lectura de equipos a todos" ON equipos
  FOR SELECT USING (true);

CREATE POLICY "Permitir lectura de perifericos a todos" ON perifericos
  FOR SELECT USING (true);

-- Políticas para permitir inserción a todos
CREATE POLICY "Permitir inserción de pisos a todos" ON pisos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir inserción de areas a todos" ON areas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir inserción de usuarios a todos" ON usuarios
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir inserción de equipos a todos" ON equipos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir inserción de perifericos a todos" ON perifericos
  FOR INSERT WITH CHECK (true);

-- Políticas para permitir actualización a todos
CREATE POLICY "Permitir actualización de pisos a todos" ON pisos
  FOR UPDATE USING (true);

CREATE POLICY "Permitir actualización de areas a todos" ON areas
  FOR UPDATE USING (true);

CREATE POLICY "Permitir actualización de usuarios a todos" ON usuarios
  FOR UPDATE USING (true);

CREATE POLICY "Permitir actualización de equipos a todos" ON equipos
  FOR UPDATE USING (true);

CREATE POLICY "Permitir actualización de perifericos a todos" ON perifericos
  FOR UPDATE USING (true);

-- Políticas para permitir eliminación a todos
CREATE POLICY "Permitir eliminación de pisos a todos" ON pisos
  FOR DELETE USING (true);

CREATE POLICY "Permitir eliminación de areas a todos" ON areas
  FOR DELETE USING (true);

CREATE POLICY "Permitir eliminación de usuarios a todos" ON usuarios
  FOR DELETE USING (true);

CREATE POLICY "Permitir eliminación de equipos a todos" ON equipos
  FOR DELETE USING (true);

CREATE POLICY "Permitir eliminación de perifericos a todos" ON perifericos
  FOR DELETE USING (true);
