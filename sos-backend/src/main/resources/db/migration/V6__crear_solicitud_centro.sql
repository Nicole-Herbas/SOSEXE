CREATE TABLE solicitud_centro (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    nombre_centro VARCHAR(150) NOT NULL,
    tipo_organizacion VARCHAR(100) NOT NULL,
    departamento_id BIGINT NOT NULL,

    nit VARCHAR(50) NOT NULL,
    personeria_juridica VARCHAR(500) NOT NULL,
    fecha_fundacion DATE,
    pagina_web VARCHAR(500),
    descripcion VARCHAR(1000) NOT NULL,
    poblacion_atendida VARCHAR(500),

    nombre_responsable VARCHAR(120) NOT NULL,
    cargo_responsable VARCHAR(100) NOT NULL,
    documento_responsable VARCHAR(50) NOT NULL,
    correo_responsable VARCHAR(150) NOT NULL,
    telefono_responsable VARCHAR(20) NOT NULL,

    ciudad VARCHAR(100) NOT NULL,
    departamento_ubicacion VARCHAR(100) NOT NULL,
    direccion_exacta VARCHAR(250) NOT NULL,
    referencia VARCHAR(500),

    personeria_archivo VARCHAR(255),
    nit_archivo VARCHAR(255),
    identidad_archivo VARCHAR(255),
    domicilio_archivo VARCHAR(255),

    necesidades TEXT,
    donaciones TEXT,

    solicita_voluntarios BOOLEAN NOT NULL,
    actividades_voluntariado TEXT,
    descripcion_voluntariado VARCHAR(1000),

    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',

    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_solicitud_centro_departamento
        FOREIGN KEY (departamento_id)
        REFERENCES departamento(id)
);

CREATE INDEX idx_solicitud_centro_estado
    ON solicitud_centro(estado);

CREATE INDEX idx_solicitud_centro_departamento
    ON solicitud_centro(departamento_id);