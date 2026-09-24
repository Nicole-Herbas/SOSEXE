package bo.edu.sos.backend.security;

import bo.edu.sos.backend.entity.Rol;
import bo.edu.sos.backend.entity.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;


    @BeforeEach
    void setUp() {

        String secret =
                "12345678901234567890123456789012";

        long expirationMs =
                60000;

        jwtService =
                new JwtService(
                        secret,
                        expirationMs
                );
    }


    @Test
    void debeGenerarTokenValido() {

        Rol rol = new Rol();
        rol.setNombre("ADMIN");

        Usuario usuario =
                new Usuario();

        usuario.setId(1L);
        usuario.setEmail(
                "admin@sos.com"
        );
        usuario.setRol(rol);


        String token =
                jwtService.generarToken(
                        usuario
                );


        assertNotNull(token);

        assertTrue(
                jwtService.esValido(token)
        );
    }


    @Test
    void debeExtraerEmailYRolDelToken() {

        Rol rol = new Rol();
        rol.setNombre("USER");

        Usuario usuario =
                new Usuario();

        usuario.setId(5L);
        usuario.setEmail(
                "usuario@sos.com"
        );
        usuario.setRol(rol);


        String token =
                jwtService.generarToken(
                        usuario
                );


        assertEquals(
                "usuario@sos.com",
                jwtService.extraerEmail(token)
        );

        assertEquals(
                "USER",
                jwtService.extraerRol(token)
        );
    }


    @Test
    void tokenFalsoDebeSerInvalido() {

        String tokenFalso =
                "esto-no-es-un-jwt";


        assertFalse(
                jwtService.esValido(
                        tokenFalso
                )
        );
    }
}