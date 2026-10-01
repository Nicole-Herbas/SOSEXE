package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.CentroDTO;
import bo.edu.sos.backend.entity.Centro;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.Necesidad;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.repository.CentroRepository;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class CentroServiceTest {

    @Mock
    private CentroRepository centroRepository;

    @Mock
    private DepartamentoRepository departamentoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;


    private CentroService centroService;


    @BeforeEach
    void setUp() {

        centroService =
                new CentroService(
                        centroRepository,
                        departamentoRepository,
                        usuarioRepository
                );
    }


    @Test
    void listarTodosDebeIncluirNecesidadNombresYDepartamento() {

        Departamento departamento = new Departamento();
        departamento.setId(3L);
        departamento.setNombre("Cochabamba");

        Necesidad agua = new Necesidad();
        agua.setId(1L);
        agua.setNombre("Agua");

        Necesidad alimentos = new Necesidad();
        alimentos.setId(2L);
        alimentos.setNombre("Alimentos");

        Centro centro = new Centro();
        centro.setId(1L);
        centro.setNombre("Centro San José");
        centro.setTipo("CENTRO_APOYO");
        centro.setDescripcion("Centro comunitario");
        centro.setDireccion("Av. Blanco Galindo");
        centro.setCiudad("Cochabamba");
        centro.setDepartamento(departamento);
        centro.setLatitud(new BigDecimal("-17.3895000"));
        centro.setLongitud(new BigDecimal("-66.1568000"));
        centro.setEstadoVerificacion("VERIFICADO");
        centro.setNecesidades(Set.of(agua, alimentos));

        when(centroRepository.findAll())
                .thenReturn(List.of(centro));


        List<CentroDTO> resultado =
                centroService.listarTodos();


        assertEquals(1, resultado.size());

        CentroDTO dto = resultado.get(0);

        assertEquals("Centro San José", dto.getNombre());
        assertEquals("Cochabamba", dto.getDepartamentoNombre());
        assertEquals(3L, dto.getDepartamentoId());

        assertNotNull(dto.getNecesidadNombres());
        assertEquals(2, dto.getNecesidadNombres().size());
        assertTrue(dto.getNecesidadNombres().contains("Agua"));
        assertTrue(dto.getNecesidadNombres().contains("Alimentos"));

        assertNotNull(dto.getNecesidadIds());
        assertEquals(2, dto.getNecesidadIds().size());
        assertTrue(dto.getNecesidadIds().contains(1L));
        assertTrue(dto.getNecesidadIds().contains(2L));
    }

    @Test
    void guardarDebeForzarEstadoPendiente() {

        Departamento departamento = new Departamento();
        departamento.setId(3L);
        when(departamentoRepository.findById(3L))
                .thenReturn(Optional.of(departamento));
        when(centroRepository.save(any(Centro.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CentroDTO dto = new CentroDTO();
        dto.setNombre("Centro nuevo");
        dto.setTipo("ALBERGUE");
        dto.setDireccion("Calle Central");
        dto.setCiudad("Cochabamba");
        dto.setDepartamentoId(3L);
        dto.setTelefono("71234567");
        dto.setLatitud(new BigDecimal("-17.39"));
        dto.setLongitud(new BigDecimal("-66.15"));
        dto.setEstadoVerificacion("APROBADO");

        centroService.guardar(dto);

        verify(centroRepository).save(argThat(centro ->
                "PENDIENTE".equals(centro.getEstadoVerificacion())));
    }

    @Test
    void actualizarEstadoDebePersistirEstadosPermitidos() {

        Centro centro = new Centro();
        when(centroRepository.findById(1L))
                .thenReturn(Optional.of(centro));
        when(centroRepository.save(any(Centro.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        for (String estado : List.of("EN_REVISION", "APROBADO", "RECHAZADO")) {
            CentroDTO resultado = centroService.actualizarEstado(1L, estado);

            assertEquals(estado, resultado.getEstadoVerificacion());
        }

        verify(centroRepository, times(3)).save(any(Centro.class));
    }

    @Test
    void actualizarEstadoDebeRechazarEstadosNoPermitidos() {

        assertThrows(BadRequestException.class,
                () -> centroService.actualizarEstado(1L, "VERIFICADO"));

        verifyNoInteractions(centroRepository);
    }
}
