package bo.edu.sos.backend.repository;

import bo.edu.sos.backend.entity.*;
import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.dialect.MySQLDialect;
import org.hibernate.engine.jdbc.connections.spi.ConnectionProvider;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Locale;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PuntoAyudaRepositoryTest {
    @Test
    void consultaFiltradaPrecargaRelacionesEnUnaSolaConsultaMySql() throws Exception {
        ConnectionProvider provider = mock(ConnectionProvider.class);
        Connection connection = mock(Connection.class);
        PreparedStatement statement = mock(PreparedStatement.class);
        ResultSet filas = mock(ResultSet.class);
        when(provider.getConnection()).thenReturn(connection);
        when(connection.prepareStatement(anyString())).thenReturn(statement);
        when(connection.prepareStatement(anyString(), anyInt(), anyInt())).thenReturn(statement);
        when(statement.executeQuery()).thenReturn(filas);
        when(filas.next()).thenReturn(false);

        var registry = new StandardServiceRegistryBuilder()
                .applySetting("hibernate.dialect", MySQLDialect.class.getName())
                .applySetting("hibernate.boot.allow_jdbc_metadata_access", false)
                .applySetting("hibernate.hbm2ddl.auto", "none")
                .addService(ConnectionProvider.class, provider).build();
        try (var factory = new MetadataSources(registry)
                .addAnnotatedClass(PuntoAyuda.class).addAnnotatedClass(Departamento.class)
                .addAnnotatedClass(Necesidad.class).addAnnotatedClass(Usuario.class)
                .addAnnotatedClass(Rol.class).buildMetadata().buildSessionFactory();
             var em = factory.createEntityManager()) {
            var repository = new JpaRepositoryFactory(em).getRepository(PuntoAyudaRepository.class);
            assertTrue(repository.buscarParaRevision("PENDIENTE", "PUNTO_DONACION", 3L, "%villa%").isEmpty());

            var consultas = mockingDetails(connection).getInvocations().stream()
                    .filter(invocacion -> invocacion.getMethod().getName().equals("prepareStatement"))
                    .map(invocacion -> invocacion.<String>getArgument(0)).toList();
            assertEquals(1, consultas.size());
            String sql = consultas.get(0).toLowerCase(Locale.ROOT);
            assertAll(
                    () -> assertTrue(sql.contains("join departamento "), sql),
                    () -> assertTrue(sql.contains("join punto_necesidad "), sql),
                    () -> assertTrue(sql.contains("join necesidad "), sql),
                    () -> assertTrue(sql.contains(".estado_verificacion=?"), sql),
                    () -> assertTrue(sql.contains(".tipo=?"), sql),
                    () -> assertTrue(sql.contains(".departamento_id=?"), sql),
                    () -> assertTrue(sql.contains("escape '!'"), sql),
                    () -> assertTrue(sql.contains("order by"), sql));
            verify(statement).setString(1, "PENDIENTE");
        } finally {
            StandardServiceRegistryBuilder.destroy(registry);
        }
    }
}
