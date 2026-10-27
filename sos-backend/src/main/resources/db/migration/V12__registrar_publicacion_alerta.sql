-- SOS-79: detectar cambios posteriores a la revisión y conservar el evento de publicación.
ALTER TABLE alerta ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

CREATE TABLE evento_publicacion_alerta (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alerta_id BIGINT NOT NULL,
    administrador_id BIGINT NOT NULL,
    fecha DATETIME(6) NOT NULL,
    estado_anterior VARCHAR(30) NOT NULL,
    estado_nuevo VARCHAR(30) NOT NULL,
    CONSTRAINT uk_evento_publicacion_alerta UNIQUE (alerta_id),
    -- Sin cascada: una eliminación no debe borrar la evidencia de publicación.
    CONSTRAINT fk_evento_publicacion_alerta FOREIGN KEY (alerta_id) REFERENCES alerta(id),
    CONSTRAINT fk_evento_publicacion_administrador FOREIGN KEY (administrador_id) REFERENCES usuario(id)
);
