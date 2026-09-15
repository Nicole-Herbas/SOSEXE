package bo.edu.sos.backend.constants;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AuthConstantsTest {

    @Test
    void todasLasConstantesDebenTenerValor() {
        assertNotNull(AuthConstants.EMAIL_YA_REGISTRADO);
        assertNotNull(AuthConstants.CREDENCIALES_INCORRECTAS);
        assertNotNull(AuthConstants.REGISTRO_EXITOSO);
        assertNotNull(AuthConstants.TOKEN_PREFIX);
        assertNotNull(AuthConstants.TIPO_TOKEN);
        assertNotNull(AuthConstants.ROL_CIUDADANO_ID);

        assertFalse(AuthConstants.EMAIL_YA_REGISTRADO.isBlank());
        assertFalse(AuthConstants.CREDENCIALES_INCORRECTAS.isBlank());
        assertFalse(AuthConstants.REGISTRO_EXITOSO.isBlank());
        assertFalse(AuthConstants.TOKEN_PREFIX.isBlank());
        assertFalse(AuthConstants.TIPO_TOKEN.isBlank());
    }

    @Test
    void rolCiudadanoIdDebeSerPositivo() {
        assertTrue(AuthConstants.ROL_CIUDADANO_ID > 0);
    }

    @Test
    void tokenPrefixDebeContenerPalabrajwt() {
        assertTrue(AuthConstants.TOKEN_PREFIX.toLowerCase().contains("jwt"));
    }
}
