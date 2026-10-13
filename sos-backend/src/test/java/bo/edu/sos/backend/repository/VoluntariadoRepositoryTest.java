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

class VoluntariadoRepositoryTest {

    @Test
    void listarPorEstadoPrecargaCentroDepartamentoYNecesidadesEnLaConsulta() throws Exception {
        // Hibernate y el repositorio son reales; JDBC es simulado y no abre conexiones externas.
        ConnectionProvider provider = mock(ConnectionProvider.class);
        Connection connection = mock(Connection.class);
        PreparedStatement statement = mock(PreparedStatement.class);
        ResultSet resultSet = mock(ResultSet.class);
        when(provider.getConnection()).thenReturn(connection);
        when(connection.prepareStatement(anyString())).thenReturn(statement);
        when(connection.prepareStatement(anyString(), anyInt(), anyInt())).thenReturn(statement);
        when(statement.executeQuery()).thenReturn(resultSet);
        when(resultSet.next()).thenReturn(false);

        var registry = new StandardServiceRegistryBuilder()
                .applySetting("hibernate.dialect", MySQLDialect.class.getName())
                .applySetting("hibernate.boot.allow_jdbc_metadata_access", false)
                .applySetting("hibernate.hbm2ddl.auto", "none")
                .addService(ConnectionProvider.class, provider)
                .build();
        try (var factory = new MetadataSources(registry)
                .addAnnotatedClass(Voluntariado.class)
                .addAnnotatedClass(Centro.class)
                .addAnnotatedClass(Departamento.class)
                .addAnnotatedClass(Necesidad.class)
                .addAnnotatedClass(Usuario.class)
                .addAnnotatedClass(Rol.class)
                .buildMetadata().buildSessionFactory();
             var entityManager = factory.createEntityManager()) {
            VoluntariadoRepository repository = new JpaRepositoryFactory(entityManager)
                    .getRepository(VoluntariadoRepository.class);

            assertTrue(repository.findByEstado("PUBLICADO").isEmpty());

            var consultas = mockingDetails(connection).getInvocations().stream()
                    .filter(invocation -> invocation.getMethod().getName().equals("prepareStatement"))
                    .map(invocation -> invocation.<String>getArgument(0))
                    .toList();
            assertEquals(1, consultas.size());
            String sql = consultas.get(0).toLowerCase(Locale.ROOT);
            assertAll(
                    () -> assertTrue(sql.contains("join centro "), sql),
                    () -> assertTrue(sql.contains("join departamento "), sql),
                    () -> assertTrue(sql.contains("left join centro_necesidad "), sql),
                    () -> assertTrue(sql.contains("join necesidad "), sql),
                    () -> assertTrue(sql.contains(".estado=?"), sql)
            );
            verify(statement).setString(1, "PUBLICADO");
            verify(statement, times(1)).executeQuery();
        } finally {
            StandardServiceRegistryBuilder.destroy(registry);
        }
    }
}
