-- SOS-47
-- Alinea los datos de demostración con los puntos definidos en el prototipo.

-- =========================================================
-- ELIMINAR ÚNICAMENTE LOS DATOS DEMO ANTERIORES DE SOS-47
-- =========================================================

DELETE FROM centro
WHERE nombre IN (
                 'Centro de Apoyo Cochabamba Demo',
                 'Centro Comunitario La Paz Demo'
    );

DELETE FROM punto_ayuda
WHERE nombre IN (
                 'Refugio Temporal La Paz Demo',
                 'Punto de Donación Santa Cruz Demo',
                 'Emergencia Tarija Demo'
    );


-- =========================================================
-- NECESIDADES ADICIONALES DEL PROTOTIPO
-- =========================================================

INSERT IGNORE INTO necesidad (nombre, descripcion) VALUES
('Higiene', 'Productos de higiene y aseo personal'),
('Primeros auxilios', 'Insumos básicos para primeros auxilios'),
('Alojamiento', 'Espacios y recursos para alojamiento temporal');


-- =========================================================
-- CENTROS
-- =========================================================

INSERT INTO centro (
    nombre,
    tipo,
    descripcion,
    direccion,
    ciudad,
    departamento_id,
    telefono,
    email,
    latitud,
    longitud,
    estado_verificacion,
    responsable_id
)
SELECT
    'Centro de Apoyo San José',
    'CENTRO_APOYO',
    'Centro comunitario de recepción y distribución de ayuda para familias afectadas.',
    'Av. Blanco Galindo, zona oeste',
    'Cochabamba',
    d.id,
    '70700001',
    'sanjose@sos.demo',
    -17.3895000,
    -66.1568000,
    'VERIFICADO',
    u.id
FROM departamento d
         JOIN usuario u ON u.email = 'seed.demo@sos.local'
WHERE d.nombre = 'Cochabamba'
  AND NOT EXISTS (
    SELECT 1 FROM centro
    WHERE nombre = 'Centro de Apoyo San José'
);


INSERT INTO centro (
    nombre,
    tipo,
    descripcion,
    direccion,
    ciudad,
    departamento_id,
    telefono,
    email,
    latitud,
    longitud,
    estado_verificacion,
    responsable_id
)
SELECT
    'Centro Comunitario La Paz',
    'CENTRO_APOYO',
    'Centro comunitario de atención y recepción de ayuda.',
    'Zona Central',
    'La Paz',
    d.id,
    '70700002',
    'lapaz@sos.demo',
    -16.4897000,
    -68.1193000,
    'VERIFICADO',
    u.id
FROM departamento d
         JOIN usuario u ON u.email = 'seed.demo@sos.local'
WHERE d.nombre = 'La Paz'
  AND NOT EXISTS (
    SELECT 1 FROM centro
    WHERE nombre = 'Centro Comunitario La Paz'
);


-- =========================================================
-- PUNTOS DE AYUDA
-- =========================================================

INSERT INTO punto_ayuda (
    nombre, tipo, descripcion, direccion, ciudad,
    departamento_id, latitud, longitud,
    estado_verificacion, creador_id
)
SELECT
    'Refugio Esperanza',
    'REFUGIO',
    'Refugio temporal para familias y animales desplazados por emergencias.',
    'Distrito 6, zona norte',
    'Santa Cruz de la Sierra',
    d.id,
    -17.7833000,
    -63.1821000,
    'VERIFICADO',
    u.id
FROM departamento d
         JOIN usuario u ON u.email = 'seed.demo@sos.local'
WHERE d.nombre = 'Santa Cruz'
  AND NOT EXISTS (
    SELECT 1 FROM punto_ayuda
    WHERE nombre = 'Refugio Esperanza'
);


INSERT INTO punto_ayuda (
    nombre, tipo, descripcion, direccion, ciudad,
    departamento_id, latitud, longitud,
    estado_verificacion, creador_id
)
SELECT
    'Refugio Municipal Sucre',
    'REFUGIO',
    'Refugio municipal para atención temporal de personas afectadas.',
    'Zona Central',
    'Sucre',
    d.id,
    -19.0353000,
    -65.2592000,
    'VERIFICADO',
    u.id
FROM departamento d
         JOIN usuario u ON u.email = 'seed.demo@sos.local'
WHERE d.nombre = 'Chuquisaca'
  AND NOT EXISTS (
    SELECT 1 FROM punto_ayuda
    WHERE nombre = 'Refugio Municipal Sucre'
);


INSERT INTO punto_ayuda (
    nombre, tipo, descripcion, direccion, ciudad,
    departamento_id, latitud, longitud,
    estado_verificacion, creador_id
)
SELECT
    'Incendio Forestal Tarija',
    'EMERGENCIA',
    'Punto informativo para brigadas y apoyo logístico ante incendios forestales.',
    'Zona de coordinación departamental',
    'Tarija',
    d.id,
    -21.5355000,
    -64.7296000,
    'VERIFICADO',
    u.id
FROM departamento d
         JOIN usuario u ON u.email = 'seed.demo@sos.local'
WHERE d.nombre = 'Tarija'
  AND NOT EXISTS (
    SELECT 1 FROM punto_ayuda
    WHERE nombre = 'Incendio Forestal Tarija'
);


INSERT INTO punto_ayuda (
    nombre, tipo, descripcion, direccion, ciudad,
    departamento_id, latitud, longitud,
    estado_verificacion, creador_id
)
SELECT
    'Inundaciones Beni',
    'EMERGENCIA',
    'Punto de coordinación y apoyo para comunidades afectadas por inundaciones.',
    'Zona Central',
    'Trinidad',
    d.id,
    -14.8333000,
    -64.9000000,
    'VERIFICADO',
    u.id
FROM departamento d
         JOIN usuario u ON u.email = 'seed.demo@sos.local'
WHERE d.nombre = 'Beni'
  AND NOT EXISTS (
    SELECT 1 FROM punto_ayuda
    WHERE nombre = 'Inundaciones Beni'
);


INSERT INTO punto_ayuda (
    nombre, tipo, descripcion, direccion, ciudad,
    departamento_id, latitud, longitud,
    estado_verificacion, creador_id
)
SELECT
    'Punto de Donación Potosí',
    'PUNTO_DONACION',
    'Recepción de donaciones clasificadas para centros y comunidades rurales.',
    'Plaza 10 de Noviembre',
    'Potosí',
    d.id,
    -19.5723000,
    -65.7550000,
    'VERIFICADO',
    u.id
FROM departamento d
         JOIN usuario u ON u.email = 'seed.demo@sos.local'
WHERE d.nombre = 'Potosi'
  AND NOT EXISTS (
    SELECT 1 FROM punto_ayuda
    WHERE nombre = 'Punto de Donación Potosí'
);


INSERT INTO punto_ayuda (
    nombre, tipo, descripcion, direccion, ciudad,
    departamento_id, latitud, longitud,
    estado_verificacion, creador_id
)
SELECT
    'Centro de Acopio Oruro',
    'PUNTO_DONACION',
    'Centro de recepción y clasificación de donaciones.',
    'Zona Central',
    'Oruro',
    d.id,
    -17.9647000,
    -67.1060000,
    'VERIFICADO',
    u.id
FROM departamento d
         JOIN usuario u ON u.email = 'seed.demo@sos.local'
WHERE d.nombre = 'Oruro'
  AND NOT EXISTS (
    SELECT 1 FROM punto_ayuda
    WHERE nombre = 'Centro de Acopio Oruro'
);


-- =========================================================
-- NECESIDADES DE LOS CENTROS
-- =========================================================

INSERT IGNORE INTO centro_necesidad
SELECT c.id, n.id
FROM centro c
         JOIN necesidad n
              ON n.nombre IN ('Agua', 'Alimentos', 'Medicamentos')
WHERE c.nombre = 'Centro de Apoyo San José';


INSERT IGNORE INTO centro_necesidad
SELECT c.id, n.id
FROM centro c
         JOIN necesidad n
              ON n.nombre IN ('Ropa', 'Higiene', 'Voluntarios')
WHERE c.nombre = 'Centro Comunitario La Paz';


-- =========================================================
-- NECESIDADES DE LOS PUNTOS
-- =========================================================

INSERT IGNORE INTO punto_necesidad
SELECT p.id, n.id
FROM punto_ayuda p
         JOIN necesidad n
              ON n.nombre IN ('Alimentos', 'Agua', 'Alojamiento')
WHERE p.nombre = 'Refugio Esperanza';


INSERT IGNORE INTO punto_necesidad
SELECT p.id, n.id
FROM punto_ayuda p
         JOIN necesidad n
              ON n.nombre IN ('Agua', 'Higiene', 'Primeros auxilios')
WHERE p.nombre = 'Refugio Municipal Sucre';


INSERT IGNORE INTO punto_necesidad
SELECT p.id, n.id
FROM punto_ayuda p
         JOIN necesidad n
              ON n.nombre IN ('Agua', 'Primeros auxilios', 'Voluntarios')
WHERE p.nombre = 'Incendio Forestal Tarija';


INSERT IGNORE INTO punto_necesidad
SELECT p.id, n.id
FROM punto_ayuda p
         JOIN necesidad n
              ON n.nombre IN ('Agua', 'Alimentos', 'Medicamentos')
WHERE p.nombre = 'Inundaciones Beni';


INSERT IGNORE INTO punto_necesidad
SELECT p.id, n.id
FROM punto_ayuda p
         JOIN necesidad n
              ON n.nombre IN ('Ropa', 'Alimentos')
WHERE p.nombre = 'Punto de Donación Potosí';


INSERT IGNORE INTO punto_necesidad
SELECT p.id, n.id
FROM punto_ayuda p
         JOIN necesidad n
              ON n.nombre IN ('Agua', 'Alimentos', 'Higiene')
WHERE p.nombre = 'Centro de Acopio Oruro';