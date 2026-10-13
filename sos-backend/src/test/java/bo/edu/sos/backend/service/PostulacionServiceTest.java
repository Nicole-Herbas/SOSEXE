package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.EstadoPostulacion;
import bo.edu.sos.backend.dto.PostulacionDTO;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.entity.PerfilVoluntario;
import bo.edu.sos.backend.entity.Postulacion;
import bo.edu.sos.backend.entity.Voluntariado;
import bo.edu.sos.backend.exception.ForbiddenException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.PerfilVoluntarioRepository;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.exception.DuplicateResourceException;
import bo.edu.sos.backend.repository.PostulacionRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import bo.edu.sos.backend.repository.VoluntariadoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.BadCredentialsException;

import java.util.Optional;
import java.sql.SQLException;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostulacionServiceTest {

    @Mock
    private PostulacionRepository postulacionRepository;

    @Mock
    private VoluntariadoRepository voluntariadoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PerfilVoluntarioRepository perfilRepository;

    private PostulacionService postulacionService;

    private static final String EMAIL = "lucia@sos.org";
    // 19:00 UTC son las 15:00 locales: una oportunidad que termina a las 16:00 sigue vigente.
    private static final Clock CLOCK = Clock.fixed(
            Instant.parse("2026-10-15T19:00:00Z"), ZoneId.of("America/La_Paz"));

    @BeforeEach
    void configurarServicio() {
        postulacionService = new PostulacionService(postulacionRepository,
                voluntariadoRepository, usuarioRepository, perfilRepository, CLOCK);
    }

    private void prepararPerfil() {
        Usuario usuario = new Usuario();
        usuario.setId(10L);
        usuario.setNombre("Lucía");
        usuario.setEmail(EMAIL);
        PerfilVoluntario perfil = new PerfilVoluntario();
        perfil.setUsuario(usuario);
        perfil.setHabilidades("Organización,Logística");
        perfil.setDisponibilidad("Tarde");
        when(usuarioRepository.findByEmail(EMAIL)).thenReturn(Optional.of(usuario));
        when(perfilRepository.findByUsuarioId(10L)).thenReturn(Optional.of(perfil));
    }

    private Voluntariado prepararOportunidad() {
        prepararPerfil();
        Voluntariado oportunidad = new Voluntariado();
        oportunidad.setId(1L);
        oportunidad.setTitulo("Organizar donaciones");
        oportunidad.setEstado("PUBLICADO");
        oportunidad.setFechaInicio(LocalDateTime.of(2026, 10, 15, 9, 0));
        oportunidad.setFechaFin(LocalDateTime.of(2026, 10, 15, 16, 0));
        when(voluntariadoRepository.findById(1L)).thenReturn(Optional.of(oportunidad));
        return oportunidad;
    }

    private PostulacionDTO solicitud() {
        PostulacionDTO dto = new PostulacionDTO();
        dto.setVoluntariadoId(1L);
        dto.setDisponibilidad("Tarde");
        dto.setComentario("Puedo colaborar");
        return dto;
    }

    private void guardarConId() {
        when(postulacionRepository.saveAndFlush(any())).thenAnswer(invocacion -> {
            Postulacion guardada = invocacion.getArgument(0);
            guardada.setId(50L);
            return guardada;
        });
    }

    @Test
    void crear_lanzaDuplicado_siElUsuarioYaSePostulo() {

        prepararPerfil();
        when(postulacionRepository
                .existsByVoluntariadoIdAndUsuarioId(1L, 10L))
                .thenReturn(true);

        PostulacionDTO dto = solicitud();

        assertThrows(DuplicateResourceException.class,
                () -> postulacionService.crear(dto, "lucia@sos.org"));

        verify(postulacionRepository, never()).save(any());
        verify(postulacionRepository, never()).saveAndFlush(any());
    }

    @Test
    void crear_conservaPendienteDisponibilidadYComentario_usandoSoloLaIdentidadDeSesion() {
        prepararOportunidad();
        guardarConId();
        PostulacionDTO dto = solicitud();
        dto.setUsuarioId(999L);
        dto.setEstado(EstadoPostulacion.APROBADO);

        PostulacionDTO resultado = postulacionService.crear(dto, EMAIL);

        assertAll(
                () -> assertEquals(50L, resultado.getId()),
                () -> assertEquals(10L, resultado.getUsuarioId()),
                () -> assertEquals(1L, resultado.getVoluntariadoId()),
                () -> assertEquals("Lucía", resultado.getUsuarioNombre()),
                () -> assertEquals(EstadoPostulacion.PENDIENTE, resultado.getEstado()),
                () -> assertEquals("Tarde", resultado.getDisponibilidad()),
                () -> assertEquals("Puedo colaborar", resultado.getComentario())
        );
        verify(perfilRepository).findByUsuarioId(10L);
        verify(perfilRepository, never()).findByUsuarioId(999L);
        verify(postulacionRepository).existsByVoluntariadoIdAndUsuarioId(1L, 10L);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "\t\n"})
    void crear_rechazaSesionAusenteSinConsultarRepositorios(String email) {
        assertThrows(BadCredentialsException.class, () -> postulacionService.crear(solicitud(), email));
        verifyNoInteractions(usuarioRepository, perfilRepository, voluntariadoRepository, postulacionRepository);
    }

    @Test
    void crear_rechazaUsuarioQueYaNoExiste() {
        assertThrows(BadCredentialsException.class, () -> postulacionService.crear(solicitud(), EMAIL));
        verifyNoInteractions(perfilRepository, voluntariadoRepository, postulacionRepository);
    }

    @Test
    void crear_rechazaUsuarioInactivo() {
        Usuario usuario = new Usuario();
        usuario.setActivo(false);
        when(usuarioRepository.findByEmail(EMAIL)).thenReturn(Optional.of(usuario));
        assertThrows(BadCredentialsException.class, () -> postulacionService.crear(solicitud(), EMAIL));
        verifyNoInteractions(perfilRepository, voluntariadoRepository, postulacionRepository);
    }

    @Test
    void crear_requierePerfilVoluntarioDelUsuarioAutenticado() {
        Usuario usuario = new Usuario();
        usuario.setId(10L);
        when(usuarioRepository.findByEmail(EMAIL)).thenReturn(Optional.of(usuario));
        assertThrows(ForbiddenException.class, () -> postulacionService.crear(solicitud(), EMAIL));
        verifyNoInteractions(voluntariadoRepository, postulacionRepository);
    }

    @Test
    void crear_rechazaOportunidadInexistente() {
        prepararPerfil();
        assertThrows(ResourceNotFoundException.class, () -> postulacionService.crear(solicitud(), EMAIL));
        verify(postulacionRepository, never()).saveAndFlush(any());
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"BORRADOR", "FINALIZADO", "CERRADO", "CANCELADO", "publicado", "PUBLICADO "})
    void crear_requiereEstadoExactamentePublicado(String estado) {
        prepararOportunidad().setEstado(estado);
        BadRequestException error = assertThrows(BadRequestException.class,
                () -> postulacionService.crear(solicitud(), EMAIL));
        assertEquals("La oportunidad no está publicada", error.getMessage());
        verify(postulacionRepository, never()).saveAndFlush(any());
    }

    @Test
    void crear_rechazaOportunidadFinalizadaEnHoraLocal() {
        prepararOportunidad().setFechaFin(LocalDateTime.of(2026, 10, 15, 14, 59, 59));
        BadRequestException error = assertThrows(BadRequestException.class,
                () -> postulacionService.crear(solicitud(), EMAIL));
        assertEquals("La oportunidad ya finalizó", error.getMessage());
        verify(postulacionRepository, never()).saveAndFlush(any());
    }

    @ParameterizedTest
    @ValueSource(strings = {"2026-10-15T15:00:00", "2026-10-15T16:00:00", "2026-10-16T00:30:00"})
    void crear_aceptaFinIgualOPosteriorAHoraLocalSinCompararContraUtc(String fin) {
        prepararOportunidad().setFechaFin(LocalDateTime.parse(fin));
        guardarConId();
        assertEquals(EstadoPostulacion.PENDIENTE, postulacionService.crear(solicitud(), EMAIL).getEstado());
    }

    @Test
    void crear_noAceptaOportunidadSinFechaFin() {
        prepararOportunidad().setFechaFin(null);
        assertThrows(BadRequestException.class, () -> postulacionService.crear(solicitud(), EMAIL));
        verify(postulacionRepository, never()).saveAndFlush(any());
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "\t\n"})
    void crear_rechazaDisponibilidadVaciaInclusoSinValidacionMvc(String disponibilidad) {
        prepararPerfil();
        PostulacionDTO dto = solicitud();
        dto.setDisponibilidad(disponibilidad);
        assertThrows(BadRequestException.class, () -> postulacionService.crear(dto, EMAIL));
        verifyNoInteractions(voluntariadoRepository, postulacionRepository);
    }

    @Test
    void crear_rechazaDisponibilidadMayorA255Caracteres() {
        prepararPerfil();
        PostulacionDTO dto = solicitud();
        dto.setDisponibilidad("a".repeat(256));
        assertThrows(BadRequestException.class, () -> postulacionService.crear(dto, EMAIL));
        verifyNoInteractions(voluntariadoRepository, postulacionRepository);
    }

    @Test
    void crear_aceptaDisponibilidadDe255Caracteres() {
        prepararOportunidad();
        guardarConId();
        PostulacionDTO dto = solicitud();
        dto.setDisponibilidad("a".repeat(255));
        assertEquals(dto.getDisponibilidad(), postulacionService.crear(dto, EMAIL).getDisponibilidad());
    }

    @ParameterizedTest
    @ValueSource(strings = {"uk_postulacion_usuario_voluntariado", "postulacion.uk_postulacion_usuario_voluntariado"})
    void crear_traduceColisionConcurrenteDeLaRestriccionUnique(String restriccion) {
        prepararOportunidad();
        var causa = new org.hibernate.exception.ConstraintViolationException(
                "Duplicate entry", new SQLException("Duplicate entry", "23000", 1062), restriccion);
        when(postulacionRepository.saveAndFlush(any())).thenThrow(
                new DataIntegrityViolationException("Conflicto", causa));

        assertThrows(DuplicateResourceException.class, () -> postulacionService.crear(solicitud(), EMAIL));
        verify(postulacionRepository).saveAndFlush(any());
    }

    @Test
    void crear_noConfundeOtrasViolacionesDeIntegridadConDuplicados() {
        prepararOportunidad();
        var causa = new org.hibernate.exception.ConstraintViolationException(
                "Foreign key", new SQLException("Foreign key", "23000", 1452), "fk_postulacion_usuario");
        var error = new DataIntegrityViolationException("Conflicto", causa);
        when(postulacionRepository.saveAndFlush(any())).thenThrow(error);
        assertSame(error, assertThrows(DataIntegrityViolationException.class,
                () -> postulacionService.crear(solicitud(), EMAIL)));
    }

    @Test
    void actualizarEstado_rechazaEstadoInvalido_sinTocarLaBaseDeDatos() {

        assertThrows(BadRequestException.class,
                () -> postulacionService.actualizarEstado(
                        1L, "INVENTADO", "admin@sos.org"));

        verifyNoInteractions(postulacionRepository, usuarioRepository);
    }

    @Test
    void esValido_aceptaLosTresEstadosDefinidos() {

        assertTrue(EstadoPostulacion.esValido(EstadoPostulacion.PENDIENTE));
        assertTrue(EstadoPostulacion.esValido(EstadoPostulacion.APROBADO));
        assertTrue(EstadoPostulacion.esValido(EstadoPostulacion.RECHAZADO));
    }

    @Test
    void esValido_rechazaValoresFueraDeLaLista() {

        assertFalse(EstadoPostulacion.esValido("ACEPTADA"));
        assertFalse(EstadoPostulacion.esValido(""));
        assertFalse(EstadoPostulacion.esValido(null));
    }
}
