package bo.edu.sos.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "envio_sms",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_envio_sms_alerta_usuario",
                columnNames = {"alerta_id", "usuario_id"}))
@Getter
@Setter
@NoArgsConstructor
public class EnvioSms {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "alerta_id", nullable = false)
    private Alerta alerta;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 40)
    private String proveedor;

    @Column(name = "external_id", length = 150)
    private String externalId;

    @Column(nullable = false, length = 30)
    private String estado = "PENDIENTE";

    @Column(nullable = false)
    private Integer intentos = 0;

    @Column(name = "enviado_en")
    private LocalDateTime enviadoEn;

    @Column(name = "error_mensaje", length = 500)
    private String errorMensaje;

    @Column(name = "fecha_creacion", nullable = false, insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;
}
