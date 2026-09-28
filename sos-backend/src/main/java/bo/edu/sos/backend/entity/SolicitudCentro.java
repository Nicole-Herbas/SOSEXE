package bo.edu.sos.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitud_centro")
@Getter
@Setter
@NoArgsConstructor
public class SolicitudCentro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_centro", nullable = false, length = 150)
    private String nombreCentro;

    @Column(name = "tipo_organizacion", nullable = false, length = 100)
    private String tipoOrganizacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "departamento_id", nullable = false)
    private Departamento departamento;

    @Column(nullable = false, length = 50)
    private String nit;

    @Column(name = "personeria_juridica", nullable = false, length = 500)
    private String personeriaJuridica;

    @Column(name = "fecha_fundacion")
    private LocalDate fechaFundacion;

    @Column(name = "pagina_web", length = 500)
    private String paginaWeb;

    @Column(nullable = false, length = 1000)
    private String descripcion;

    @Column(name = "poblacion_atendida", length = 500)
    private String poblacionAtendida;

    @Column(name = "nombre_responsable", nullable = false, length = 120)
    private String nombreResponsable;

    @Column(name = "cargo_responsable", nullable = false, length = 100)
    private String cargoResponsable;

    @Column(name = "documento_responsable", nullable = false, length = 50)
    private String documentoResponsable;

    @Column(name = "correo_responsable", nullable = false, length = 150)
    private String correoResponsable;

    @Column(name = "telefono_responsable", nullable = false, length = 20)
    private String telefonoResponsable;

    @Column(nullable = false, length = 100)
    private String ciudad;

    @Column(name = "departamento_ubicacion", nullable = false, length = 100)
    private String departamentoUbicacion;

    @Column(name = "direccion_exacta", nullable = false, length = 250)
    private String direccionExacta;

    @Column(length = 500)
    private String referencia;

    @Column(name = "personeria_archivo", length = 255)
    private String personeriaArchivo;

    @Column(name = "nit_archivo", length = 255)
    private String nitArchivo;

    @Column(name = "identidad_archivo", length = 255)
    private String identidadArchivo;

    @Column(name = "domicilio_archivo", length = 255)
    private String domicilioArchivo;

    @Column(columnDefinition = "TEXT")
    private String necesidades;

    @Column(columnDefinition = "TEXT")
    private String donaciones;

    @Column(name = "solicita_voluntarios", nullable = false)
    private Boolean solicitaVoluntarios;

    @Column(name = "actividades_voluntariado", columnDefinition = "TEXT")
    private String actividadesVoluntariado;

    @Column(name = "descripcion_voluntariado", length = 1000)
    private String descripcionVoluntariado;

    @Column(nullable = false, length = 30)
    private String estado = "PENDIENTE";

    @Column(name = "fecha_creacion", nullable = false,
            insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion", nullable = false,
            insertable = false, updatable = false)
    private LocalDateTime fechaActualizacion;
}