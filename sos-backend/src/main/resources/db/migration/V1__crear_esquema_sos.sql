-- SOS.exe - Base de datos v1
-- MySQL 8.4
-- Ejecutar sobre la base sos_db
-- La misma estructura está pensada para Flyway.

SET NAMES utf8mb4;

CREATE TABLE rol (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE departamento (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE usuario (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    departamento_id BIGINT,
    rol_id BIGINT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_departamento
        FOREIGN KEY (departamento_id) REFERENCES departamento(id),
    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (rol_id) REFERENCES rol(id)
);

CREATE TABLE centro (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(40) NOT NULL,
    descripcion VARCHAR(500),
    direccion VARCHAR(250) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    departamento_id BIGINT NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(150),
    latitud DECIMAL(10,7) NOT NULL,
    longitud DECIMAL(10,7) NOT NULL,
    estado_verificacion VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    responsable_id BIGINT,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_centro_departamento
        FOREIGN KEY (departamento_id) REFERENCES departamento(id),
    CONSTRAINT fk_centro_responsable
        FOREIGN KEY (responsable_id) REFERENCES usuario(id)
);

CREATE TABLE necesidad (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

CREATE TABLE centro_necesidad (
    centro_id BIGINT NOT NULL,
    necesidad_id BIGINT NOT NULL,
    PRIMARY KEY (centro_id, necesidad_id),
    CONSTRAINT fk_cn_centro
        FOREIGN KEY (centro_id) REFERENCES centro(id) ON DELETE CASCADE,
    CONSTRAINT fk_cn_necesidad
        FOREIGN KEY (necesidad_id) REFERENCES necesidad(id) ON DELETE CASCADE
);

CREATE TABLE punto_ayuda (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    tipo VARCHAR(40) NOT NULL,
    descripcion VARCHAR(500),
    direccion VARCHAR(250),
    ciudad VARCHAR(100),
    departamento_id BIGINT NOT NULL,
    latitud DECIMAL(10,7) NOT NULL,
    longitud DECIMAL(10,7) NOT NULL,
    estado_verificacion VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    creador_id BIGINT NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_punto_departamento
        FOREIGN KEY (departamento_id) REFERENCES departamento(id),
    CONSTRAINT fk_punto_creador
        FOREIGN KEY (creador_id) REFERENCES usuario(id)
);

CREATE TABLE punto_necesidad (
    punto_id BIGINT NOT NULL,
    necesidad_id BIGINT NOT NULL,
    PRIMARY KEY (punto_id, necesidad_id),
    CONSTRAINT fk_pn_punto
        FOREIGN KEY (punto_id) REFERENCES punto_ayuda(id) ON DELETE CASCADE,
    CONSTRAINT fk_pn_necesidad
        FOREIGN KEY (necesidad_id) REFERENCES necesidad(id) ON DELETE CASCADE
);

CREATE TABLE voluntariado (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(180) NOT NULL,
    descripcion VARCHAR(1000) NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    habilidades_requeridas VARCHAR(500),
    estado VARCHAR(30) NOT NULL DEFAULT 'BORRADOR',
    centro_id BIGINT NOT NULL,
    creado_por BIGINT NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_voluntariado_centro
        FOREIGN KEY (centro_id) REFERENCES centro(id),
    CONSTRAINT fk_voluntariado_creado_por
        FOREIGN KEY (creado_por) REFERENCES usuario(id)
);

CREATE TABLE postulacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    voluntariado_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    fecha_postulacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    disponibilidad VARCHAR(255),
    comentario VARCHAR(500),
    CONSTRAINT uk_postulacion_usuario_voluntariado
        UNIQUE (voluntariado_id, usuario_id),
    CONSTRAINT fk_postulacion_voluntariado
        FOREIGN KEY (voluntariado_id) REFERENCES voluntariado(id) ON DELETE CASCADE,
    CONSTRAINT fk_postulacion_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE donacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(40) NOT NULL UNIQUE,
    monto DECIMAL(12,2) NOT NULL,
    metodo VARCHAR(30) NOT NULL,
    anonima BOOLEAN NOT NULL DEFAULT FALSE,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    centro_id BIGINT NOT NULL,
    usuario_id BIGINT,
    CONSTRAINT fk_donacion_centro
        FOREIGN KEY (centro_id) REFERENCES centro(id),
    CONSTRAINT fk_donacion_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

CREATE TABLE noticia (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(220) NOT NULL,
    contenido TEXT NOT NULL,
    categoria VARCHAR(60) NOT NULL,
    imagen_url VARCHAR(500),
    fuente VARCHAR(250),
    fecha_publicacion DATETIME,
    estado VARCHAR(30) NOT NULL DEFAULT 'BORRADOR',
    autor_id BIGINT NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_noticia_autor
        FOREIGN KEY (autor_id) REFERENCES usuario(id)
);

CREATE TABLE alerta (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(220) NOT NULL,
    mensaje VARCHAR(1000) NOT NULL,
    severidad VARCHAR(30) NOT NULL,
    fecha_publicacion DATETIME,
    fecha_expiracion DATETIME,
    estado VARCHAR(30) NOT NULL DEFAULT 'BORRADOR',
    departamento_id BIGINT NOT NULL,
    creado_por BIGINT NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alerta_departamento
        FOREIGN KEY (departamento_id) REFERENCES departamento(id),
    CONSTRAINT fk_alerta_creado_por
        FOREIGN KEY (creado_por) REFERENCES usuario(id)
);

CREATE TABLE suscripcion_sms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    departamento_id BIGINT NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    consentimiento_fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sms_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_sms_departamento
        FOREIGN KEY (departamento_id) REFERENCES departamento(id)
);

CREATE TABLE envio_sms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alerta_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    proveedor VARCHAR(40) NOT NULL,
    external_id VARCHAR(150),
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    intentos INT NOT NULL DEFAULT 0,
    enviado_en DATETIME,
    error_mensaje VARCHAR(500),
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_envio_sms_alerta_usuario
        UNIQUE (alerta_id, usuario_id),
    CONSTRAINT fk_envio_sms_alerta
        FOREIGN KEY (alerta_id) REFERENCES alerta(id) ON DELETE CASCADE,
    CONSTRAINT fk_envio_sms_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE notificacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alerta_id BIGINT,
    usuario_id BIGINT NOT NULL,
    titulo VARCHAR(220) NOT NULL,
    mensaje VARCHAR(1000) NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_notificacion_alerta_usuario
        UNIQUE (alerta_id, usuario_id),
    CONSTRAINT fk_notificacion_alerta
        FOREIGN KEY (alerta_id) REFERENCES alerta(id) ON DELETE CASCADE,
    CONSTRAINT fk_notificacion_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE INDEX idx_usuario_departamento ON usuario(departamento_id);
CREATE INDEX idx_centro_departamento ON centro(departamento_id);
CREATE INDEX idx_centro_estado ON centro(estado_verificacion);
CREATE INDEX idx_punto_departamento ON punto_ayuda(departamento_id);
CREATE INDEX idx_punto_estado ON punto_ayuda(estado_verificacion);
CREATE INDEX idx_voluntariado_estado ON voluntariado(estado);
CREATE INDEX idx_postulacion_estado ON postulacion(estado);
CREATE INDEX idx_donacion_fecha ON donacion(fecha);
CREATE INDEX idx_noticia_estado ON noticia(estado);
CREATE INDEX idx_alerta_departamento_estado ON alerta(departamento_id, estado);
CREATE INDEX idx_envio_sms_estado ON envio_sms(estado);

INSERT INTO rol (nombre) VALUES
('ADMIN'),
('USER');

INSERT INTO departamento (nombre) VALUES
('Chuquisaca'),
('La Paz'),
('Cochabamba'),
('Oruro'),
('Potosi'),
('Tarija'),
('Santa Cruz'),
('Beni'),
('Pando');

INSERT INTO necesidad (nombre, descripcion) VALUES
('Agua', 'Agua potable y abastecimiento'),
('Alimentos', 'Alimentos y víveres'),
('Medicamentos', 'Medicamentos e insumos médicos'),
('Ropa', 'Ropa y abrigo'),
('Herramientas', 'Herramientas y materiales'),
('Voluntarios', 'Necesidad de apoyo humano');
