package bo.edu.sos.backend.dto;

import bo.edu.sos.backend.constants.TiposPuntoAyuda;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;


class RegistrarPuntoAyudaDTOTest {

    private static ValidatorFactory factory;
    private static Validator validator;


    @BeforeAll
    static void inicializar() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }


    @AfterAll
    static void cerrar() {
        factory.close();
    }


    @Test
    void debeAceptarTiposCiudadanos() {

        for (String tipo : List.of(
                TiposPuntoAyuda.PUNTO_DONACION,
                TiposPuntoAyuda.PUNTO_ENTREGA,
                TiposPuntoAyuda.OTRO
        )) {
            RegistrarPuntoAyudaDTO dto = solicitudValida();
            dto.setTipo(tipo);

            assertTrue(
                    validator.validate(dto).isEmpty(),
                    "El tipo debería ser válido: " + tipo
            );
        }
    }


    @Test
    void debeRechazarCentroYRefugio() {

        for (String tipo : List.of("CENTRO_APOYO", "REFUGIO")) {
            RegistrarPuntoAyudaDTO dto = solicitudValida();
            dto.setTipo(tipo);

            assertTrue(tieneError(dto, "tipo"));
        }
    }


    @Test
    void debeRechazarCoordenadasFueraDeRango() {

        RegistrarPuntoAyudaDTO dto = solicitudValida();
        dto.setLatitud(new BigDecimal("95"));
        dto.setLongitud(new BigDecimal("-190"));

        assertTrue(tieneError(dto, "latitud"));
        assertTrue(tieneError(dto, "longitud"));
    }


    @Test
    void debeRechazarNecesidadesVacias() {

        RegistrarPuntoAyudaDTO dto = solicitudValida();
        dto.setNecesidadIds(List.of());

        assertTrue(tieneError(dto, "necesidadIds"));
    }


    @Test
    void debeRechazarTelefonoInvalido() {

        RegistrarPuntoAyudaDTO dto = solicitudValida();
        dto.setTelefonoContacto("ABC123");

        assertTrue(tieneError(dto, "telefonoContacto"));
    }


    private boolean tieneError(RegistrarPuntoAyudaDTO dto, String propiedad) {

        Set<ConstraintViolation<RegistrarPuntoAyudaDTO>> errores =
                validator.validate(dto);

        return errores.stream().anyMatch(
                error -> propiedad.equals(error.getPropertyPath().toString())
        );
    }


    private RegistrarPuntoAyudaDTO solicitudValida() {

        RegistrarPuntoAyudaDTO dto = new RegistrarPuntoAyudaDTO();
        dto.setNombre("Punto solidario");
        dto.setTipo(TiposPuntoAyuda.PUNTO_DONACION);
        dto.setDescripcion("Recepción de donaciones");
        dto.setDireccion("Av. América");
        dto.setCiudad("Cochabamba");
        dto.setDepartamentoId(3L);
        dto.setLatitud(new BigDecimal("-17.3895"));
        dto.setLongitud(new BigDecimal("-66.1568"));
        dto.setNecesidadIds(List.of(1L));
        dto.setNombreContacto("Responsable");
        dto.setTelefonoContacto("70700001");
        dto.setCorreoContacto("contacto@ejemplo.com");
        return dto;
    }
}
