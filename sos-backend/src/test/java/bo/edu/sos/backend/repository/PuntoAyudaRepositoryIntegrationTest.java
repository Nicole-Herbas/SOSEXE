package bo.edu.sos.backend.repository;

import bo.edu.sos.backend.constants.EstadoVerificacion;
import bo.edu.sos.backend.constants.MapaConstants;
import bo.edu.sos.backend.constants.Roles;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.PuntoAyuda;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.service.MapaService;
import bo.edu.sos.backend.service.PuntoAyudaService;
import bo.edu.sos.backend.exception.ConflictException;
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
    @Autowired private PuntoAyudaService revision;
    @Autowired private MapaService mapa;

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

    @Test
    void aprobacionPersisteYPublicaEnMapaSinContactoNiMotivo() {
        PuntoAyuda pendiente = punto("Para aprobar", "Villa", "PUNTO_DONACION", EstadoVerificacion.PENDIENTE, departamento);
        pendiente.setTelefonoContacto("70700001");
        pendiente.setNombreContacto("Contacto privado");
        Usuario administrador = revisor();
        em.flush();
        em.clear();

        revision.cambiarEstado(pendiente.getId(), EstadoVerificacion.VERIFICADO, "Comprobado", administrador.getEmail());
        em.flush();
        em.clear();

        assertEquals(EstadoVerificacion.VERIFICADO, puntos.findById(pendiente.getId()).orElseThrow().getEstadoVerificacion());
        assertEquals("Comprobado", puntos.findById(pendiente.getId()).orElseThrow().getMotivoRevision());
        assertTrue(revision.listarTodosAdmin(EstadoVerificacion.PENDIENTE, null, null, null).stream()
                .noneMatch(p -> p.getId().equals(pendiente.getId())));
        var publico = revision.listarPublicos().stream()
                .filter(p -> p.getId().equals(pendiente.getId())).findFirst().orElseThrow();
        assertNull(publico.getTelefonoContacto());
        assertNull(publico.getMotivoRevision());
        assertNull(publico.getRevisorId());
        assertTrue(mapa.listarPuntosMapa().stream().anyMatch(p -> p.getId().equals(pendiente.getId())
                && MapaConstants.ORIGEN_PUNTO_AYUDA.equals(p.getOrigen())));
        assertThrows(ConflictException.class, () -> revision.cambiarEstado(pendiente.getId(),
                EstadoVerificacion.RECHAZADO, null, administrador.getEmail()));
    }

    @Test
    void rechazoSinMotivoPersistePrivadoYNuncaApareceEnMapa() {
        PuntoAyuda pendiente = punto("Para rechazar", "Villa", "EMERGENCIA", EstadoVerificacion.EN_REVISION, departamento);
        Usuario administrador = revisor();
        em.flush();
        em.clear();

        revision.cambiarEstado(pendiente.getId(), EstadoVerificacion.RECHAZADO, null, administrador.getEmail());
        em.flush();
        em.clear();

        var persistido = puntos.findById(pendiente.getId()).orElseThrow();
        assertNull(persistido.getMotivoRevision());
        assertNotNull(persistido.getFechaRevision());
        assertEquals(administrador.getId(), persistido.getRevisor().getId());
        assertEquals(creador.getId(), persistido.getCreador().getId());
        assertTrue(revision.listarMisPuntos(creador.getEmail()).stream().anyMatch(p ->
                p.getId().equals(pendiente.getId()) && EstadoVerificacion.RECHAZADO.equals(p.getEstadoVerificacion())));
        assertTrue(revision.listarPublicos().stream().noneMatch(p -> p.getId().equals(pendiente.getId())));
        assertTrue(mapa.listarPuntosMapa().stream().noneMatch(p ->
                p.getId().equals(pendiente.getId()) && MapaConstants.ORIGEN_PUNTO_AYUDA.equals(p.getOrigen())));
    }

    private Usuario revisor() {
        Usuario administrador = new Usuario();
        administrador.setNombre("Admin SOS53");
        administrador.setEmail(prefijo + "-admin@example.com");
        administrador.setPassword("valor-sintetico-no-utilizado-en-login");
        administrador.setRol(roles.findByNombre(Roles.ADMIN).orElseThrow());
        em.persist(administrador);
        return administrador;
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
