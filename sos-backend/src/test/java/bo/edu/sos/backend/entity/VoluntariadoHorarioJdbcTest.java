package bo.edu.sos.backend.entity;

import com.mysql.cj.conf.DefaultPropertySet;
import com.mysql.cj.protocol.InternalTimestamp;
import com.mysql.cj.result.LocalDateTimeValueFactory;
import com.mysql.cj.result.SqlTimestampValueFactory;
import org.hibernate.boot.Metadata;
import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.registry.StandardServiceRegistry;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.dialect.MySQLDialect;
import org.hibernate.type.BasicType;
import org.hibernate.type.descriptor.WrapperOptions;
import org.hibernate.type.descriptor.java.LocalDateTimeJavaType;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Types;
import java.time.LocalDateTime;
import java.util.TimeZone;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class VoluntariadoHorarioJdbcTest {

    private static StandardServiceRegistry registry;
    private static Metadata metadata;

    @BeforeAll
    static void configurarMapeoSinConexionABaseDeDatos() {
        registry = new StandardServiceRegistryBuilder()
                .applySetting("hibernate.dialect", MySQLDialect.class.getName())
                .applySetting("hibernate.boot.allow_jdbc_metadata_access", false)
                .applySetting("hibernate.type.java_time_use_direct_jdbc", false)
                .build();

        metadata = new MetadataSources(registry)
                .addAnnotatedClass(Voluntariado.class)
                .addAnnotatedClass(Centro.class)
                .addAnnotatedClass(Departamento.class)
                .addAnnotatedClass(Necesidad.class)
                .addAnnotatedClass(Usuario.class)
                .addAnnotatedClass(Rol.class)
                .buildMetadata();
    }

    @AfterAll
    static void cerrarRegistry() {
        StandardServiceRegistryBuilder.destroy(registry);
    }

    @ParameterizedTest
    @CsvSource({
            "fechaInicio, 2026-10-15T09:00:00",
            "fechaFin, 2026-10-15T16:00:00",
            "fechaInicio, 2026-10-15T00:30:00"
    })
    void leerDatetimeConConexionUtcConservaHoraLocal(String atributo, String fecha) throws Exception {
        LocalDateTime esperado = LocalDateTime.parse(fecha);
        var mysqlDatetime = new InternalTimestamp(
                esperado.getYear(), esperado.getMonthValue(), esperado.getDayOfMonth(),
                esperado.getHour(), esperado.getMinute(), esperado.getSecond(), esperado.getNano(), 0
        );
        var properties = new DefaultPropertySet();
        ResultSet resultSet = mock(ResultSet.class);

        // Reproduce las dos rutas del driver con serverTimezone=UTC y preserveInstants=true.
        when(resultSet.getTimestamp(1)).thenReturn(new SqlTimestampValueFactory(
                properties, null, TimeZone.getDefault(), TimeZone.getTimeZone("UTC")
        ).createFromDatetime(mysqlDatetime));
        when(resultSet.getObject(1, LocalDateTime.class)).thenReturn(
                new LocalDateTimeValueFactory(properties).createFromDatetime(mysqlDatetime)
        );

        var jdbcType = tipoMapeado(atributo).getJdbcType();
        LocalDateTime obtenido = jdbcType.getExtractor(LocalDateTimeJavaType.INSTANCE)
                .extract(resultSet, 1, mock(WrapperOptions.class));

        assertEquals(esperado, obtenido);
        verify(resultSet).getObject(1, LocalDateTime.class);
        verify(resultSet, never()).getTimestamp(anyInt());
    }

    @ParameterizedTest
    @CsvSource({
            "fechaInicio, 2026-10-15T09:00:00",
            "fechaFin, 2026-10-15T16:00:00"
    })
    void escribirDatetimeEntregaHoraLocalSinConvertirATimestamp(String atributo, String fecha) throws Exception {
        LocalDateTime horario = LocalDateTime.parse(fecha);
        PreparedStatement statement = mock(PreparedStatement.class);

        tipoMapeado(atributo).getJdbcType().getBinder(LocalDateTimeJavaType.INSTANCE)
                .bind(statement, horario, 1, mock(WrapperOptions.class));

        verify(statement).setObject(1, horario, Types.TIMESTAMP);
        verify(statement, never()).setTimestamp(anyInt(), any());
    }

    private BasicType<?> tipoMapeado(String atributo) {
        return (BasicType<?>) metadata.getEntityBinding(Voluntariado.class.getName())
                .getProperty(atributo).getType();
    }
}
