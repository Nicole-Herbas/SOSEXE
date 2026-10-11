package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.PerfilVoluntarioDTO;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.PerfilVoluntario;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.DuplicateResourceException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.PerfilVoluntarioRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class PerfilVoluntarioServiceTest {

    @Mock
    private PerfilVoluntarioRepository perfilRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private DepartamentoRepository departamentoRepository;


    private PerfilVoluntarioService perfilService;


    private Usuario usuarioMock;
    private Departamento departamentoMock;


    @BeforeEach
    void setUp() {

        perfilService =
                new PerfilVoluntarioService(
                        perfilRepository,
                        usuarioRepository,
                        departamentoRepository
                );

        usuarioMock = new Usuario();
        usuarioMock.setId(1L);
        usuarioMock.setNombre("María González");
        usuarioMock.setEmail("maria@test.com");

        departamentoMock = new Departamento();
        departamentoMock.setId(3L);
        departamentoMock.setNombre("Cochabamba");
    }


    // ── Test 1: Crear perfil exitosamente ────────────────────────────────────

    @Test
    void crearPerfil_exitoso_devuelveDTO() {

        // Arrange
        PerfilVoluntarioDTO dto = crearDTOValido();

        when(usuarioRepository.findByEmail("maria@test.com"))
                .thenReturn(Optional.of(usuarioMock));

        when(perfilRepository.existsByUsuarioId(1L))
                .thenReturn(false);

        when(departamentoRepository.findById(3L))
                .thenReturn(Optional.of(departamentoMock));

        when(perfilRepository.save(any(PerfilVoluntario.class)))
                .thenAnswer(invocation -> {
                    PerfilVoluntario perfil =
                            invocation.getArgument(0);
                    perfil.setId(10L);
                    return perfil;
                });


        // Act
        PerfilVoluntarioDTO resultado =
                perfilService.crear(
                        "maria@test.com",
                        dto
                );


        // Assert
        assertNotNull(resultado);
        assertEquals(10L, resultado.getId());
        assertEquals("+591 71234567", resultado.getTelefono());
        assertEquals("maria@test.com", resultado.getEmailContacto());
        assertEquals("Cochabamba", resultado.getCiudad());
        assertEquals("Cochabamba", resultado.getDepartamentoNombre());
        assertEquals(
                List.of("Primeros auxilios", "Logística"),
                resultado.getHabilidades()
        );
        assertEquals(
                List.of("Días de semana", "Mañana"),
                resultado.getDisponibilidad()
        );

        verify(perfilRepository).save(
                any(PerfilVoluntario.class)
        );
    }


    // ── Test 2: Crear perfil cuando ya existe → excepción ────────────────────

    @Test
    void crearPerfil_yaExiste_lanzaDuplicateResourceException() {

        // Arrange
        PerfilVoluntarioDTO dto = crearDTOValido();

        when(usuarioRepository.findByEmail("maria@test.com"))
                .thenReturn(Optional.of(usuarioMock));

        when(perfilRepository.existsByUsuarioId(1L))
                .thenReturn(true);


        // Act & Assert
        assertThrows(
                DuplicateResourceException.class,
                () -> perfilService.crear(
                        "maria@test.com",
                        dto
                )
        );

        verify(perfilRepository, never()).save(
                any(PerfilVoluntario.class)
        );
    }


    // ── Test 3: Obtener perfil que no existe → excepción ─────────────────────

    @Test
    void obtenerPerfil_noExiste_lanzaResourceNotFoundException() {

        // Arrange
        when(usuarioRepository.findByEmail("maria@test.com"))
                .thenReturn(Optional.of(usuarioMock));

        when(perfilRepository.findByUsuarioId(1L))
                .thenReturn(Optional.empty());


        // Act & Assert
        assertThrows(
                ResourceNotFoundException.class,
                () -> perfilService.obtenerPorUsuario(
                        "maria@test.com"
                )
        );
    }


    // ── Test 4: Actualizar perfil exitosamente ───────────────────────────────

    @Test
    void actualizarPerfil_exitoso_devuelveDTOActualizado() {

        // Arrange
        PerfilVoluntario perfilExistente = new PerfilVoluntario();
        perfilExistente.setId(10L);
        perfilExistente.setUsuario(usuarioMock);
        perfilExistente.setDepartamento(departamentoMock);
        perfilExistente.setTelefono("+591 71234567");
        perfilExistente.setEmailContacto("maria@test.com");
        perfilExistente.setCiudad("Cochabamba");
        perfilExistente.setHabilidades("Primeros auxilios");
        perfilExistente.setDisponibilidad("Mañana");

        PerfilVoluntarioDTO dtoActualizado = new PerfilVoluntarioDTO();
        dtoActualizado.setTelefono("+591 79999999");
        dtoActualizado.setEmailContacto("maria.nuevo@test.com");
        dtoActualizado.setDepartamentoId(3L);
        dtoActualizado.setCiudad("Quillacollo");
        dtoActualizado.setHabilidades(
                List.of("Logística", "Transporte")
        );
        dtoActualizado.setDisponibilidad(
                List.of("Fines de semana", "Tarde")
        );


        when(usuarioRepository.findByEmail("maria@test.com"))
                .thenReturn(Optional.of(usuarioMock));

        when(perfilRepository.findByUsuarioId(1L))
                .thenReturn(Optional.of(perfilExistente));

        when(departamentoRepository.findById(3L))
                .thenReturn(Optional.of(departamentoMock));

        when(perfilRepository.save(any(PerfilVoluntario.class)))
                .thenAnswer(invocation ->
                        invocation.getArgument(0)
                );


        // Act
        PerfilVoluntarioDTO resultado =
                perfilService.actualizar(
                        "maria@test.com",
                        dtoActualizado
                );


        // Assert
        assertNotNull(resultado);
        assertEquals("+591 79999999", resultado.getTelefono());
        assertEquals("maria.nuevo@test.com", resultado.getEmailContacto());
        assertEquals("Quillacollo", resultado.getCiudad());
        assertEquals(
                List.of("Logística", "Transporte"),
                resultado.getHabilidades()
        );
        assertEquals(
                List.of("Fines de semana", "Tarde"),
                resultado.getDisponibilidad()
        );

        verify(perfilRepository).save(
                any(PerfilVoluntario.class)
        );
    }


    // ── Helper ───────────────────────────────────────────────────────────────

    private PerfilVoluntarioDTO crearDTOValido() {

        PerfilVoluntarioDTO dto = new PerfilVoluntarioDTO();

        dto.setTelefono("+591 71234567");
        dto.setEmailContacto("maria@test.com");
        dto.setDepartamentoId(3L);
        dto.setCiudad("Cochabamba");
        dto.setHabilidades(
                List.of("Primeros auxilios", "Logística")
        );
        dto.setDisponibilidad(
                List.of("Días de semana", "Mañana")
        );

        return dto;
    }
}
