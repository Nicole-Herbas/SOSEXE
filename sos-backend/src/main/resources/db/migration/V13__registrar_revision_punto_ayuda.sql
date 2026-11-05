ALTER TABLE punto_ayuda
    ADD COLUMN motivo_revision VARCHAR(500) NULL,
    ADD COLUMN revisor_id BIGINT NULL,
    ADD COLUMN fecha_revision DATETIME NULL,
    ADD CONSTRAINT fk_punto_revisor FOREIGN KEY (revisor_id) REFERENCES usuario(id);
