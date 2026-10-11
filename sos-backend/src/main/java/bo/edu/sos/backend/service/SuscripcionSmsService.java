package bo.edu.sos.backend.service;

import bo.edu.sos.backend.dto.SuscripcionSmsDTO;
import bo.edu.sos.backend.entity.Departamento;
import bo.edu.sos.backend.entity.SuscripcionSms;
import bo.edu.sos.backend.entity.Usuario;
import bo.edu.sos.backend.exception.BadRequestException;
import bo.edu.sos.backend.exception.ResourceNotFoundException;
import bo.edu.sos.backend.repository.DepartamentoRepository;
import bo.edu.sos.backend.repository.SuscripcionSmsRepository;
import bo.edu.sos.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SuscripcionSmsService {

    private final SuscripcionSmsRepository suscripcionSmsRepository;
    private final UsuarioRepository usuarioRepository;
    private final DepartamentoRepository departamentoRepository;

    public SuscripcionSmsService(
            SuscripcionSmsRepository suscripcionSmsRepository,
            UsuarioRepository usuarioRepository,
            DepartamentoRepository departamentoRepository) {

        this.suscripcionSmsRepository = suscripcionSmsRepository;
        this.usuarioRepository = usuarioRepository;
        this.departamentoRepository = departamentoRepository;
    }

    @Transactional(readOnly = true)
    public SuscripcionSmsDTO obtenerMia(String emailAutenticado) {

        Usuario usuario = usuarioRepository
                .findByEmail(emailAutenticado)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe un usuario con email: " + emailAutenticado));

        SuscripcionSms suscripcion = suscripcionSmsRepository
                .findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "El usuario no tiene una suscripción SMS registrada"));

        return convertirADTO(suscripcion);
    }

    @Transactional
    public SuscripcionSmsDTO suscribir(
            SuscripcionSmsDTO dto,
            String emailAutenticado) {

        if (dto.getTelefono() == null || dto.getTelefono().isBlank()) {
            throw new BadRequestException("El teléfono es obligatorio");
        }

        Usuario usuario = usuarioRepository
                .findByEmail(emailAutenticado)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe un usuario con email: " + emailAutenticado));

        Departamento departamento = departamentoRepository
                .findById(dto.getDepartamentoId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Departamento", dto.getDepartamentoId()));

        SuscripcionSms suscripcion = suscripcionSmsRepository
                .findByUsuarioId(usuario.getId())
                .orElse(new SuscripcionSms());

        suscripcion.setUsuario(usuario);
        suscripcion.setTelefono(dto.getTelefono());
        suscripcion.setDepartamento(departamento);
        suscripcion.setActiva(true);

        SuscripcionSms guardada = suscripcionSmsRepository.save(suscripcion);

        return convertirADTO(guardada);
    }

    @Transactional
    public SuscripcionSmsDTO cambiarEstado(
            boolean activa,
            String emailAutenticado) {

        Usuario usuario = usuarioRepository
                .findByEmail(emailAutenticado)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe un usuario con email: " + emailAutenticado));

        SuscripcionSms suscripcion = suscripcionSmsRepository
                .findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "El usuario no tiene una suscripción SMS registrada"));

        suscripcion.setActiva(activa);

        SuscripcionSms actualizada = suscripcionSmsRepository.save(suscripcion);

        return convertirADTO(actualizada);
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