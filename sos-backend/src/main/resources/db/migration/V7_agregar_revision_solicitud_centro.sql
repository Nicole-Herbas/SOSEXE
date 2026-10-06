-- SOS-43: datos de la revisión del administrador sobre una solicitud de centro

ALTER TABLE solicitud_centro
    ADD COLUMN observacion_admin VARCHAR(1000) NULL,
    ADD COLUMN fecha_revision DATETIME NULL,
    ADD COLUMN revisado_por BIGINT NULL;

ALTER TABLE solicitud_centro
    ADD CONSTRAINT fk_solicitud_centro_revisor
        FOREIGN KEY (revisado_por)
        REFERENCES usuario(id);
