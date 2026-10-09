package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.EstadoVerificacion;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.NecesidadRepository;
import bo.edu.sos.backend.repository.PuntoAyudaRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class PuntoAyudaServiceTest {

    @Mock
    private PuntoAyudaRepository puntoAyudaRepository;

    @Mock
    private DepartamentoRepository departamentoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private NecesidadRepository necesidadRepository;

    @InjectMocks
    private PuntoAyudaService puntoAyudaService;

    @Test
    void cambiarEstado_rechazaEstadoInvalido_sinTocarLaBaseDeDatos() {

        assertThrows(BadRequestException.class,
                () -> puntoAyudaService.cambiarEstado(1L, "INVENTADO"));

        verifyNoInteractions(puntoAyudaRepository);
    }

    @Test
    void esValido_aceptaLosCuatroEstadosDefinidos() {

        assertTrue(EstadoVerificacion.esValido(EstadoVerificacion.PENDIENTE));
        assertTrue(EstadoVerificacion.esValido(EstadoVerificacion.EN_REVISION));
        assertTrue(EstadoVerificacion.esValido(EstadoVerificacion.VERIFICADO));
        assertTrue(EstadoVerificacion.esValido(EstadoVerificacion.RECHAZADO));
    }

    @Test
    void esValido_rechazaValoresFueraDeLaLista() {

        assertFalse(EstadoVerificacion.esValido("APROBADO"));
        assertFalse(EstadoVerificacion.esValido(""));
        assertFalse(EstadoVerificacion.esValido(null));
    }

    @Test
    void puedePublicarse_soloVerdaderoParaVerificado() {

        assertTrue(EstadoVerificacion.puedePublicarse(EstadoVerificacion.VERIFICADO));
        assertFalse(EstadoVerificacion.puedePublicarse(EstadoVerificacion.PENDIENTE));
        assertFalse(EstadoVerificacion.puedePublicarse(EstadoVerificacion.EN_REVISION));
        assertFalse(EstadoVerificacion.puedePublicarse(EstadoVerificacion.RECHAZADO));
    }
}