package bo.edu.sos.backend.repository;

import bo.edu.sos.backend.constants.EstadoVerificacion;
import bo.edu.sos.backend.constants.Roles;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.PuntoAyuda;
import bo.edu.sos.backend.entity.Usuario;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/** Consulta real sobre MySQL; los datos de cada prueba se revierten al finalizar. */
@SpringBootTest
@Transactional
class PuntoAyudaRepositoryIntegrationTest {
    @Autowired private PuntoAyudaRepository puntos;
    @Autowired private RolRepository roles;
    @Autowired private EntityManager em;

    private String prefijo;
    private Departamento departamento;
    private Departamento otroDepartamento;
    private Usuario creador;

    @BeforeEach
    void prepararDatos() {
        prefijo = "SOS52-" + UUID.randomUUID();
        departamento = departamento(prefijo + " A");
        otroDepartamento = departamento(prefijo + " B");
        creador = new Usuario();
        creador.setNombre("Ciudadano de prueba SOS52");
        creador.setEmail(prefijo + "@example.com");
        creador.setPassword("valor-sintetico-no-utilizado-en-login");
        creador.setRol(roles.findByNombre(Roles.USER).orElseThrow());
        em.persist(creador);
    }

    @Test
    void filtraPorEstadoTipoDepartamentoYBusquedaSinDuplicarResultados() {
        PuntoAyuda esperado = punto("Ayuda Norte", "Villa Norte", "PUNTO_DONACION", "PENDIENTE", departamento);
        var agua = new bo.edu.sos.backend.entity.Necesidad();
        agua.setNombre(prefijo + " Agua");
        var alimentos = new bo.edu.sos.backend.entity.Necesidad();
        alimentos.setNombre(prefijo + " Alimentos");
        em.persist(agua);
        em.persist(alimentos);
        esperado.getNecesidades().addAll(java.util.Set.of(agua, alimentos));
        punto("Emergencia", "Villa Sur", "EMERGENCIA", "PENDIENTE", departamento);
        punto("Otro departamento", "Villa Norte", "PUNTO_DONACION", "PENDIENTE", otroDepartamento);
        punto("Verificado", "Villa Norte", "PUNTO_DONACION", "VERIFICADO", departamento);
        em.flush();
        em.clear();

        List<PuntoAyuda> resultado = puntos.buscarParaRevision(
                "PENDIENTE", "PUNTO_DONACION", departamento.getId(), "%villa norte%");

        assertEquals(List.of(esperado.getId()), resultado.stream().map(PuntoAyuda::getId).toList());
        assertEquals(2, resultado.get(0).getNecesidades().size());
        var persistencia = em.getEntityManagerFactory().getPersistenceUnitUtil();
        assertTrue(persistencia.isLoaded(resultado.get(0), "departamento"));
        assertTrue(persistencia.isLoaded(resultado.get(0), "necesidades"));
    }

    @Test
    void consultaPendientesConFiltrosOpcionalesYOrdenMasRecientePrimero() {
        PuntoAyuda primero = punto("Primero", "Villa", "PUNTO_DONACION", "PENDIENTE", departamento);
        PuntoAyuda ultimo = punto("Último", "Villa", "EMERGENCIA", "PENDIENTE", departamento);
        punto("Verificado", "Villa", "PUNTO_DONACION", "VERIFICADO", departamento);
        punto("En revisión", "Villa", "PUNTO_DONACION", "EN_REVISION", departamento);
        em.flush();
        em.clear();

        List<PuntoAyuda> resultado = puntos.buscarParaRevision(
                EstadoVerificacion.PENDIENTE, null, null, "%" + prefijo.toLowerCase(Locale.ROOT) + "%");

        assertEquals(List.of(ultimo.getId(), primero.getId()), resultado.stream().map(PuntoAyuda::getId).toList());
    }

    @Test
    void busquedaPorNombreRespetaEscapeDeComodines() {
        PuntoAyuda esperado = punto("%_ exacto", "Villa", "PUNTO_DONACION", "PENDIENTE", departamento);
        punto("XY parecido", "Villa", "PUNTO_DONACION", "PENDIENTE", departamento);
        em.flush();
        em.clear();

        List<PuntoAyuda> resultado = puntos.buscarParaRevision(
                "PENDIENTE", null, departamento.getId(), "%!%!_ exacto%");
        assertEquals(List.of(esperado.getId()), resultado.stream().map(PuntoAyuda::getId).toList());
    }

    @Test
    void devuelveListaVaciaCuandoLosFiltrosNoCoinciden() {
        punto("Donaciones", "Villa", "PUNTO_DONACION", "PENDIENTE", departamento);
        em.flush();
        assertTrue(puntos.buscarParaRevision("PENDIENTE", "EMERGENCIA", departamento.getId(), null).isEmpty());
    }

    private Departamento departamento(String nombre) {
        Departamento departamento = new Departamento();
        departamento.setNombre(nombre);
        em.persist(departamento);
        return departamento;
    }

    private PuntoAyuda punto(String nombre, String ciudad, String tipo, String estado, Departamento ubicacion) {
        PuntoAyuda punto = new PuntoAyuda();
        punto.setNombre(prefijo + " " + nombre);
        punto.setCiudad(ciudad);
        punto.setTipo(tipo);
        punto.setEstadoVerificacion(estado);
        punto.setDepartamento(ubicacion);
        punto.setCreador(creador);
        punto.setLatitud(new BigDecimal("-17.3895"));
        punto.setLongitud(new BigDecimal("-66.1568"));
        return puntos.save(punto);
    }
}
