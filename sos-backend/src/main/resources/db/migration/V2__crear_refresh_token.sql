CREATE TABLE refresh_token (
                               id BIGINT AUTO_INCREMENT PRIMARY KEY,

                               token_hash CHAR(64) NOT NULL UNIQUE,

                               usuario_id BIGINT NOT NULL,

                               fecha_expiracion DATETIME NOT NULL,

                               revocado BOOLEAN NOT NULL DEFAULT FALSE,

                               fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

                               CONSTRAINT fk_refresh_token_usuario
                                   FOREIGN KEY (usuario_id)
                                       REFERENCES usuario(id)
                                       ON DELETE CASCADE
);

CREATE INDEX idx_refresh_token_usuario
    ON refresh_token(usuario_id);

CREATE INDEX idx_refresh_token_hash
    ON refresh_token(token_hash);