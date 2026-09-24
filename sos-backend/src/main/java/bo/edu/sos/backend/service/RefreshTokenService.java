package bo.edu.sos.backend.service;

import bo.edu.sos.backend.entity.RefreshToken;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    private final long expirationMs;

    private final SecureRandom secureRandom =
            new SecureRandom();


    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            @Value("${refresh-token.expiration-ms}")
            long expirationMs) {

        this.refreshTokenRepository =
                refreshTokenRepository;

        this.expirationMs =
                expirationMs;
    }


    @Transactional
    public String crear(Usuario usuario) {

        refreshTokenRepository
                .deleteByUsuario(usuario);


        byte[] randomBytes =
                new byte[32];

        secureRandom.nextBytes(
                randomBytes
        );


        String token =
                Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(
                                randomBytes
                        );


        RefreshToken refreshToken =
                new RefreshToken();

        refreshToken.setTokenHash(
                hash(token)
        );

        refreshToken.setUsuario(
                usuario
        );

        refreshToken.setFechaExpiracion(
                LocalDateTime.now()
                        .plusNanos(
                                expirationMs * 1_000_000
                        )
        );

        refreshToken.setRevocado(
                false
        );


        refreshTokenRepository.save(
                refreshToken
        );


        return token;
    }


    @Transactional(readOnly = true)
    public Optional<Usuario> validar(
            String token) {

        return refreshTokenRepository
                .findByTokenHash(
                        hash(token)
                )
                .filter(refresh ->
                        !Boolean.TRUE.equals(
                                refresh.getRevocado()
                        )
                )
                .filter(refresh ->
                        refresh
                                .getFechaExpiracion()
                                .isAfter(
                                        LocalDateTime.now()
                                )
                )
                .map(
                        RefreshToken::getUsuario
                );
    }


    @Transactional
    public void revocar(
            String token) {

        refreshTokenRepository
                .findByTokenHash(
                        hash(token)
                )
                .ifPresent(refresh -> {

                    refresh.setRevocado(
                            true
                    );

                    refreshTokenRepository
                            .save(refresh);

                });
    }


    private String hash(
            String token) {

        try {

            MessageDigest digest =
                    MessageDigest
                            .getInstance(
                                    "SHA-256"
                            );


            byte[] hash =
                    digest.digest(
                            token.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );


            return bytesToHex(hash);

        } catch (
                NoSuchAlgorithmException ex
        ) {

            throw new IllegalStateException(
                    "SHA-256 no disponible",
                    ex
            );
        }
    }


    private String bytesToHex(
            byte[] bytes) {

        StringBuilder result =
                new StringBuilder();


        for (byte b : bytes) {

            result.append(
                    String.format(
                            "%02x",
                            b
                    )
            );
        }


        return result.toString();
    }
}