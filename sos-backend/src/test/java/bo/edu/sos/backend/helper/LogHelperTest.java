package bo.edu.sos.backend.helper;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.slf4j.LoggerFactory;

import static org.junit.jupiter.api.Assertions.*;


class LogHelperTest {

    private Logger logger;

    private ListAppender<ILoggingEvent> appender;

    private Level nivelAnterior;


    @BeforeEach
    void setUp() {

        logger =
                (Logger) LoggerFactory.getLogger(
                        LogHelperTest.class
                );


        nivelAnterior =
                logger.getLevel();


        logger.setLevel(
                Level.DEBUG
        );


        appender =
                new ListAppender<>();


        appender.start();


        logger.addAppender(
                appender
        );
    }


    @AfterEach
    void tearDown() {

        logger.detachAppender(
                appender
        );


        logger.setLevel(
                nivelAnterior
        );
    }


    @Test
    void debeRegistrarLosCuatroNivelesDeLog() {

        LogHelper.debug(
                LogHelperTest.class,
                "Mensaje debug"
        );

        LogHelper.info(
                LogHelperTest.class,
                "Mensaje info"
        );

        LogHelper.warn(
                LogHelperTest.class,
                "Mensaje warn"
        );

        LogHelper.error(
                LogHelperTest.class,
                "Mensaje error"
        );


        assertEquals(
                4,
                appender.list.size()
        );


        assertEquals(
                Level.DEBUG,
                appender.list.get(0).getLevel()
        );

        assertEquals(
                Level.INFO,
                appender.list.get(1).getLevel()
        );

        assertEquals(
                Level.WARN,
                appender.list.get(2).getLevel()
        );

        assertEquals(
                Level.ERROR,
                appender.list.get(3).getLevel()
        );
    }


    @Test
    void debeRegistrarMensajeConParametros() {

        LogHelper.info(
                LogHelperTest.class,
                "Centro registrado. id={}",
                15L
        );


        assertEquals(
                1,
                appender.list.size()
        );


        assertEquals(
                "Centro registrado. id=15",
                appender.list
                        .get(0)
                        .getFormattedMessage()
        );
    }


    @Test
    void debeRegistrarExcepcionEnNivelError() {

        RuntimeException exception =
                new RuntimeException(
                        "Error de prueba"
                );


        LogHelper.error(
                LogHelperTest.class,
                "Ocurrió un error inesperado",
                exception
        );


        assertEquals(
                1,
                appender.list.size()
        );


        ILoggingEvent evento =
                appender.list.get(0);


        assertEquals(
                Level.ERROR,
                evento.getLevel()
        );


        assertEquals(
                "Ocurrió un error inesperado",
                evento.getFormattedMessage()
        );


        assertNotNull(
                evento.getThrowableProxy()
        );


        assertEquals(
                RuntimeException.class.getName(),
                evento
                        .getThrowableProxy()
                        .getClassName()
        );
    }
}