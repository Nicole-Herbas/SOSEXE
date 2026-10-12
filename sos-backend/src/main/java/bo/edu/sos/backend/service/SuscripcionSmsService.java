package bo.edu.sos.backend.service;

import bo.edu.sos.backend.constants.SuscripcionSmsConstants;
import bo.edu.sos.backend.dto.SuscripcionSmsDTO;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.SuscripcionSms;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.exception.DuplicateResourceException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.helper.LogHelper;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.SuscripcionSmsRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio de negocio para crear, consultar, cambiar el estado y cancelar
 * suscripciones a alertas SMS.
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

        this.suscripcionRepository = suscripcionRepository;
        this.usuarioRepository = usuarioRepository;
        this.departamentoRepository = departamentoRepository;
    }

    /**
     * Crea o actualiza y activa la suscripción del usuario autenticado.
     */
    @Transactional
    public SuscripcionSmsDTO suscribir(
            String emailUsuario,
            SuscripcionSmsDTO dto) {

        validarDatosSuscripcion(dto);

        LogHelper.debug(
                SuscripcionSmsService.class,
                "Inicio de suscripción SMS. usuario={}",
                emailUsuario
        );

        Usuario usuario = obtenerUsuario(emailUsuario);
        Departamento departamento = departamentoRepository
                .findById(dto.getDepartamentoId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Departamento",
                        dto.getDepartamentoId()
                ));

        SuscripcionSms suscripcion = suscripcionRepository
                .findByUsuarioId(usuario.getId())
                .orElseGet(SuscripcionSms::new);

        suscripcion.setUsuario(usuario);
        suscripcion.setTelefono(dto.getTelefono().trim());
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
     * Conserva la firma antigua usada por SOS-69.
     */
    @Transactional
    public SuscripcionSmsDTO suscribir(
            SuscripcionSmsDTO dto,
            String emailUsuario) {
        return suscribir(emailUsuario, dto);
    }

    @Transactional(readOnly = true)
    public SuscripcionSmsDTO obtenerSuscripcion(String emailUsuario) {
        Usuario usuario = obtenerUsuario(emailUsuario);
        SuscripcionSms suscripcion = buscarSuscripcion(usuario);

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
     * Alias de compatibilidad para la ruta /mia de SOS-69.
     */
    @Transactional(readOnly = true)
    public SuscripcionSmsDTO obtenerMia(String emailUsuario) {
        return obtenerSuscripcion(emailUsuario);
    }

    @Transactional(readOnly = true)
    public boolean existeSuscripcion(String emailUsuario) {
        Usuario usuario = obtenerUsuario(emailUsuario);
        boolean existe =
                suscripcionRepository.existsByUsuarioId(usuario.getId());

        LogHelper.debug(
                SuscripcionSmsService.class,
                "Verificación de suscripción SMS. usuarioId={}, existe={}",
                usuario.getId(),
                existe
        );

        return existe;
    }

    /**
     * Cambia el estado a través de la API de compatibilidad SOS-69.
     */
    @Transactional
    public SuscripcionSmsDTO cambiarEstado(
            boolean activa,
            String emailUsuario) {

        Usuario usuario = obtenerUsuario(emailUsuario);
        SuscripcionSms suscripcion = buscarSuscripcion(usuario);
        suscripcion.setActiva(activa);

        SuscripcionSms actualizada = suscripcionRepository.save(suscripcion);
        LogHelper.info(
                SuscripcionSmsService.class,
                "Estado de suscripción SMS actualizado. suscripcionId={}, activa={}",
                actualizada.getId(),
                actualizada.getActiva()
        );

        return convertirADTO(actualizada);
    }

    /**
     * Cancela la suscripción desactivando el registro para conservar el
     * historial de consentimiento.
     */
    @Transactional
    public void cancelar(String emailUsuario) {
        LogHelper.debug(
                SuscripcionSmsService.class,
                "Inicio de cancelación de suscripción SMS. usuario={}",
                emailUsuario
        );

        Usuario usuario = obtenerUsuario(emailUsuario);
        SuscripcionSms suscripcion = buscarSuscripcion(usuario);

        if (Boolean.FALSE.equals(suscripcion.getActiva())) {
            LogHelper.warn(
                    SuscripcionSmsService.class,
                    "Intento de cancelar una suscripción SMS ya inactiva. usuarioId={}",
                    usuario.getId()
            );
            throw new DuplicateResourceException(
                    SuscripcionSmsConstants.ERROR_SUSCRIPCION_YA_CANCELADA
            );
        }

        suscripcion.setActiva(false);
        suscripcionRepository.save(suscripcion);

        LogHelper.info(
                SuscripcionSmsService.class,
                "Suscripción SMS cancelada exitosamente. usuarioId={}, suscripcionId={}",
                usuario.getId(),
                suscripcion.getId()
        );
    }

    private void validarDatosSuscripcion(SuscripcionSmsDTO dto) {
        if (dto == null || dto.getTelefono() == null
                || dto.getTelefono().isBlank()) {
            throw new BadRequestException(
                    SuscripcionSmsConstants.ERROR_TELEFONO_REQUERIDO
            );
        }
        if (!java.util.regex.Pattern.matches(
                SuscripcionSmsConstants.REGEX_TELEFONO,
                dto.getTelefono().trim())) {
            throw new BadRequestException(
                    SuscripcionSmsConstants.ERROR_TELEFONO_FORMATO
            );
        }
        if (dto.getDepartamentoId() == null) {
            throw new BadRequestException(
                    SuscripcionSmsConstants.ERROR_DEPARTAMENTO_REQUERIDO
            );
        }
    }

    private Usuario obtenerUsuario(String emailUsuario) {
        return usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe un usuario con email: " + emailUsuario
                ));
    }

    private SuscripcionSms buscarSuscripcion(Usuario usuario) {
        return suscripcionRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "El usuario no tiene una suscripción SMS registrada"
                ));
    }

    private SuscripcionSmsDTO convertirADTO(SuscripcionSms suscripcion) {
        SuscripcionSmsDTO dto = new SuscripcionSmsDTO();
        dto.setId(suscripcion.getId());
        dto.setTelefono(suscripcion.getTelefono());
        dto.setActiva(suscripcion.getActiva());
        dto.setConsentimientoFecha(suscripcion.getConsentimientoFecha());

        if (suscripcion.getUsuario() != null) {
            dto.setUsuarioId(suscripcion.getUsuario().getId());
            dto.setUsuarioNombre(suscripcion.getUsuario().getNombre());
        }
        if (suscripcion.getDepartamento() != null) {
            dto.setDepartamentoId(suscripcion.getDepartamento().getId());
            dto.setDepartamentoNombre(suscripcion.getDepartamento().getNombre());
        }

        return dto;
    }
}
