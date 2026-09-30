-- SOS-47
-- Datos de demostración para desarrollo y pruebas

INSERT INTO usuario (
    nombre,
    email,
    password,
    telefono,
    departamento_id,
    rol_id,
    activo
)
SELECT
    'Usuario Demo SOS',
    'seed.demo@sos.local',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    '70000000',
    d.id,
    r.id,
    FALSE
FROM departamento d
         CROSS JOIN rol r
WHERE d.nombre = 'Cochabamba'
  AND r.nombre = 'USER'
  AND NOT EXISTS (
    SELECT 1
    FROM usuario
    WHERE email = 'seed.demo@sos.local'
);