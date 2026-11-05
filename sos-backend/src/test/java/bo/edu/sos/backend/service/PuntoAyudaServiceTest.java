package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.EstadoVerificacion;
import bo.edu.sos.backend.dto.PuntoAyudaDTO;
import bo.edu.sos.backend.dto.RegistrarPuntoAyudaDTO;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.Necesidad;
import bo.edu.sos.backend.entity.PuntoAyuda;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.exception.ConflictException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.NecesidadRepository;
import bo.edu.sos.backend.repository.PuntoAyudaRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.dao.CannotAcquireLockException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


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

    private PuntoAyudaService puntoAyudaService;


    @BeforeEach
    void setUp() {

        puntoAyudaService =
                new PuntoAyudaService(
                        puntoAyudaRepository,
                        departamentoRepository,
                        usuarioRepository,
                        necesidadRepository
                );
    }


    // ==========================================
    // MÁQUINA DE ESTADOS (SOS-65)
    // ==========================================

    @Test
    void cambiarEstado_rechazaEstadoInvalido_sinTocarLaBaseDeDatos() {

        assertThrows(BadRequestException.class,
                () -> puntoAyudaService.cambiarEstado(1L, "INVENTADO", null, "admin@ejemplo.com"));

        verifyNoInteractions(puntoAyudaRepository);
    }

    @Test
    void aprobarPendienteGuardaRevisorFechaYSoloDatosDeRevision() {
        PuntoAyuda punto = puntoParaRevision(EstadoVerificacion.PENDIENTE);
        Usuario creador = punto.getCreador();
        Usuario revisor = new Usuario();
        revisor.setId(99L);
        when(puntoAyudaRepository.bloquearParaRevision(5L)).thenReturn(Optional.of(punto));
        when(usuarioRepository.findByEmail("admin@ejemplo.com")).thenReturn(Optional.of(revisor));
        when(puntoAyudaRepository.save(punto)).thenReturn(punto);

        PuntoAyudaDTO resultado = puntoAyudaService.cambiarEstado(5L, EstadoVerificacion.VERIFICADO,
                "  Información comprobada  ", "admin@ejemplo.com");

        assertEquals(EstadoVerificacion.VERIFICADO, resultado.getEstadoVerificacion());
        assertEquals("Información comprobada", resultado.getMotivoRevision());
        assertEquals(99L, resultado.getRevisorId());
        assertNotNull(resultado.getFechaRevision());
        assertSame(creador, punto.getCreador());
        assertEquals("Av. América", punto.getDireccion());
        verify(puntoAyudaRepository).save(punto);
    }

    @Test
    void rechazarEnRevisionAceptaAusenciaDeMotivo() {
        PuntoAyuda punto = puntoParaRevision(EstadoVerificacion.EN_REVISION);
        when(puntoAyudaRepository.bloquearParaRevision(5L)).thenReturn(Optional.of(punto));
        when(usuarioRepository.findByEmail("admin@ejemplo.com")).thenReturn(Optional.of(new Usuario()));
        when(puntoAyudaRepository.save(punto)).thenReturn(punto);

        PuntoAyudaDTO resultado = puntoAyudaService.cambiarEstado(5L, EstadoVerificacion.RECHAZADO,
                "   ", "admin@ejemplo.com");
        assertEquals(EstadoVerificacion.RECHAZADO, resultado.getEstadoVerificacion());
        assertNull(resultado.getMotivoRevision());
        assertNull(punto.getMotivoRevision());
    }

    @Test
    void rechazaEstadosDeEntradaYMotivosDemasiadoLargosAntesDeBloquear() {
        for (String estado : List.of(EstadoVerificacion.PENDIENTE, EstadoVerificacion.EN_REVISION, "INVENTADO")) {
            assertThrows(BadRequestException.class,
                    () -> puntoAyudaService.cambiarEstado(5L, estado, null, "admin@ejemplo.com"));
        }
        assertThrows(BadRequestException.class, () -> puntoAyudaService.cambiarEstado(5L,
                EstadoVerificacion.RECHAZADO, "x".repeat(501), "admin@ejemplo.com"));
        verifyNoInteractions(puntoAyudaRepository);
    }

    @Test
    void noSobrescribeDecisionesFinalizadasNiRegistrosInexistentes() {
        for (String estado : List.of(EstadoVerificacion.VERIFICADO, EstadoVerificacion.RECHAZADO)) {
            PuntoAyuda punto = puntoParaRevision(estado);
            when(puntoAyudaRepository.bloquearParaRevision(5L)).thenReturn(Optional.of(punto));
            assertThrows(ConflictException.class, () -> puntoAyudaService.cambiarEstado(5L,
                    EstadoVerificacion.RECHAZADO, null, "admin@ejemplo.com"));
        }
        when(puntoAyudaRepository.bloquearParaRevision(5L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> puntoAyudaService.cambiarEstado(5L,
                EstadoVerificacion.VERIFICADO, null, "admin@ejemplo.com"));
        verify(puntoAyudaRepository, never()).save(any());
    }

    @Test
    void sinRevisorAutenticadoNoGuardaDecision() {
        PuntoAyuda punto = puntoParaRevision(EstadoVerificacion.PENDIENTE);
        when(puntoAyudaRepository.bloquearParaRevision(5L)).thenReturn(Optional.of(punto));
        assertThrows(ResponseStatusException.class, () -> puntoAyudaService.cambiarEstado(5L,
                EstadoVerificacion.VERIFICADO, null, "desconocido@ejemplo.com"));
        verify(puntoAyudaRepository, never()).save(any());
    }

    @Test
    void propietarioVeSoloMotivoDeRechazoSinDatosInternosDelRevisor() {
        Usuario creador = new Usuario();
        creador.setId(10L);
        Usuario revisor = new Usuario();
        revisor.setId(99L);
        PuntoAyuda aprobado = puntoParaRevision(EstadoVerificacion.VERIFICADO);
        aprobado.setMotivoRevision("Comentario interno");
        aprobado.setRevisor(revisor);
        PuntoAyuda rechazado = puntoParaRevision(EstadoVerificacion.RECHAZADO);
        rechazado.setMotivoRevision("Datos incorrectos");
        rechazado.setRevisor(revisor);
        when(usuarioRepository.findByEmail("ciudadano@ejemplo.com")).thenReturn(Optional.of(creador));
        when(puntoAyudaRepository.findByCreadorIdOrderByFechaCreacionDesc(10L))
                .thenReturn(List.of(aprobado, rechazado));

        List<PuntoAyudaDTO> propios = puntoAyudaService.listarMisPuntos("ciudadano@ejemplo.com");
        assertNull(propios.get(0).getMotivoRevision());
        assertEquals("Datos incorrectos", propios.get(1).getMotivoRevision());
        assertTrue(propios.stream().allMatch(p -> p.getRevisorId() == null && p.getFechaRevision() == null));
    }

    @Test
    void conflictoDeBloqueoNoDejaCambiosParciales() {
        when(puntoAyudaRepository.bloquearParaRevision(5L))
                .thenThrow(new CannotAcquireLockException("Bloqueado"));
        assertThrows(ConflictException.class, () -> puntoAyudaService.cambiarEstado(5L,
                EstadoVerificacion.VERIFICADO, null, "admin@ejemplo.com"));
        verify(puntoAyudaRepository, never()).save(any());
        verifyNoInteractions(usuarioRepository);
    }

    private PuntoAyuda puntoParaRevision(String estado) {
        PuntoAyuda punto = new PuntoAyuda();
        punto.setId(5L);
        punto.setNombre("Punto solidario");
        punto.setDireccion("Av. América");
        punto.setEstadoVerificacion(estado);
        Usuario creador = new Usuario();
        creador.setId(10L);
        punto.setCreador(creador);
        return punto;
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


    // ==========================================
    // REGISTRO CIUDADANO
    // ==========================================

    @Test
    void registrarComoCiudadanoDebeCrearPuntoPendiente() {

        Usuario creador = new Usuario();
        creador.setId(10L);

        Departamento departamento = new Departamento();
        departamento.setId(3L);
        departamento.setNombre("Cochabamba");

        Necesidad agua = new Necesidad();
        agua.setId(1L);
        agua.setNombre("Agua");


        RegistrarPuntoAyudaDTO solicitud =
                new RegistrarPuntoAyudaDTO();

        solicitud.setNombre("Punto Solidario");
        solicitud.setTipo("PUNTO_DONACION");
        solicitud.setDescripcion("Recepción de donaciones");
        solicitud.setDireccion("Av. América");
        solicitud.setCiudad("Cochabamba");
        solicitud.setDepartamentoId(3L);

        solicitud.setLatitud(
                new BigDecimal("-17.3895000")
        );

        solicitud.setLongitud(
                new BigDecimal("-66.1568000")
        );

        solicitud.setNecesidadIds(List.of(1L));
        solicitud.setNombreContacto("Responsable");
        solicitud.setTelefonoContacto("70700001");
        solicitud.setCorreoContacto("contacto@ejemplo.com");


        when(usuarioRepository.findByEmail("test@ejemplo.com"))
                .thenReturn(Optional.of(creador));

        when(departamentoRepository.findById(3L))
                .thenReturn(Optional.of(departamento));

        when(necesidadRepository.findAllById(any()))
                .thenReturn(List.of(agua));

        when(puntoAyudaRepository.save(any(PuntoAyuda.class)))
                .thenAnswer(invocacion -> {

                    PuntoAyuda punto =
                            invocacion.getArgument(0);

                    punto.setId(5L);

                    return punto;
                });


        PuntoAyudaDTO resultado =
                puntoAyudaService.registrarComoCiudadano(
                        solicitud,
                        "test@ejemplo.com"
                );


        ArgumentCaptor<PuntoAyuda> captor =
                ArgumentCaptor.forClass(PuntoAyuda.class);

        verify(puntoAyudaRepository).save(
                captor.capture()
        );

        PuntoAyuda guardado =
                captor.getValue();


        assertEquals(
                EstadoVerificacion.PENDIENTE,
                guardado.getEstadoVerificacion()
        );

        assertEquals(10L, guardado.getCreador().getId());
        assertEquals(3L, guardado.getDepartamento().getId());

        assertEquals("Punto Solidario", guardado.getNombre());
        assertEquals("70700001", guardado.getTelefonoContacto());

        assertEquals(1, guardado.getNecesidades().size());

        assertEquals(5L, resultado.getId());

        assertEquals(
                EstadoVerificacion.PENDIENTE,
                resultado.getEstadoVerificacion()
        );
    }


    // ==========================================
    // CONSULTAS PÚBLICAS
    // ==========================================

    @Test
    void listarTodosAdminDebeMostrarPendientesPorDefecto() {

        PuntoAyuda pendiente = new PuntoAyuda();

        pendiente.setId(1L);
        pendiente.setNombre("Punto pendiente");

        pendiente.setEstadoVerificacion(
                EstadoVerificacion.PENDIENTE
        );


        pendiente.setTelefonoContacto("70700001");
        pendiente.setCorreoContacto("contacto@ejemplo.com");


        when(puntoAyudaRepository.buscarParaRevision("PENDIENTE", null, null, null))
                .thenReturn(
                        List.of(pendiente)
                );


        List<PuntoAyudaDTO> resultado =
                puntoAyudaService.listarTodosAdmin(null, null, null, null);


        assertEquals(1, resultado.size());

        assertEquals(
                "Punto pendiente",
                resultado.get(0).getNombre()
        );

        assertNull(
                resultado.get(0).getTelefonoContacto()
        );

        assertNull(
                resultado.get(0).getCorreoContacto()
        );

        assertNull(
                resultado.get(0).getCreadorId()
        );
    }


    // ==========================================
    // PUNTOS DEL PROPIETARIO
    // ==========================================

    @Test
    void listarMisPuntosDebeIncluirPendientesDelUsuario() {

        Usuario usuario = new Usuario();
        usuario.setId(10L);

        PuntoAyuda pendiente = new PuntoAyuda();

        pendiente.setId(5L);
        pendiente.setNombre("Mi punto");

        pendiente.setCreador(usuario);

        pendiente.setEstadoVerificacion(
                EstadoVerificacion.PENDIENTE
        );


        when(usuarioRepository.findByEmail("test@ejemplo.com"))
                .thenReturn(Optional.of(usuario));

        when(
                puntoAyudaRepository
                        .findByCreadorIdOrderByFechaCreacionDesc(10L)
        ).thenReturn(
                List.of(pendiente)
        );


        List<PuntoAyudaDTO> resultado =
                puntoAyudaService.listarMisPuntos(
                        "test@ejemplo.com"
                );


        assertEquals(1, resultado.size());

        assertEquals(
                EstadoVerificacion.PENDIENTE,
                resultado.get(0).getEstadoVerificacion()
        );

        assertEquals(
                "Mi punto",
                resultado.get(0).getNombre()
        );
    }
}
