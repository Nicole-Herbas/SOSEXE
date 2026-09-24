package bo.edu.sos.backend.security;

import bo.edu.sos.backend.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long accessExpirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-expiration-ms}") long accessExpirationMs) {

        this.key = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );

        this.accessExpirationMs = accessExpirationMs;
    }


    public String generarToken(Usuario usuario) {

        Date ahora = new Date();

        Date expiracion =
                new Date(
                        ahora.getTime() + accessExpirationMs
                );


        return Jwts.builder()
                .setSubject(usuario.getEmail())
                .claim("usuarioId", usuario.getId())
                .claim(
                        "rol",
                        usuario.getRol().getNombre()
                )
                .setIssuedAt(ahora)
                .setExpiration(expiracion)
                .signWith(
                        key,
                        SignatureAlgorithm.HS256
                )
                .compact();
    }


    public String extraerEmail(String token) {

        return extraerClaims(token)
                .getSubject();
    }


    public String extraerRol(String token) {

        return extraerClaims(token)
                .get(
                        "rol",
                        String.class
                );
    }


    public boolean esValido(String token) {

        try {

            Claims claims =
                    extraerClaims(token);

            return claims
                    .getExpiration()
                    .after(new Date());

        } catch (JwtException |
                 IllegalArgumentException ex) {

            return false;
        }
    }


    private Claims extraerClaims(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}