package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.SuscripcionSmsConstants;
import bo.edu.sos.backend.dto.SuscripcionSmsDTO;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.SuscripcionSms;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.DuplicateResourceException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.helper.LogHelper;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.SuscripcionSmsRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio de negocio para la suscripción a alertas SMS (SOS-63).
 *
 * Gestiona la creación, consulta y existencia de suscripciones.
 * El método de cancelación se implementa en SOS-64.
 */
@Service
public class SuscripcionSmsService {

    private final SuscripcionSmsRepository suscripcionRepository;
    private final UsuarioRepository usuarioRepository;
    private final DepartamentoRepository departamentoRepository;


    public SuscripcionSmsService(
            SuscripcionSmsRepository suscripcionRepository,
            UsuarioRepository usuarioRepository,
            DepartamentoRepository departamentoRepository) {

        this.suscripcionRepository  = suscripcionRepository;
        this.usuarioRepository      = usuarioRepository;
        this.departamentoRepository = departamentoRepository;
    }


    /**
     * Suscribe al usuario a alertas SMS con el teléfono y departamento indicados.
     *
     * Si el usuario ya tiene un registro (activo o cancelado), se actualiza y reactiva.
     * Si no tiene registro, se crea uno nuevo con activa = true.
     *
     * @param emailUsuario email del usuario autenticado
     * @param dto          datos de la suscripción (teléfono + departamentoId)
     * @return DTO con los datos guardados
     */
    @Transactional
    public SuscripcionSmsDTO suscribir(
            String emailUsuario,
            SuscripcionSmsDTO dto) {

        LogHelper.debug(
                SuscripcionSmsService.class,
                "Inicio de suscripción SMS. usuario={}",
                emailUsuario
        );

        Usuario usuario =
                usuarioRepository.findByEmail(emailUsuario)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No existe un usuario con email: "
                                                + emailUsuario
                                )
                        );

        Departamento departamento =
                departamentoRepository
                        .findById(dto.getDepartamentoId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Departamento",
                                        dto.getDepartamentoId()
                                )
                        );

        SuscripcionSms suscripcion =
                suscripcionRepository
                        .findByUsuarioId(usuario.getId())
                        .orElse(null);

        if (suscripcion == null) {
            // Primera suscripción del usuario
            suscripcion = new SuscripcionSms();
            suscripcion.setUsuario(usuario);

            LogHelper.info(
                    SuscripcionSmsService.class,
                    "Nueva suscripción SMS. usuarioId={}, departamentoId={}",
                    usuario.getId(),
                    departamento.getId()
            );
        } else {
            // Ya existe; se actualiza y reactiva
            LogHelper.info(
                    SuscripcionSmsService.class,
                    "Suscripción SMS existente actualizada. usuarioId={}, activaAntes={}",
                    usuario.getId(),
                    suscripcion.getActiva()
            );
        }

        suscripcion.setTelefono(dto.getTelefono());
        suscripcion.setDepartamento(departamento);
        suscripcion.setActiva(true);

        SuscripcionSms guardada = suscripcionRepository.save(suscripcion);

        LogHelper.info(
                SuscripcionSmsService.class,
                "Suscripción SMS guardada. id={}, usuarioId={}, activa={}",
                guardada.getId(),
                usuario.getId(),
                guardada.getActiva()
        );

        return convertirADTO(guardada);
    }


    /**
     * Obtiene la suscripción SMS activa o inactiva del usuario.
     *
     * @param emailUsuario email del usuario autenticado
     * @return DTO de la suscripción
     * @throws ResourceNotFoundException si el usuario no tiene ninguna suscripción
     */
    @Transactional(readOnly = true)
    public SuscripcionSmsDTO obtenerSuscripcion(String emailUsuario) {

        Usuario usuario =
                usuarioRepository.findByEmail(emailUsuario)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No existe un usuario con email: "
                                                + emailUsuario
                                )
                        );

        SuscripcionSms suscripcion =
                suscripcionRepository
                        .findByUsuarioId(usuario.getId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "El usuario no tiene una suscripción SMS registrada"
                                )
                        );

        LogHelper.debug(
                SuscripcionSmsService.class,
                "Suscripción SMS consultada. usuarioId={}, suscripcionId={}, activa={}",
                usuario.getId(),
                suscripcion.getId(),
                suscripcion.getActiva()
        );

        return convertirADTO(suscripcion);
    }


    /**
     * Verifica si el usuario tiene alguna suscripción SMS registrada (activa o no).
     *
     * @param emailUsuario email del usuario autenticado
     * @return true si existe registro, false en caso contrario
     */
    @Transactional(readOnly = true)
    public boolean existeSuscripcion(String emailUsuario) {

        Usuario usuario =
                usuarioRepository.findByEmail(emailUsuario)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No existe un usuario con email: "
                                                + emailUsuario
                                )
                        );

        boolean existe = suscripcionRepository.existsByUsuarioId(
                usuario.getId()
        );

        LogHelper.debug(
                SuscripcionSmsService.class,
                "Verificación de suscripción SMS. usuarioId={}, existe={}",
                usuario.getId(),
                existe
        );

        return existe;
    }


    // ── Helpers privados ────────────────────────────────────────────────────────

    private SuscripcionSmsDTO convertirADTO(SuscripcionSms suscripcion) {

        SuscripcionSmsDTO dto = new SuscripcionSmsDTO();

        dto.setTelefono(suscripcion.getTelefono());
        dto.setActiva(suscripcion.getActiva());
        dto.setConsentimientoFecha(suscripcion.getConsentimientoFecha());

        if (suscripcion.getDepartamento() != null) {
            dto.setDepartamentoId(suscripcion.getDepartamento().getId());
            dto.setDepartamentoNombre(suscripcion.getDepartamento().getNombre());
        }

        return dto;
    }
}
