-- SOS-40: Perfil de voluntario
-- Almacena los datos del perfil de voluntario vinculado 1:1 al usuario

CREATE TABLE perfil_voluntario (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id          BIGINT       NOT NULL UNIQUE,
    telefono            VARCHAR(20)  NOT NULL,
    email_contacto      VARCHAR(150) NOT NULL,
    departamento_id     BIGINT       NOT NULL,
    ciudad              VARCHAR(100) NOT NULL,
    habilidades         VARCHAR(500) NOT NULL,
    disponibilidad      VARCHAR(500) NOT NULL,
    fecha_creacion      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_perfil_vol_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_perfil_vol_departamento
        FOREIGN KEY (departamento_id) REFERENCES departamento(id)
);

CREATE INDEX idx_perfil_vol_usuario ON perfil_voluntario(usuario_id);
