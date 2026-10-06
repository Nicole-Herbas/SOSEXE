package bo.edu.sos.backend.helper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Helper centralizado para el manejo de logs del backend.
 *
 * Utiliza SLF4J y permite registrar mensajes en los niveles:
 * DEBUG, INFO, WARN y ERROR.
 *
 * No se deben registrar datos sensibles como contraseñas,
 * tokens JWT, API keys o documentos privados.
 */
public final class LogHelper {

    private LogHelper() {
        // Evita que la clase utilitaria sea instanciada.
    }


    private static Logger getLogger(Class<?> source) {
        return LoggerFactory.getLogger(source);
    }


    public static void debug(
            Class<?> source,
            String message,
            Object... args) {

        getLogger(source)
                .debug(message, args);
    }


    public static void info(
            Class<?> source,
            String message,
            Object... args) {

        getLogger(source)
                .info(message, args);
    }


    public static void warn(
            Class<?> source,
            String message,
            Object... args) {

        getLogger(source)
                .warn(message, args);
    }


    public static void error(
            Class<?> source,
            String message,
            Object... args) {

        getLogger(source)
                .error(message, args);
    }


    public static void error(
            Class<?> source,
            String message,
            Throwable throwable) {

        getLogger(source)
                .error(message, throwable);
    }
}