-- ============================================================================
-- DATOS DE EJEMPLO PARA SISTEMA DE INVENTARIO
-- ============================================================================
-- Este archivo contiene datos de ejemplo adicionales para poblar el sistema
-- Ejecuta este archivo DESPUÉS de las migraciones iniciales
-- ============================================================================

-- Agregar más pisos (opcional)
INSERT INTO pisos (nombre, orden) VALUES
  ('6to Piso', 6),
  ('5to Piso', 5),
  ('4to Piso', 4),
  ('3er Piso', 3),
  ('2do Piso', 2),
  ('1er Piso', 1)
ON CONFLICT DO NOTHING;

-- Agregar más áreas
INSERT INTO areas (piso_id, nombre) VALUES
  -- 9no Piso
  ((SELECT id FROM pisos WHERE nombre = '9no Piso'), 'Gerencia General'),
  ((SELECT id FROM pisos WHERE nombre = '9no Piso'), 'Finanzas'),

  -- 8vo Piso
  ((SELECT id FROM pisos WHERE nombre = '8vo Piso'), 'Marketing'),
  ((SELECT id FROM pisos WHERE nombre = '8vo Piso'), 'Ventas'),

  -- 7mo Piso
  ((SELECT id FROM pisos WHERE nombre = '7mo Piso'), 'TI y Soporte'),
  ((SELECT id FROM pisos WHERE nombre = '7mo Piso'), 'Desarrollo'),

  -- 6to Piso
  ((SELECT id FROM pisos WHERE nombre = '6to Piso'), 'Atención al Cliente'),
  ((SELECT id FROM pisos WHERE nombre = '6to Piso'), 'Call Center')
ON CONFLICT DO NOTHING;

-- Agregar usuarios de ejemplo
INSERT INTO usuarios (area_id, nombre, cargo, activo) VALUES
  -- Contabilidad (9no Piso)
  ((SELECT id FROM areas WHERE nombre = 'Contabilidad'), 'Yeni Ramirez', 'Contador Senior', true),
  ((SELECT id FROM areas WHERE nombre = 'Contabilidad'), 'Carlos Mendoza', 'Asistente Contable', true),
  ((SELECT id FROM areas WHERE nombre = 'Contabilidad'), 'Maria Lopez', 'Jefe de Contabilidad', true),

  -- Mantenimiento (9no Piso)
  ((SELECT id FROM areas WHERE nombre = 'Mantenimiento'), 'Juan Torres', 'Técnico', true),
  ((SELECT id FROM areas WHERE nombre = 'Mantenimiento'), 'Pedro Sanchez', 'Jefe de Mantenimiento', true),

  -- Recursos Humanos (8vo Piso)
  ((SELECT id FROM areas WHERE nombre = 'Recursos Humanos'), 'Alicia Fernandez', 'Gerente RRHH', true),
  ((SELECT id FROM areas WHERE nombre = 'Recursos Humanos'), 'Sofia Martinez', 'Reclutadora', true),

  -- Sistemas (7mo Piso)
  ((SELECT id FROM areas WHERE nombre = 'Sistemas'), 'Luis Garcia', 'Administrador de Sistemas', true),
  ((SELECT id FROM areas WHERE nombre = 'Sistemas'), 'Ana Rodriguez', 'Desarrolladora', true)
ON CONFLICT DO NOTHING;

-- Equipos de ejemplo basados en el screenshot
INSERT INTO equipos (tipo, usuario_id, codigo_barra, marca, modelo, specs, estado) VALUES
  -- Equipo de Yeni (del screenshot)
  (
    'computadora',
    (SELECT id FROM usuarios WHERE nombre = 'Yeni Ramirez'),
    'XEADSSDEF774',
    'HP',
    'I5 1214',
    '{"procesador": "Intel Core i5-1214U", "ram": "16GB", "almacenamiento": "512SSD"}'::jsonb,
    'activo'
  ),

  -- Monitor de Yeni
  (
    'monitor',
    (SELECT id FROM usuarios WHERE nombre = 'Yeni Ramirez'),
    'XEADSSDEF779',
    'Samsung',
    '27 Pulgadas',
    '{"pulgadas": "27"}'::jsonb,
    'activo'
  ),

  -- Computadora adicional (del screenshot)
  (
    'computadora',
    (SELECT id FROM usuarios WHERE nombre = 'Alicia Fernandez'),
    'XEADSSDEF773',
    'Dell',
    'I5 1214',
    '{"procesador": "Intel Core i5-1214U", "ram": "16GB", "almacenamiento": "512SSD"}'::jsonb,
    'activo'
  ),

  -- Monitor de Alicia
  (
    'monitor',
    (SELECT id FROM usuarios WHERE nombre = 'Alicia Fernandez'),
    NULL,
    'Teros',
    '24 Pulgadas',
    '{"pulgadas": "24"}'::jsonb,
    'activo'
  ),

  -- Impresora HP Laser
  (
    'impresora',
    NULL,
    NULL,
    'HP',
    'LaserJet Pro',
    '{}'::jsonb,
    'disponible'
  ),

  -- Scanner HP PRO
  (
    'scanner',
    NULL,
    NULL,
    'HP',
    'ScanJet Pro',
    '{}'::jsonb,
    'disponible'
  ),

  -- Anexo Yealink
  (
    'anexo',
    (SELECT id FROM usuarios WHERE nombre = 'Yeni Ramirez'),
    NULL,
    'Yealink',
    'T46S',
    '{}'::jsonb,
    'activo'
  ),

  -- Más computadoras de ejemplo
  (
    'computadora',
    (SELECT id FROM usuarios WHERE nombre = 'Carlos Mendoza'),
    'XEADSSDEF801',
    'Lenovo',
    'ThinkPad E14',
    '{"procesador": "Intel Core i5", "ram": "8GB", "almacenamiento": "256SSD"}'::jsonb,
    'activo'
  ),

  (
    'computadora',
    (SELECT id FROM usuarios WHERE nombre = 'Luis Garcia'),
    'XEADSSDEF802',
    'HP',
    'ProBook 450 G8',
    '{"procesador": "Intel Core i7", "ram": "32GB", "almacenamiento": "1TB SSD"}'::jsonb,
    'activo'
  ),

  (
    'computadora',
    (SELECT id FROM usuarios WHERE nombre = 'Ana Rodriguez'),
    'XEADSSDEF803',
    'Dell',
    'XPS 15',
    '{"procesador": "Intel Core i7", "ram": "16GB", "almacenamiento": "512SSD"}'::jsonb,
    'activo'
  )
ON CONFLICT DO NOTHING;

-- Periféricos para las computadoras (basado en screenshot)
INSERT INTO perifericos (equipo_id, tipo, cantidad, descripcion) VALUES
  -- Periféricos de Yeni (1 Mouse, 2 Teclado, 3 Parlantes)
  (
    (SELECT id FROM equipos WHERE codigo_barra = 'XEADSSDEF774'),
    'mouse',
    1,
    'Mouse inalámbrico Logitech'
  ),
  (
    (SELECT id FROM equipos WHERE codigo_barra = 'XEADSSDEF774'),
    'teclado',
    2,
    'Teclado HP + Teclado numérico'
  ),
  (
    (SELECT id FROM equipos WHERE codigo_barra = 'XEADSSDEF774'),
    'parlantes',
    3,
    'Parlantes stereo'
  ),

  -- Periféricos de Alicia (1 Mouse, 2 Teclado)
  (
    (SELECT id FROM equipos WHERE codigo_barra = 'XEADSSDEF773'),
    'mouse',
    1,
    'Mouse óptico'
  ),
  (
    (SELECT id FROM equipos WHERE codigo_barra = 'XEADSSDEF773'),
    'teclado',
    2,
    'Teclado estándar'
  ),

  -- Periféricos de Carlos
  (
    (SELECT id FROM equipos WHERE codigo_barra = 'XEADSSDEF801'),
    'mouse',
    1,
    NULL
  ),
  (
    (SELECT id FROM equipos WHERE codigo_barra = 'XEADSSDEF801'),
    'teclado',
    1,
    NULL
  ),

  -- Periféricos de Luis (admin de sistemas necesita más equipo)
  (
    (SELECT id FROM equipos WHERE codigo_barra = 'XEADSSDEF802'),
    'mouse',
    1,
    'Mouse gaming'
  ),
  (
    (SELECT id FROM equipos WHERE codigo_barra = 'XEADSSDEF802'),
    'teclado',
    1,
    'Teclado mecánico'
  ),
  (
    (SELECT id FROM equipos WHERE codigo_barra = 'XEADSSDEF802'),
    'otros',
    1,
    'Webcam HD, Auriculares con micrófono'
  ),

  -- Periféricos de Ana
  (
    (SELECT id FROM equipos WHERE codigo_barra = 'XEADSSDEF803'),
    'mouse',
    1,
    NULL
  ),
  (
    (SELECT id FROM equipos WHERE codigo_barra = 'XEADSSDEF803'),
    'teclado',
    1,
    NULL
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CONSULTAS ÚTILES PARA VERIFICAR LOS DATOS
-- ============================================================================

-- Ver todos los equipos con sus relaciones
-- SELECT
--   e.tipo,
--   e.codigo_barra,
--   e.marca,
--   e.modelo,
--   u.nombre as usuario,
--   a.nombre as area,
--   p.nombre as piso
-- FROM equipos e
-- LEFT JOIN usuarios u ON e.usuario_id = u.id
-- LEFT JOIN areas a ON u.area_id = a.id
-- LEFT JOIN pisos p ON a.piso_id = p.id
-- ORDER BY p.orden DESC, a.nombre, u.nombre;

-- Ver periféricos por equipo
-- SELECT
--   e.codigo_barra,
--   e.marca,
--   e.modelo,
--   per.tipo,
--   per.cantidad,
--   per.descripcion
-- FROM equipos e
-- JOIN perifericos per ON e.id = per.equipo_id
-- WHERE e.tipo = 'computadora'
-- ORDER BY e.codigo_barra;

-- Estadísticas del inventario
-- SELECT
--   tipo,
--   COUNT(*) as cantidad,
--   COUNT(usuario_id) as asignados,
--   COUNT(*) - COUNT(usuario_id) as disponibles
-- FROM equipos
-- GROUP BY tipo
-- ORDER BY tipo;
