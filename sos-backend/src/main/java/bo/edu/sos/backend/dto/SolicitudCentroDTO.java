package bo.edu.sos.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class SolicitudCentroDTO {

    private Long id;

    @NotBlank
    @Size(max = 150)
    private String nombreCentro;

    @NotBlank
    @Size(max = 100)
    private String tipoOrganizacion;

    @NotNull
    private Long departamentoId;

    @NotBlank
    @Size(max = 50)
    private String nit;

    @NotBlank
    @Size(max = 500)
    private String personeriaJuridica;

    private LocalDate fechaFundacion;

    @Size(max = 500)
    private String paginaWeb;

    @NotBlank
    @Size(max = 1000)
    private String descripcion;

    @Size(max = 500)
    private String poblacionAtendida;

    @NotBlank
    @Size(max = 120)
    private String nombreResponsable;

    @NotBlank
    @Size(max = 100)
    private String cargoResponsable;

    @NotBlank
    @Size(max = 50)
    private String documentoResponsable;

    @NotBlank
    @Email
    @Size(max = 150)
    private String correoResponsable;

    @NotBlank
    @Size(max = 20)
    private String telefonoResponsable;

    @NotBlank
    @Size(max = 100)
    private String ciudad;

    @NotBlank
    @Size(max = 100)
    private String departamentoUbicacion;

    @NotBlank
    @Size(max = 250)
    private String direccionExacta;

    @Size(max = 500)
    private String referencia;

    private String personeriaArchivo;
    private String nitArchivo;
    private String identidadArchivo;
    private String domicilioArchivo;

    private List<String> necesidades;
    private List<String> donaciones;

    @NotNull
    private Boolean solicitaVoluntarios;

    private List<String> actividadesVoluntariado;

    @Size(max = 1000)
    private String descripcionVoluntariado;

    private String estado;
}