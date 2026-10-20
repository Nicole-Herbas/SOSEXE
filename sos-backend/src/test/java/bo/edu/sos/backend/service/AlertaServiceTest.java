package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.EstadoAlerta;
import bo.edu.sos.backend.entity.Alerta;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.repository.AlertaRepository;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AlertaServiceTest {

    @Mock
    private AlertaRepository alertaRepository;

    @Mock
    private DepartamentoRepository departamentoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private AlertaService alertaService;

    // ── Cambio de estado ──────────────────────────────────────────

    @Test
    void cambiarEstado_rechazaEstadoInvalido_sinTocarLaBaseDeDatos() {

        assertThrows(BadRequestException.class,
                () -> alertaService.cambiarEstado(1L, "INVENTADO"));

        verifyNoInteractions(alertaRepository);
    }

    @Test
    void cambiarEstado_persisteTransicionValida() {

        Alerta alerta = new Alerta();
        alerta.setId(1L);
        alerta.setEstado(EstadoAlerta.BORRADOR);

        when(alertaRepository.findById(1L))
                .thenReturn(Optional.of(alerta));
        when(alertaRepository.save(alerta))
                .thenReturn(alerta);

        alertaService.cambiarEstado(1L, EstadoAlerta.ACTIVA);

        verify(alertaRepository).save(alerta);
    }

    @Test
    void cambiarEstado_rechazaTransicionProhibida() {

        Alerta alerta = new Alerta();
        alerta.setId(1L);
        alerta.setEstado(EstadoAlerta.EXPIRADA);

        when(alertaRepository.findById(1L))
                .thenReturn(Optional.of(alerta));

        assertThrows(BadRequestException.class,
                () -> alertaService.cambiarEstado(1L, EstadoAlerta.ACTIVA));

        verify(alertaRepository, never()).save(any());
    }

    // ── Validaciones de estado ────────────────────────────────────

    @Test
    void esValido_aceptaLosCuatroEstadosDefinidos() {
        assertTrue(EstadoAlerta.esValido(EstadoAlerta.BORRADOR));
        assertTrue(EstadoAlerta.esValido(EstadoAlerta.ACTIVA));
        assertTrue(EstadoAlerta.esValido(EstadoAlerta.EXPIRADA));
        assertTrue(EstadoAlerta.esValido(EstadoAlerta.CANCELADA));
    }

    @Test
    void esValido_rechazaValoresFueraDeLaLista() {
        assertFalse(EstadoAlerta.esValido("PUBLICADA"));
        assertFalse(EstadoAlerta.esValido(""));
        assertFalse(EstadoAlerta.esValido(null));
    }

    // ── Transiciones permitidas / prohibidas ──────────────────────

    @Test
    void transicionPermitida_borradorAActiva() {
        assertTrue(EstadoAlerta.transicionPermitida(
                EstadoAlerta.BORRADOR, EstadoAlerta.ACTIVA));
    }

    @Test
    void transicionPermitida_activaAExpirada() {
        assertTrue(EstadoAlerta.transicionPermitida(
                EstadoAlerta.ACTIVA, EstadoAlerta.EXPIRADA));
    }

    @Test
    void transicionNoPermitida_expiradaAActiva() {
        assertFalse(EstadoAlerta.transicionPermitida(
                EstadoAlerta.EXPIRADA, EstadoAlerta.ACTIVA));
    }

    @Test
    void transicionNoPermitida_canceladaAActiva() {
        assertFalse(EstadoAlerta.transicionPermitida(
                EstadoAlerta.CANCELADA, EstadoAlerta.ACTIVA));
    }

    @Test
    void esVisible_soloActiva() {
        assertTrue(EstadoAlerta.esVisible(EstadoAlerta.ACTIVA));
        assertFalse(EstadoAlerta.esVisible(EstadoAlerta.BORRADOR));
        assertFalse(EstadoAlerta.esVisible(EstadoAlerta.EXPIRADA));
    }
}