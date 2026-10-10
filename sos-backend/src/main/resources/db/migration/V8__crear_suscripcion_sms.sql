-- SOS-63: Tabla de suscripciones SMS para alertas de emergencia por región.
-- La columna consentimiento_fecha usa DEFAULT CURRENT_TIMESTAMP porque la entidad
-- SuscripcionSms la declara con insertable = false, updatable = false.

CREATE TABLE IF NOT EXISTS suscripcion_sms (
    id                   BIGINT       NOT NULL AUTO_INCREMENT,
    usuario_id           BIGINT       NOT NULL,
    telefono             VARCHAR(20)  NOT NULL,
    departamento_id      BIGINT       NOT NULL,
    activa               TINYINT(1)   NOT NULL DEFAULT 1,
    consentimiento_fecha DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_suscripcion_sms PRIMARY KEY (id),

    -- Un usuario solo puede tener una suscripción SMS
    CONSTRAINT uq_suscripcion_sms_usuario UNIQUE (usuario_id),

    CONSTRAINT fk_suscripcion_sms_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_suscripcion_sms_departamento
        FOREIGN KEY (departamento_id)
        REFERENCES departamento (id)
        ON DELETE RESTRICT
);
