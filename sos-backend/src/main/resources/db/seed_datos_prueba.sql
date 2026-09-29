-- =============================================================================
-- Script de Datos de Prueba (Seed Data) para SOS.exe
-- Base de datos: sos_db (MySQL 8.4)
-- Compatible con Spring Boot + BCrypt ($2a$10$...)
-- =============================================================================

SET NAMES utf8mb4;
USE sos_db;

-- -----------------------------------------------------------------------------
-- 1. USUARIOS (Password para todos: "Password123*")
-- Hash BCrypt generado: $2a$10$mwJlFh0IuZYcFap2Pf7kQuEtBuVcEQAPHWbeeOa1SNtyg1OT/jgF6
-- -----------------------------------------------------------------------------
INSERT INTO usuario (id, nombre, email, password, telefono, departamento_id, rol_id, activo, fecha_creacion)
VALUES 
    (10, 'Carlos Mendoza', 'carlos.mendoza@sos.org', '$2a$10$mwJlFh0IuZYcFap2Pf7kQuEtBuVcEQAPHWbeeOa1SNtyg1OT/jgF6', '71234567', 3, 1, 1, NOW()), -- Admin en Cochabamba
    (11, 'Lucía Fernández', 'lucia.fernandez@sos.org', '$2a$10$mwJlFh0IuZYcFap2Pf7kQuEtBuVcEQAPHWbeeOa1SNtyg1OT/jgF6', '72345678', 2, 2, 1, NOW()), -- Usuario en La Paz
    (12, 'Roberto Vaca', 'roberto.vaca@sos.org', '$2a$10$mwJlFh0IuZYcFap2Pf7kQuEtBuVcEQAPHWbeeOa1SNtyg1OT/jgF6', '73456789', 7, 2, 1, NOW()), -- Usuario en Santa Cruz
    (13, 'Elena Morales', 'elena.morales@sos.org', '$2a$10$mwJlFh0IuZYcFap2Pf7kQuEtBuVcEQAPHWbeeOa1SNtyg1OT/jgF6', '74567890', 6, 2, 1, NOW()), -- Usuario en Tarija
    (14, 'Mateo Quispe', 'mateo.quispe@sos.org', '$2a$10$mwJlFh0IuZYcFap2Pf7kQuEtBuVcEQAPHWbeeOa1SNtyg1OT/jgF6', '75678901', 4, 2, 1, NOW())  -- Usuario en Oruro
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    password = VALUES(password),
    telefono = VALUES(telefono);

-- -----------------------------------------------------------------------------
-- 2. CENTROS DE ACOPIO / REFUGIOS
-- -----------------------------------------------------------------------------
INSERT INTO centro (id, nombre, tipo, descripcion, direccion, ciudad, departamento_id, telefono, email, latitud, longitud, estado_verificacion, responsable_id, fecha_creacion, fecha_actualizacion)
VALUES 
    (2, 'Centro de Acopio Estadio Félix Capriles', 'ACOPIO', 'Centro principal para recolección de víveres, frazadas y agua en Cochabamba.', 'Av. Libertador Simón Bolívar s/n (Curva Norte)', 'Cochabamba', 3, '44256789', 'acopio.cbba@sos.org', -17.3793000, -66.1601000, 'VERIFICADO', 10, NOW(), NOW()),
    (3, 'Refugio Temporal San Francisco', 'REFUGIO', 'Albergue acondicionado con camas y atención médica de emergencia para familias afectadas.', 'Calle Sagárnaga esq. Murillo #120', 'La Paz', 2, '22345678', 'refugio.lapaz@sos.org', -16.4958000, -68.1372000, 'VERIFICADO', 11, NOW(), NOW()),
    (4, 'Centro de Ayuda y Rescate Chiquitania', 'ACOPIO', 'Punto logístico de distribución de insumos médicos y agua para brigadistas contra incendios.', 'Av. Cristo Redentor 4to Anillo', 'Santa Cruz de la Sierra', 7, '33456789', 'chiquitania.ayuda@sos.org', -17.7554000, -63.1725000, 'VERIFICADO', 12, NOW(), NOW()),
    (5, 'Centro Comunitario San Roque', 'COMEDOR', 'Comedor solidario que brinda desayuno y almuerzo caliente.', 'Calle Gral. Trigo #850', 'Tarija', 6, '46641234', 'comedor.tarija@sos.org', -21.5332000, -64.7314000, 'VERIFICADO', 13, NOW(), NOW()),
    (6, 'Puesto de Auxilio Minero Socavón', 'SALUD', 'Puesto médico de campaña con paramédicos y atención de primeros auxilios.', 'Calle Adolfo Mier esq. Linares', 'Oruro', 4, '52543210', 'salud.oruro@sos.org', -17.9678000, -67.1123000, 'PENDIENTE', 14, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    descripcion = VALUES(descripcion),
    estado_verificacion = VALUES(estado_verificacion);

-- -----------------------------------------------------------------------------
-- 3. NECESIDADES DE LOS CENTROS (centro_necesidad)
-- (1=Agua, 2=Alimentos, 3=Medicamentos, 4=Ropa, 5=Herramientas, 6=Voluntarios)
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO centro_necesidad (centro_id, necesidad_id)
VALUES 
    (2, 1), (2, 2), (2, 4),        -- Félix Capriles: Agua, Alimentos, Ropa
    (3, 2), (3, 3), (3, 4), (3, 6), -- San Francisco: Alimentos, Medicamentos, Ropa, Voluntarios
    (4, 1), (4, 3), (4, 5), (4, 6), -- Chiquitania: Agua, Medicamentos, Herramientas, Voluntarios
    (5, 1), (5, 2), (5, 6),        -- San Roque: Agua, Alimentos, Voluntarios
    (6, 3), (6, 6);                -- Socavón: Medicamentos, Voluntarios

-- -----------------------------------------------------------------------------
-- 4. PUNTOS DE AYUDA (Reportados por la comunidad)
-- -----------------------------------------------------------------------------
INSERT INTO punto_ayuda (id, nombre, tipo, descripcion, direccion, ciudad, departamento_id, latitud, longitud, estado_verificacion, creador_id, fecha_creacion, fecha_actualizacion)
VALUES 
    (1, 'Olla Común Zona Sur - K\'ara K\'ara', 'COMIDA', 'Vecinos organizados preparando comida diaria para 150 familias damnificadas.', 'Av. Petrolera Km 6.5', 'Cochabamba', 3, -17.4421000, -66.1284000, 'VERIFICADO', 10, NOW(), NOW()),
    (2, 'Punto de Hidratación Achumani', 'AGUA', 'Tanque cisterna comunal abasteciendo agua potable.', 'Calle 22 de Achumani s/n', 'La Paz', 2, -16.5298000, -68.0734000, 'VERIFICADO', 11, NOW(), NOW()),
    (3, 'Acopio Vecinal Plan 3000', 'VIVERES', 'Recolección barrial de ropa liviana y alimentos no perecederos.', 'Rotonda del Plan 3000', 'Santa Cruz de la Sierra', 7, -17.8203000, -63.1365000, 'PENDIENTE', 12, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    descripcion = VALUES(descripcion);

INSERT IGNORE INTO punto_necesidad (punto_id, necesidad_id)
VALUES 
    (1, 1), (1, 2),
    (2, 1),
    (3, 2), (3, 4);

-- -----------------------------------------------------------------------------
-- 5. CONVOCATORIAS DE VOLUNTARIADO
-- -----------------------------------------------------------------------------
INSERT INTO voluntariado (id, titulo, descripcion, fecha_inicio, fecha_fin, habilidades_requeridas, estado, centro_id, creado_por, fecha_creacion, fecha_actualizacion)
VALUES 
    (1, 'Clasificación y Empaquetado de Donaciones', 'Requerimos personas entusiastas para ordenar donaciones de ropa por tallas y armar canastas familiares de víveres.', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 'Organización, trabajo en equipo, capacidad para cargar paquetes medianos', 'PUBLICADO', 2, 10, NOW(), NOW()),
    (2, 'Brigada Médica y Apoyo Psicológico', 'Médicos generales, enfermeros(as) y estudiantes avanzados para atención primaria y contención emocional.', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 'Estudiantes de medicina o enfermería, primeros auxilios, empatía', 'PUBLICADO', 3, 11, NOW(), NOW()),
    (3, 'Logística y Transporte de Insumos a Brigadistas', 'Conductores con camionetas 4x4 para transportar agua y suero a las cuadrillas de bomberos forestales.', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 'Licencia de conducir vigente, vehículo 4x4 o camioneta, conocimiento de rutas rurales', 'PUBLICADO', 4, 12, NOW(), NOW()),
    (4, 'Elaboración y Reparto de Raciones Calientes', 'Cocineros aficionados y ayudantes para preparar 300 platos diarios en el comedor comunitario.', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 'Manipulación de alimentos, cocina básica, buena predisposición', 'BORRADOR', 5, 13, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    titulo = VALUES(titulo),
    descripcion = VALUES(descripcion),
    estado = VALUES(estado);

-- -----------------------------------------------------------------------------
-- 6. POSTULACIONES A VOLUNTARIADO
-- -----------------------------------------------------------------------------
INSERT INTO postulacion (id, voluntariado_id, usuario_id, fecha_postulacion, estado, disponibilidad, comentario)
VALUES 
    (1, 1, 11, NOW(), 'ACEPTADA', 'Fines de semana y tardes a partir de las 14:00', 'Tengo experiencia previa en voluntariado con Cruz Roja.'),
    (2, 1, 12, NOW(), 'PENDIENTE', 'Lunes a viernes mañanas', 'Disponible para colaborar en almacén y descarga.'),
    (3, 2, 13, NOW(), 'PENDIENTE', 'Tiempo completo durante el fin de semana', 'Soy estudiante de último año de enfermería en la UCB.'),
    (4, 3, 14, NOW(), 'ACEPTADA', 'Disponibilidad inmediata las 24 horas', 'Cuento con camioneta doble cabina y botiquín de primeros auxilios.')
ON DUPLICATE KEY UPDATE 
    estado = VALUES(estado),
    disponibilidad = VALUES(disponibilidad);

-- -----------------------------------------------------------------------------
-- 7. DONACIONES MONETARIAS
-- -----------------------------------------------------------------------------
INSERT INTO donacion (id, codigo, monto, metodo, anonima, fecha, centro_id, usuario_id)
VALUES 
    (1, 'DON-A1B2C3D4', 250.00, 'QR_SIMPLE', 0, NOW(), 2, 11),
    (2, 'DON-E5F6G7H8', 500.00, 'TRANSFERENCIA', 0, NOW(), 4, 12),
    (3, 'DON-X9Y8Z7W6', 100.00, 'TARJETA', 1, NOW(), 3, NULL),
    (4, 'DON-K1L2M3N4', 1200.00, 'TRANSFERENCIA', 0, NOW(), 4, 13),
    (5, 'DON-P5Q6R7S8', 50.00, 'EFECTIVO', 1, NOW(), 5, NULL)
ON DUPLICATE KEY UPDATE 
    monto = VALUES(monto),
    metodo = VALUES(metodo);

-- -----------------------------------------------------------------------------
-- 8. NOTICIAS Y REPORTES INFORMATIVOS
-- -----------------------------------------------------------------------------
INSERT INTO noticia (id, titulo, contenido, categoria, imagen_url, fuente, fecha_publicacion, estado, autor_id, fecha_creacion, fecha_actualizacion)
VALUES 
    (1, 'Habilitan 5 nuevos centros de acopio en Cochabamba y La Paz', 
     'Ante las intensas lluvias y desbordes registrados en las últimas horas, la red SOS.exe junto a brigadas voluntarias habilitó centros estratégicos para recibir insumos esenciales. Se prioriza la recolección de agua embotellada, leche en polvo y pastillas potabilizadoras.', 
     'EMERGENCIA', 
     'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800', 
     'Defensa Civil Bolivia / SOS.exe', 
     NOW(), 'PUBLICADO', 10, NOW(), NOW()),
    (2, 'Llegan más de 2 toneladas de suministros a la Chiquitania', 
     'Gracias a la masiva respuesta ciudadana y a las donaciones procesadas en la plataforma, las cuadrillas de guardaparques recibieron sueros rehidratantes, botas de combate y equipamiento contra incendios forestales.', 
     'LOGISTICA', 
     'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800', 
     'Comité de Operaciones de Emergencia (COED)', 
     NOW(), 'PUBLICADO', 10, NOW(), NOW()),
    (3, 'Campaña solidaria de abrigo supera el 80% de su meta en Tarija', 
     'El comedor comunitario San Roque informa que se han distribuido más de 600 frazadas a adultos mayores y niños en situación de vulnerabilidad en la cuenca del Guadalquivir.', 
     'SOLIDARIDAD', 
     'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800', 
     'Diario El País Tarija', 
     NOW(), 'PUBLICADO', 10, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    titulo = VALUES(titulo),
    contenido = VALUES(contenido),
    estado = VALUES(estado);

-- -----------------------------------------------------------------------------
-- 9. ALERTAS TEMPRANAS
-- -----------------------------------------------------------------------------
INSERT INTO alerta (id, titulo, mensaje, severidad, fecha_publicacion, fecha_expiracion, estado, departamento_id, creado_por, fecha_creacion)
VALUES 
    (1, 'Alerta Naranja: Crecida del Río Rocha', 
     'Se prevén desbordes en sectores bajos de Colcapirhua y Quillacollo. Tomar previsiones y evitar transitar por puentes peatonales cercanos al cauce.', 
     'ALTA', NOW(), DATE_ADD(NOW(), INTERVAL 48 HOUR), 'ACTIVA', 3, 10, NOW()),
    (2, 'Alerta Roja: Incendio forestal en San Matías', 
     'Foco de calor activo con vientos superiores a 40 km/h. Se prohíbe el tránsito vehicular en rutas secundarias y se evacúa a comunidades ribereñas.', 
     'CRITICA', NOW(), DATE_ADD(NOW(), INTERVAL 72 HOUR), 'ACTIVA', 7, 10, NOW()),
    (3, 'Alerta Amarilla: Descenso brusco de temperaturas en el altiplano', 
     'Heladas nocturnas que alcanzarán hasta -4°C en zonas altas de Oruro y Potosí. Proteger ganado y abrigar a niños y adultos mayores.', 
     'MEDIA', NOW(), DATE_ADD(NOW(), INTERVAL 36 HOUR), 'ACTIVA', 4, 10, NOW())
ON DUPLICATE KEY UPDATE 
    titulo = VALUES(titulo),
    mensaje = VALUES(mensaje),
    estado = VALUES(estado);

-- -----------------------------------------------------------------------------
-- 10. SUSCRIPCIONES Y ALERTAS SMS
-- -----------------------------------------------------------------------------
INSERT INTO suscripcion_sms (id, usuario_id, telefono, departamento_id, activa, consentimiento_fecha)
VALUES 
    (1, 11, '72345678', 2, 1, NOW()),
    (2, 12, '73456789', 7, 1, NOW()),
    (3, 13, '74567890', 6, 1, NOW())
ON DUPLICATE KEY UPDATE 
    activa = VALUES(activa);

INSERT INTO envio_sms (id, alerta_id, usuario_id, proveedor, external_id, estado, intentos, enviado_en, error_mensaje, fecha_creacion)
VALUES 
    (1, 2, 12, 'TWILIO', 'SM1234567890abcdef', 'ENVIADO', 1, NOW(), NULL, NOW()),
    (2, 1, 11, 'TWILIO', 'SM9876543210fedcba', 'ENVIADO', 1, NOW(), NULL, NOW())
ON DUPLICATE KEY UPDATE 
    estado = VALUES(estado);

-- -----------------------------------------------------------------------------
-- 11. NOTIFICACIONES EN LA PLATAFORMA
-- -----------------------------------------------------------------------------
INSERT INTO notificacion (id, alerta_id, usuario_id, titulo, mensaje, leida, fecha_creacion)
VALUES 
    (1, 1, 11, 'Aviso de Emergencia - Río Rocha', 'Se ha emitido Alerta Naranja en el departamento de Cochabamba por desborde.', 0, NOW()),
    (2, 2, 12, 'Emergencia Crítica - Incendio Forestal', 'Alerta Roja activa en San Matías (Santa Cruz). Cuadrillas en camino.', 1, NOW()),
    (3, NULL, 11, 'Postulación aceptada', 'Tu postulación para "Clasificación y Empaquetado" ha sido aprobada.', 0, NOW())
ON DUPLICATE KEY UPDATE 
    titulo = VALUES(titulo),
    mensaje = VALUES(mensaje);

-- =============================================================================
-- Fin del script de prueba
-- =============================================================================
