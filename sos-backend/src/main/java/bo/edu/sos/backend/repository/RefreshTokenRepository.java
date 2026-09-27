package bo.edu.sos.backend.repository;

import bo.edu.sos.backend.entity.RefreshToken;
import bo.edu.sos.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository
        extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(
            String tokenHash
    );

    void deleteByUsuario(
            Usuario usuario
    );
}