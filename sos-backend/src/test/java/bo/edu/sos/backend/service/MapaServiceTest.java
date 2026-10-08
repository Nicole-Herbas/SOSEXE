package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.PuntoMapaDTO;
import bo.edu.sos.backend.entity.Centro;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.Necesidad;
import bo.edu.sos.backend.entity.PuntoAyuda;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.repository.CentroRepository;
import bo.edu.sos.backend.repository.PuntoAyudaRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class MapaServiceTest {

    @Mock
    private CentroRepository centroRepository;

    @Mock
    private PuntoAyudaRepository puntoAyudaRepository;


    private MapaService mapaService;


    @BeforeEach
    void setUp() {

        mapaService =
                new MapaService(
                        centroRepository,
                        puntoAyudaRepository
                );
    }


    @Test
    void listarPuntosMapaDebeUnificarCentrosYPuntosDeAyuda() {

        Departamento cochabamba = new Departamento();
        cochabamba.setId(3L);
        cochabamba.setNombre("Cochabamba");

        Necesidad agua = new Necesidad();
        agua.setId(1L);
        agua.setNombre("Agua");

        Centro centro = new Centro();
        centro.setId(1L);
        centro.setNombre("Centro San José");
        centro.setTipo("CENTRO_APOYO");
        centro.setDireccion("Av. Blanco Galindo");
        centro.setCiudad("Cochabamba");
        centro.setDepartamento(cochabamba);
        centro.setLatitud(new BigDecimal("-17.3895000"));
        centro.setLongitud(new BigDecimal("-66.1568000"));
        centro.setEstadoVerificacion("VERIFICADO");
        centro.setNecesidades(Set.of(agua));

        Departamento laPaz = new Departamento();
        laPaz.setId(2L);
        laPaz.setNombre("La Paz");

        Usuario creador = new Usuario();
        creador.setId(10L);

        PuntoAyuda punto = new PuntoAyuda();
        punto.setId(5L);
        punto.setNombre("Punto Donación El Alto");
        punto.setTipo("PUNTO_DONACION");
        punto.setDireccion("Ceja de El Alto");
        punto.setCiudad("El Alto");
        punto.setDepartamento(laPaz);
        punto.setLatitud(new BigDecimal("-16.5100000"));
        punto.setLongitud(new BigDecimal("-68.1600000"));
        punto.setEstadoVerificacion("PENDIENTE");
        punto.setCreador(creador);
        punto.setNecesidades(Set.of(agua));

        when(centroRepository.findAll())
                .thenReturn(List.of(centro));
        when(puntoAyudaRepository.findAll())
                .thenReturn(List.of(punto));


        List<PuntoMapaDTO> resultado =
                mapaService.listarPuntosMapa();


        assertEquals(2, resultado.size());

        PuntoMapaDTO dtoCentro = resultado.stream()
                .filter(p -> "CENTRO".equals(p.getOrigen()))
                .findFirst().orElseThrow();

        assertEquals("Centro San José", dtoCentro.getNombre());
        assertEquals("CENTRO_APOYO", dtoCentro.getTipo());
        assertEquals("Cochabamba", dtoCentro.getDepartamentoNombre());
        assertTrue(dtoCentro.getNecesidades().contains("Agua"));

        PuntoMapaDTO dtoPunto = resultado.stream()
                .filter(p -> "PUNTO_AYUDA".equals(p.getOrigen()))
                .findFirst().orElseThrow();

        assertEquals("Punto Donación El Alto", dtoPunto.getNombre());
        assertEquals("PUNTO_DONACION", dtoPunto.getTipo());
        assertEquals("La Paz", dtoPunto.getDepartamentoNombre());
        assertEquals("PENDIENTE", dtoPunto.getEstadoVerificacion());
    }

    @Test
    void listarPuntosMapaDebeFiltrarPorTipoNecesidadYDepartamento() {

        Departamento santaCruz = new Departamento();
        santaCruz.setId(7L);
        santaCruz.setNombre("Santa Cruz");

        Necesidad agua = new Necesidad();
        agua.setId(1L);
        agua.setNombre("Agua");

        Usuario creador = new Usuario();
        creador.setId(10L);

        PuntoAyuda refugio = new PuntoAyuda();
        refugio.setId(1L);
        refugio.setNombre("Refugio Esperanza");
        refugio.setTipo("REFUGIO");
        refugio.setCiudad("Santa Cruz de la Sierra");
        refugio.setDepartamento(santaCruz);
        refugio.setLatitud(new BigDecimal("-17.7833000"));
        refugio.setLongitud(new BigDecimal("-63.1821000"));
        refugio.setEstadoVerificacion("VERIFICADO");
        refugio.setCreador(creador);
        refugio.setNecesidades(Set.of(agua));

        when(centroRepository.findAll())
                .thenReturn(List.of());

        when(puntoAyudaRepository.findAll())
                .thenReturn(List.of(refugio));

        List<PuntoMapaDTO> resultado =
                mapaService.listarPuntosMapa(
                        "REFUGIO",
                        "Agua",
                        "Santa Cruz",
                        null
                );

        assertEquals(1, resultado.size());
        assertEquals("Refugio Esperanza", resultado.get(0).getNombre());
        assertEquals("REFUGIO", resultado.get(0).getTipo());
        assertTrue(resultado.get(0).getNecesidades().contains("Agua"));
    }
    @Test
    void listarPuntosMapaDebeBuscarIgnorandoTildesYMayusculas() {

        Departamento cochabamba = new Departamento();
        cochabamba.setId(3L);
        cochabamba.setNombre("Cochabamba");

        Centro centro = new Centro();
        centro.setId(1L);
        centro.setNombre("Centro San José");
        centro.setTipo("CENTRO_APOYO");
        centro.setCiudad("Cochabamba");
        centro.setDepartamento(cochabamba);
        centro.setLatitud(new BigDecimal("-17.3895000"));
        centro.setLongitud(new BigDecimal("-66.1568000"));
        centro.setEstadoVerificacion("VERIFICADO");
        centro.setNecesidades(Set.of());

        when(centroRepository.findAll())
                .thenReturn(List.of(centro));

        when(puntoAyudaRepository.findAll())
                .thenReturn(List.of());

        List<PuntoMapaDTO> resultado =
                mapaService.listarPuntosMapa(
                        null,
                        null,
                        null,
                        "JOSE"
                );

        assertEquals(1, resultado.size());
        assertEquals("Centro San José", resultado.get(0).getNombre());
    }
    @Test
    void buscarDetalleDebeRetornarCentroOPuntoSegunOrigen() {

        Departamento cochabamba = new Departamento();
        cochabamba.setId(3L);
        cochabamba.setNombre("Cochabamba");

        Centro centro = new Centro();
        centro.setId(1L);
        centro.setNombre("Centro San José");
        centro.setTipo("CENTRO_APOYO");
        centro.setCiudad("Cochabamba");
        centro.setDepartamento(cochabamba);
        centro.setLatitud(new BigDecimal("-17.3895000"));
        centro.setLongitud(new BigDecimal("-66.1568000"));
        centro.setEstadoVerificacion("VERIFICADO");
        centro.setNecesidades(Set.of());

        Usuario creador = new Usuario();
        creador.setId(10L);

        PuntoAyuda punto = new PuntoAyuda();
        punto.setId(5L);
        punto.setNombre("Refugio Esperanza");
        punto.setTipo("REFUGIO");
        punto.setCiudad("Santa Cruz");
        punto.setDepartamento(cochabamba);
        punto.setLatitud(new BigDecimal("-17.7833000"));
        punto.setLongitud(new BigDecimal("-63.1821000"));
        punto.setEstadoVerificacion("VERIFICADO");
        punto.setCreador(creador);
        punto.setNecesidades(Set.of());

        when(centroRepository.findById(1L))
                .thenReturn(java.util.Optional.of(centro));

        when(puntoAyudaRepository.findById(5L))
                .thenReturn(java.util.Optional.of(punto));

        PuntoMapaDTO detalleCentro =
                mapaService.buscarDetalle("CENTRO", 1L);

        PuntoMapaDTO detallePunto =
                mapaService.buscarDetalle("PUNTO_AYUDA", 5L);

        assertEquals("CENTRO", detalleCentro.getOrigen());
        assertEquals("Centro San José", detalleCentro.getNombre());

        assertEquals("PUNTO_AYUDA", detallePunto.getOrigen());
        assertEquals("Refugio Esperanza", detallePunto.getNombre());
    }
    @Test
    void buscarDetalleDebeRechazarOrigenInvalido() {

        assertThrows(
                bo.edu.sos.backend.exception.BadRequestException.class,
                () -> mapaService.buscarDetalle("CUALQUIER_COSA", 1L)
        );

        verifyNoInteractions(
                centroRepository,
                puntoAyudaRepository
        );
    }
}
