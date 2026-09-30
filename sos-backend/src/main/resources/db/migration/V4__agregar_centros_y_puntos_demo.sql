-- SOS-47
-- Centros y puntos de ayuda de demostración

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
    'Centro de Apoyo Cochabamba Demo',
    'CENTRO_APOYO',
    'Centro de demostración para recepción y distribución de ayuda.',
    'Av. Blanco Galindo',
    'Cochabamba',
    d.id,
    '70700001',
    'centro.cochabamba@sos.demo',
    -17.3895000,
    -66.1568000,
    'VERIFICADO',
    u.id
FROM departamento d
         JOIN usuario u
              ON u.email = 'seed.demo@sos.local'
WHERE d.nombre = 'Cochabamba'
  AND NOT EXISTS (
    SELECT 1
    FROM centro
    WHERE nombre = 'Centro de Apoyo Cochabamba Demo'
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
    'Centro Comunitario La Paz Demo',
    'CENTRO_APOYO',
    'Centro comunitario de demostración para atención y apoyo.',
    'Zona Central',
    'La Paz',
    d.id,
    '70700002',
    'centro.lapaz@sos.demo',
    -16.4897000,
    -68.1193000,
    'VERIFICADO',
    u.id
FROM departamento d
         JOIN usuario u
              ON u.email = 'seed.demo@sos.local'
WHERE d.nombre = 'La Paz'
  AND NOT EXISTS (
    SELECT 1
    FROM centro
    WHERE nombre = 'Centro Comunitario La Paz Demo'
);


-- =========================================================
-- PUNTOS DE AYUDA
-- =========================================================

INSERT INTO punto_ayuda (
    nombre,
    tipo,
    descripcion,
    direccion,
    ciudad,
    departamento_id,
    latitud,
    longitud,
    estado_verificacion,
    creador_id
)
SELECT
    'Refugio Temporal La Paz Demo',
    'REFUGIO',
    'Refugio temporal de demostración para personas afectadas.',
    'Zona Sopocachi',
    'La Paz',
    d.id,
    -16.5000000,
    -68.1300000,
    'VERIFICADO',
    u.id
FROM departamento d
         JOIN usuario u
              ON u.email = 'seed.demo@sos.local'
WHERE d.nombre = 'La Paz'
  AND NOT EXISTS (
    SELECT 1
    FROM punto_ayuda
    WHERE nombre = 'Refugio Temporal La Paz Demo'
);


INSERT INTO punto_ayuda (
    nombre,
    tipo,
    descripcion,
    direccion,
    ciudad,
    departamento_id,
    latitud,
    longitud,
    estado_verificacion,
    creador_id
)
SELECT
    'Punto de Donación Santa Cruz Demo',
    'PUNTO_DONACION',
    'Punto de recepción de alimentos y medicamentos.',
    'Av. Cristo Redentor',
    'Santa Cruz',
    d.id,
    -17.7833000,
    -63.1821000,
    'VERIFICADO',
    u.id
FROM departamento d
         JOIN usuario u
              ON u.email = 'seed.demo@sos.local'
WHERE d.nombre = 'Santa Cruz'
  AND NOT EXISTS (
    SELECT 1
    FROM punto_ayuda
    WHERE nombre = 'Punto de Donación Santa Cruz Demo'
);


INSERT INTO punto_ayuda (
    nombre,
    tipo,
    descripcion,
    direccion,
    ciudad,
    departamento_id,
    latitud,
    longitud,
    estado_verificacion,
    creador_id
)
SELECT
    'Emergencia Tarija Demo',
    'EMERGENCIA',
    'Punto de emergencia utilizado para pruebas del mapa.',
    'Zona Central',
    'Tarija',
    d.id,
    -21.5355000,
    -64.7296000,
    'PENDIENTE',
    u.id
FROM departamento d
         JOIN usuario u
              ON u.email = 'seed.demo@sos.local'
WHERE d.nombre = 'Tarija'
  AND NOT EXISTS (
    SELECT 1
    FROM punto_ayuda
    WHERE nombre = 'Emergencia Tarija Demo'
);


-- =========================================================
-- NECESIDADES DE CENTROS
-- =========================================================

INSERT IGNORE INTO centro_necesidad (
    centro_id,
    necesidad_id
)
SELECT
    c.id,
    n.id
FROM centro c
         JOIN necesidad n
              ON n.nombre IN ('Agua', 'Alimentos', 'Medicamentos')
WHERE c.nombre = 'Centro de Apoyo Cochabamba Demo';


INSERT IGNORE INTO centro_necesidad (
    centro_id,
    necesidad_id
)
SELECT
    c.id,
    n.id
FROM centro c
         JOIN necesidad n
              ON n.nombre IN ('Ropa', 'Voluntarios')
WHERE c.nombre = 'Centro Comunitario La Paz Demo';


-- =========================================================
-- NECESIDADES DE PUNTOS DE AYUDA
-- =========================================================

INSERT IGNORE INTO punto_necesidad (
    punto_id,
    necesidad_id
)
SELECT
    p.id,
    n.id
FROM punto_ayuda p
         JOIN necesidad n
              ON n.nombre IN ('Agua', 'Ropa')
WHERE p.nombre = 'Refugio Temporal La Paz Demo';


INSERT IGNORE INTO punto_necesidad (
    punto_id,
    necesidad_id
)
SELECT
    p.id,
    n.id
FROM punto_ayuda p
         JOIN necesidad n
              ON n.nombre IN ('Alimentos', 'Medicamentos')
WHERE p.nombre = 'Punto de Donación Santa Cruz Demo';


INSERT IGNORE INTO punto_necesidad (
    punto_id,
    necesidad_id
)
SELECT
    p.id,
    n.id
FROM punto_ayuda p
         JOIN necesidad n
              ON n.nombre IN ('Herramientas', 'Voluntarios')
WHERE p.nombre = 'Emergencia Tarija Demo';